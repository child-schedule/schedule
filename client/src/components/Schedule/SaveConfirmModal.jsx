import Modal from '../common/Modal';

// Shown when re-saving a day that already has a published schedule — the
// user is about to overwrite it with whatever's currently in the draft.
// A first-time save (nothing published yet) skips this and saves directly.
function SaveConfirmModal({ isOpen, onConfirm, onCancel }) {
  return (
    <Modal isOpen={isOpen} ariaLabel="Confirm saving changes">
      <h2>Save changes?</h2>
      <p>
        You&apos;ve edited this schedule since it was last saved. Saving now will replace the
        previously saved version with these changes.
      </p>
      <div className="modal-actions">
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="primary" onClick={onConfirm}>
          Yes — Save
        </button>
      </div>
    </Modal>
  );
}

export default SaveConfirmModal;
