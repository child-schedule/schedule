import Modal from '../common/Modal';

function CopyDayModal({ isOpen, previousDateKey, onCopy, onStartFresh }) {
  return (
    <Modal isOpen={isOpen} ariaLabel="Copy previous day's schedule">
      <h2>Copy schedule from {previousDateKey}?</h2>
      <p>
        A schedule already exists for {previousDateKey}. Do you want to copy it to today, or
        start fresh?
      </p>
      <div className="modal-actions">
        <button type="button" onClick={onStartFresh}>
          No – Start Fresh
        </button>
        <button type="button" className="primary" onClick={onCopy}>
          Yes – Copy
        </button>
      </div>
    </Modal>
  );
}

export default CopyDayModal;
