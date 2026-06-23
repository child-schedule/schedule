import { useState } from 'react';

// Reusable inline "add new" form for the teacher/classroom selector panels.
// `onAdd` persists the entity; `onAdded(created, keepOpen)` lets the parent
// auto-select it and decide whether to close the form (per the spec: "Add"
// closes, "Add another X" keeps it open).
function AddEntityForm({ label, placeholder, onAdd, onAdded }) {
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  async function submit(keepOpen) {
    const trimmed = name.trim();
    if (!trimmed) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const created = await onAdd(trimmed);
      setName('');
      onAdded(created, keepOpen);
    } catch {
      setError('Could not add. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="add-entity-form">
      <input
        type="text"
        value={name}
        placeholder={placeholder}
        aria-label={label}
        disabled={isSubmitting}
        onChange={(e) => setName(e.target.value)}
      />
      {error && <p className="add-entity-form__error">{error}</p>}
      <div className="add-entity-form__actions">
        <button type="button" disabled={isSubmitting || !name.trim()} onClick={() => submit(false)}>
          Add
        </button>
        <button type="button" disabled={isSubmitting || !name.trim()} onClick={() => submit(true)}>
          Add another {label.toLowerCase()}
        </button>
      </div>
    </div>
  );
}

export default AddEntityForm;
