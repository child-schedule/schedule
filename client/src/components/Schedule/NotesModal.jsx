import { useState } from 'react';
import Modal from '../common/Modal';

// Triggered by the Notes button on the schedule page (gated the same as
// Print — enabled once the schedule has been published). One overwritable
// note per date; OK saves it, Cancel discards any unsaved edits in the box.
//
// Parent remounts this component on every open (via a `key` that flips each
// time, see SchedulePage.jsx) so `draft` re-initializes from the current
// saved note each time the modal opens, instead of a previous cancel leaving
// stale edits behind — avoids a setState-in-effect just to sync a prop.
function NotesModal({ isOpen, notes, isSaving, onSave, onCancel }) {
  const [draft, setDraft] = useState(notes || '');

  return (
    <Modal isOpen={isOpen} ariaLabel="Edit schedule notes">
      <h2>Notes</h2>
      <p>This note will appear at the bottom of the printed schedule.</p>
      <textarea
        className="notes-modal__textarea"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={6}
        autoFocus
      />
      <div className="modal-actions">
        <button type="button" disabled={isSaving} onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="primary" disabled={isSaving} onClick={() => onSave(draft)}>
          {isSaving ? 'Saving…' : 'OK'}
        </button>
      </div>
    </Modal>
  );
}

export default NotesModal;
