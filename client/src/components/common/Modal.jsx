import './Modal.css';

function Modal({ isOpen, ariaLabel, className, children }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="presentation">
      <div
        className={`modal${className ? ` ${className}` : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
      >
        {children}
      </div>
    </div>
  );
}

export default Modal;
