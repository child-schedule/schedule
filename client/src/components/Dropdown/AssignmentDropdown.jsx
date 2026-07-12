import { useState } from 'react';
import Modal from '../common/Modal';
import ErrorToast from '../common/ErrorToast';
import TeacherSelector from './TeacherSelector';
import ClassroomSelector from './ClassroomSelector';
import { addRow, saveBlock, deleteBlock } from '../../api/scheduleApi';
import { formatDisplayTime } from '../../utils/timeSlots';
import { getStatusLabel } from '../../utils/colorMap';
import { useConflictCheck } from '../../hooks/useConflictCheck';
import { useTeachers } from '../../context/TeachersContext';
import { useClassrooms } from '../../context/ClassroomsContext';
import './Dropdown.css';

// Opened after a drag-to-select. `selection.rowId` is null when the drag
// happened on the grid's trailing placeholder row (no teacher/classroom yet).
// All 4 options are always clickable; Break/Meet Front Office/Lesson Planning
// on a rowId-less selection defer to the teacher/classroom picker instead of
// saving immediately — see handleOptionClick below.
function AssignmentDropdown({ isOpen, selection, date, rows, onScheduleUpdate, onClose }) {
  const { teachers } = useTeachers();
  const { classrooms } = useClassrooms();
  const checkConflict = useConflictCheck();

  const isEditing = Boolean(selection?.blockId);

  const [step, setStep] = useState(isEditing && selection.status === 'green' ? 'teacherClassroom' : 'choose');
  const [selectedTeacherId, setSelectedTeacherId] = useState(selection?.teacherId || null);
  const [selectedClassroomId, setSelectedClassroomId] = useState(selection?.classroomId || null);
  // What status the eventual block will be saved with once a teacher+classroom
  // is confirmed. Defaults to 'green' (the "Teacher + Classroom" button's own
  // path, and editing an existing green block). Only ever set to something
  // else when Break/Meet Front Office/Lesson Planning is clicked on a
  // brand-new row (no selection.rowId yet) — see handleOptionClick below.
  const [pendingStatus, setPendingStatus] = useState('green');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!selection) return null;

  const timeRangeLabel = `${formatDisplayTime(selection.startTime)} – ${formatDisplayTime(selection.endTime)}`;
  const selectedTeacherName = teachers.find((t) => t._id === selectedTeacherId)?.name;
  const selectedClassroomName = classrooms.find((c) => c._id === selectedClassroomId)?.name;

  function describeError(err) {
    return err.response?.data?.error || 'Something went wrong. Try again.';
  }

  async function submitDirectBlock(status) {
    const conflict = checkConflict(rows, {
      teacherId: selection.teacherId,
      startTime: selection.startTime,
      endTime: selection.endTime,
      status,
      excludeBlockId: selection.blockId,
    });
    if (conflict) {
      setError(conflict);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await saveBlock(date, selection.rowId, {
        blockId: selection.blockId,
        startTime: selection.startTime,
        endTime: selection.endTime,
        status,
      });
      onScheduleUpdate(updated);
      onClose();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  // Break/Meet Front Office/Lesson Planning on an already-existing row still
  // save immediately (unchanged). On a brand-new row (no rowId yet) they now
  // defer to the same teacher/classroom picker "Teacher + Classroom" uses,
  // remembering which status to actually save once that's confirmed —
  // instead of being disabled until a row exists.
  function handleOptionClick(status) {
    if (selection.rowId) {
      submitDirectBlock(status);
    } else {
      setPendingStatus(status);
      setStep('teacherClassroom');
    }
  }

  async function handleConfirmTeacherClassroom() {
    const conflict = checkConflict(rows, {
      teacherId: selectedTeacherId,
      startTime: selection.startTime,
      endTime: selection.endTime,
      status: pendingStatus,
      excludeBlockId: selection.blockId,
    });
    if (conflict) {
      setError(conflict);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const existingRow = rows.find(
        (r) => r.teacherId === selectedTeacherId && r.classroomId === selectedClassroomId
      );

      let targetRowId = existingRow?.rowId;
      if (!targetRowId) {
        const updatedAfterRow = await addRow(date, selectedTeacherId, selectedClassroomId);
        const newRow = updatedAfterRow.draftRows.find(
          (r) => r.teacherId === selectedTeacherId && r.classroomId === selectedClassroomId
        );
        targetRowId = newRow.rowId;
      }

      // Editing a block but moving it to a different teacher+classroom pairing:
      // the blockId only exists on the original row, so delete it there first
      // instead of passing blockId through (which would silently no-op into a
      // duplicate create on the target row).
      const isMovingToAnotherRow = isEditing && targetRowId !== selection.rowId;
      if (isMovingToAnotherRow) {
        await deleteBlock(date, selection.rowId, selection.blockId);
      }

      const updated = await saveBlock(date, targetRowId, {
        blockId: isMovingToAnotherRow ? undefined : selection.blockId,
        startTime: selection.startTime,
        endTime: selection.endTime,
        status: pendingStatus,
      });
      onScheduleUpdate(updated);
      onClose();
    } catch (err) {
      setError(describeError(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} ariaLabel="Assign this time block" className="modal--wide">
      <h2>{isEditing ? 'Edit assignment' : selection.rowLabel}</h2>
      {isEditing && <p className="assignment-dropdown__row-label">{selection.rowLabel}</p>}
      <p className="assignment-dropdown__time">{timeRangeLabel}</p>

      {step === 'choose' && (
        <div className="assignment-dropdown__options">
          <button
            type="button"
            className="primary"
            onClick={() => {
              setPendingStatus('green');
              setStep('teacherClassroom');
            }}
          >
            Teacher + Classroom
          </button>
          <button type="button" disabled={isSubmitting} onClick={() => handleOptionClick('yellow')}>
            Break
          </button>
          <button type="button" disabled={isSubmitting} onClick={() => handleOptionClick('orange')}>
            Meet Front Office
          </button>
          <button type="button" disabled={isSubmitting} onClick={() => handleOptionClick('blue')}>
            Lesson Planning
          </button>
        </div>
      )}

      {step === 'teacherClassroom' && (
        <>
          <div className="assignment-dropdown__panels">
            <TeacherSelector selectedId={selectedTeacherId} onSelect={setSelectedTeacherId} />
            <ClassroomSelector selectedId={selectedClassroomId} onSelect={setSelectedClassroomId} />
          </div>
          {selectedTeacherName && selectedClassroomName && (
            <p className="assignment-dropdown__summary">
              {pendingStatus !== 'green' && (
                <>
                  <strong>{getStatusLabel(pendingStatus)}</strong> will be added for {selectedTeacherName} in{' '}
                  {selectedClassroomName}.
                  <br />
                </>
              )}
              {selectedTeacherName} · {selectedClassroomName} → row will be labeled &quot;
              {selectedClassroomName} - {selectedTeacherName}&quot;
            </p>
          )}
        </>
      )}

      <div className="modal-actions">
        {step === 'teacherClassroom' && (
          <button type="button" disabled={isSubmitting} onClick={() => setStep('choose')}>
            Back
          </button>
        )}
        <button type="button" disabled={isSubmitting} onClick={onClose}>
          Cancel
        </button>
        {step === 'teacherClassroom' && (
          <button
            type="button"
            className="primary"
            disabled={!selectedTeacherId || !selectedClassroomId || isSubmitting}
            onClick={handleConfirmTeacherClassroom}
          >
            Confirm
          </button>
        )}
      </div>

      <ErrorToast message={error} onDismiss={() => setError(null)} />
    </Modal>
  );
}

export default AssignmentDropdown;
