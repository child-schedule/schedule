import { useEffect } from 'react';
import './ErrorToast.css';

const AUTO_DISMISS_MS = 5000;

function ErrorToast({ message, onDismiss }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onDismiss, AUTO_DISMISS_MS);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (!message) return null;

  return (
    <div className="error-toast" role="alert">
      <span>{message}</span>
      <button type="button" className="error-toast__dismiss" aria-label="Dismiss" onClick={onDismiss}>
        ×
      </button>
    </div>
  );
}

export default ErrorToast;
