import Modal from '../common/Modal';

// Stub for now — opened with the drag selection's row + time range.
// The three assignment options (Teacher + Classroom / Break / Meet Front
// Office) are built in Layer 11.
function AssignmentDropdown({ isOpen, selection, onClose }) {
  if (!selection) return null;

  return (
    <Modal isOpen={isOpen} ariaLabel="Assign this time block">
      <h2>{selection.rowLabel}</h2>
      <p>
        {selection.startTime} – {selection.endTime}
      </p>
      <p>Assignment options placeholder — built in Layer 11.</p>
      <div className="modal-actions">
        <button type="button" onClick={onClose}>
          Close
        </button>
      </div>
    </Modal>
  );
}

export default AssignmentDropdown;
