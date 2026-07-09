import { useCallback, useMemo } from 'react';
import Modal from '../common/Modal';
import TeacherDayGrid from './TeacherDayGrid';
import ClassroomDayGrid from './ClassroomDayGrid';
import { useTeachers } from '../../context/TeachersContext';
import { useClassrooms } from '../../context/ClassroomsContext';
import { buildSlots } from '../../utils/teacherScheduleStates';
import { buildClassroomSlots, groupClassroomSlots } from '../../utils/classroomScheduleSlots';
import { parseRowLabel } from '../../utils/rowLabel';
import './DayDetailModal.css';

function byStartTime(a, b) {
  return a.startTime < b.startTime ? -1 : a.startTime > b.startTime ? 1 : 0;
}

// Popup opened by clicking a teacher's or classroom's name anywhere in the
// schedule grid (see ScheduleRow/ScheduleGrid). Per Phase 3 §3 of
// childcare-scheduling-phase3-plan.md, this must:
//   - aggregate across EVERY row in the current draft that matches the
//     clicked teacher/classroom id, not just the row that was clicked
//   - read live from `rows` (schedule.draftRows), so it reflects unsaved
//     in-progress edits instantly — no API call, no loading state
//   - reuse the archived Phase 2 rendering logic (adapted into
//     TeacherDayGrid / ClassroomDayGrid) rather than being rebuilt
//
// `target` is `{ type: 'teacher' | 'classroom', id }` or null (closed).
function DayDetailModal({ target, rows, dateLabel, onClose }) {
  const { teachers } = useTeachers();
  const { classrooms } = useClassrooms();

  // `type` is 'teacher' or 'classroom' — used only for the fallback path, to
  // know which half of a matching row's frozen rowLabel to read. The live
  // lookup is always tried first (authoritative — reflects renames), and
  // only falls back to a rowLabel-derived name when the id truly doesn't
  // resolve against the current teachers/classrooms lists (e.g. deleted).
  const nameOf = useCallback(
    (list, id, type) => {
      const liveName = list.find((item) => item._id === id)?.name;
      if (liveName) return liveName;

      const matchingRow = rows.find((row) =>
        type === 'teacher' ? row.teacherId === id : row.classroomId === id
      );
      const parsed = matchingRow ? parseRowLabel(matchingRow.rowLabel) : null;
      const fallbackName = type === 'teacher' ? parsed?.teacherName : parsed?.classroomName;

      return fallbackName ?? 'Unknown';
    },
    [rows]
  );

  const teacherSlots = useMemo(() => {
    if (!target || target.type !== 'teacher') return [];

    const blocks = rows
      .filter((row) => row.teacherId === target.id)
      .flatMap((row) => {
        const classroomName = nameOf(classrooms, row.classroomId, 'classroom');
        return row.blocks.map((block) => ({
          ...block,
          // classroomName only makes sense for the active (green) block —
          // mirrors the old GET /api/schedule/:date/teacher/:teacherId shape.
          classroomName: block.status === 'green' ? classroomName : null,
        }));
      })
      .sort(byStartTime);

    return buildSlots(blocks);
  }, [target, rows, classrooms, nameOf]);

  const classroomGroups = useMemo(() => {
    if (!target || target.type !== 'classroom') return [];

    const teacherEntries = rows
      .filter((row) => row.classroomId === target.id)
      .map((row) => ({
        teacherName: nameOf(teachers, row.teacherId, 'teacher'),
        // Yellow/orange excluded — a teacher on break or at the front office
        // is not "present" in the classroom. Mirrors the old classroom-view API.
        blocks: row.blocks
          .filter((block) => block.status === 'green')
          .map((block) => ({ startTime: block.startTime, endTime: block.endTime }))
          .sort(byStartTime),
      }))
      .filter((entry) => entry.blocks.length > 0);

    return groupClassroomSlots(buildClassroomSlots(teacherEntries));
  }, [target, rows, teachers, nameOf]);

  const isOpen = Boolean(target);
  const title = !target
    ? ''
    : target.type === 'teacher'
      ? nameOf(teachers, target.id, 'teacher')
      : nameOf(classrooms, target.id, 'classroom');

  return (
    <Modal
      isOpen={isOpen}
      ariaLabel={title ? `${title}'s schedule for today` : 'Schedule detail'}
      className="modal--wide day-detail-modal"
    >
      <div className="day-detail__header">
        <div>
          <h2>{title}</h2>
          {dateLabel && <p className="day-detail__date">{dateLabel}</p>}
        </div>
        <button type="button" className="day-detail__close" aria-label="Close" onClick={onClose}>
          ×
        </button>
      </div>

      {target?.type === 'teacher' && <TeacherDayGrid teacherName={title} slots={teacherSlots} />}
      {target?.type === 'classroom' && <ClassroomDayGrid classroomName={title} groups={classroomGroups} />}
    </Modal>
  );
}

export default DayDetailModal;
