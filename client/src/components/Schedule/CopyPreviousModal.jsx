import Modal from '../common/Modal';

// Triggered by the always-available "Copy Previous Day" button (as opposed to
// CopyDayModal's one-time prompt on a brand-new date) — lets the user replace
// the current draft with the previous day's published schedule at any time.
// Confirmation is required since this discards whatever is currently in the draft.
function CopyPreviousModal({ isOpen, previousDateKey, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} ariaLabel="Copy previous day's schedule">
      <h2>Apply {previousDateKey}&apos;s schedule?</h2>
      <p>
        This will replace everything currently in your draft for this date with the saved
        schedule from {previousDateKey}. You can still edit it afterward.
      </p>
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="primary" onClick={onConfirm}>
          Yes — Apply
        </button>
      </div>
    </Modal>
  );
}

export default CopyPreviousModal;
