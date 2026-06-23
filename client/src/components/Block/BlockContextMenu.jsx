import { useState } from 'react';
import Modal from '../common/Modal';
import { formatDisplayTime } from '../../utils/timeSlots';
import { getStatusLabel } from '../../utils/colorMap';
import { deleteBlock } from '../../api/scheduleApi';

// Shown when an existing (non-white) block is clicked, per the project plan:
// "Clicking an already-assigned block opens a context menu with Edit and Delete."
function BlockContextMenu({ isOpen, block, date, onEdit, onScheduleUpdate, onClose }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  if (!block) return null;

  async function handleDelete() {
    setIsDeleting(true);
    setError(null);
    try {
      const updated = await deleteBlock(date, block.rowId, block.blockId);
      onScheduleUpdate(updated);
      onClose();
    } catch {
      setError('Could not delete this block. Try again.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Modal isOpen={isOpen} ariaLabel="Edit or delete this block">
      <h2>{block.rowLabel}</h2>
      <p className="assignment-dropdown__time">
        {formatDisplayTime(block.startTime)} – {formatDisplayTime(block.endTime)} ·{' '}
        {getStatusLabel(block.status)}
      </p>
      {error && <p className="assignment-dropdown__error">{error}</p>}
      <div className="modal-actions">
        <button type="button" disabled={isDeleting} onClick={onClose}>
          Close
        </button>
        <button type="button" disabled={isDeleting} onClick={handleDelete}>
          Delete
        </button>
        <button type="button" className="primary" disabled={isDeleting} onClick={() => onEdit(block)}>
          Edit
        </button>
      </div>
    </Modal>
  );
}

export default BlockContextMenu;
