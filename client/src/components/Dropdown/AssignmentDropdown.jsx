import { useState } from 'react';
import Modal from '../common/Modal';
import TeacherSelector from './TeacherSelector';
import ClassroomSelector from './ClassroomSelector';
import { addRow, saveBlock } from '../../api/scheduleApi';
import { formatDisplayTime } from '../../utils/timeSlots';
import { useTeachers } from '../../context/TeachersContext';
import { useClassrooms } from '../../context/ClassroomsContext';
import './Dropdown.css';

// Opened after a drag-to-select. `selection.rowId` is null when the drag
// happened on the grid's trailing placeholder row (no teacher/classroom yet),
// in which case only "Teacher + Classroom" is available — see PROGRESS.md.
function AssignmentDropdown({ isOpen, selection, date, rows, onScheduleUpdate, onClose }) {
  const { teachers } = useTeachers();
  const { classrooms } = useClassrooms();

  const [step, setStep] = useState('choose');
  const [selectedTeacherId, setSelectedTeacherId] = useState(selection?.teacherId || null);
  const [selectedClassroomId, setSelectedClassroomId] = useState(selection?.classroomId || null);
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
    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await saveBlock(date, selection.rowId, {
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

  async function handleConfirmTeacherClassroom() {
    setIsSubmitting(true);
    setError(null);
    try {
      const existingRow = rows.find(
        (r) => r.teacherId === selectedTeacherId && r.classroomId === selectedClassroomId
      );

      let targetRowId = existingRow?.rowId;
      if (!targetRowId) {
        const updatedAfterRow = await addRow(date, selectedTeacherId, selectedClassroomId);
        const newRow = updatedAfterRow.rows.find(
          (r) => r.teacherId === selectedTeacherId && r.classroomId === selectedClassroomId
        );
        targetRowId = newRow.rowId;
      }

      const updated = await saveBlock(date, targetRowId, {
        startTime: selection.startTime,
        endTime: selection.endTime,
        status: 'green',
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
      <h2>{selection.rowLabel}</h2>
      <p className="assignment-dropdown__time">{timeRangeLabel}</p>

      {error && <p className="assignment-dropdown__error">{error}</p>}

      {step === 'choose' && (
        <div className="assignment-dropdown__options">
          <button type="button" className="primary" onClick={() => setStep('teacherClassroom')}>
            Teacher + Classroom
          </button>
          <button
            type="button"
            disabled={!selection.rowId || isSubmitting}
            title={!selection.rowId ? 'Assign a teacher and classroom first' : undefined}
            onClick={() => submitDirectBlock('yellow')}
          >
            Break
          </button>
          <button
            type="button"
            disabled={!selection.rowId || isSubmitting}
            title={!selection.rowId ? 'Assign a teacher and classroom first' : undefined}
            onClick={() => submitDirectBlock('orange')}
          >
            Meet Front Office
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
    </Modal>
  );
}

export default AssignmentDropdown;
