import Modal from '../common/Modal';

// Triggered by the × button on a schedule row (ScheduleRow). Deleting a row
// removes every block in it, so this confirmation guards against an accidental
// misclick — same pattern as CopyPreviousModal / SaveConfirmModal.
function DeleteRowModal({ isOpen, rowLabel, isDeleting, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} ariaLabel="Confirm removing this row">
      <h2>Remove this row?</h2>
      <p>
        Are you sure you want to remove {rowLabel}? This will delete all of its scheduled blocks.
      </p>
      <div className="modal-actions">
        <button type="button" disabled={isDeleting} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="primary" disabled={isDeleting} onClick={onConfirm}>
          {isDeleting ? 'Removing…' : 'Yes — Remove'}
        </button>
      </div>
    </Modal>
  );
}

export default DeleteRowModal;
