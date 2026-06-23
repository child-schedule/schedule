import { useState } from 'react';
import AddEntityForm from './AddEntityForm';
import { useClassrooms } from '../../context/ClassroomsContext';

function ClassroomSelector({ selectedId, onSelect }) {
  const { classrooms, addClassroom, removeClassroom, renameClassroom } = useClassrooms();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  function startEditing(classroom) {
    setEditingId(classroom._id);
    setEditingName(classroom.name);
  }

  async function saveEdit() {
    const trimmed = editingName.trim();
    if (trimmed) await renameClassroom(editingId, trimmed);
    setEditingId(null);
  }

  return (
    <div className="entity-selector">
      <h3 className="entity-selector__title">Classroom</h3>
      <ul className="entity-selector__list">
        {classrooms.map((classroom) =>
          editingId === classroom._id ? (
            <li key={classroom._id} className="entity-selector__row">
              <input
                type="text"
                className="entity-selector__edit-input"
                value={editingName}
                autoFocus
                onChange={(e) => setEditingName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveEdit();
                  if (e.key === 'Escape') setEditingId(null);
                }}
              />
              <button type="button" className="entity-selector__save" onClick={saveEdit}>
                Save
              </button>
              <button type="button" className="entity-selector__cancel" onClick={() => setEditingId(null)}>
                Cancel
              </button>
            </li>
          ) : (
            <li key={classroom._id} className="entity-selector__row">
              <button
                type="button"
                className={`entity-selector__item${
                  selectedId === classroom._id ? ' entity-selector__item--selected' : ''
                }`}
                onClick={() => onSelect(classroom._id)}
              >
                {classroom.name}
              </button>
              <button
                type="button"
                className="entity-selector__edit"
                aria-label={`Rename ${classroom.name}`}
                onClick={() => startEditing(classroom)}
              >
                ✎
              </button>
              <button
                type="button"
                className="entity-selector__delete"
                aria-label={`Delete ${classroom.name}`}
                onClick={() => removeClassroom(classroom._id)}
              >
                ×
              </button>
            </li>
          )
        )}
      </ul>

      {showAddForm ? (
        <AddEntityForm
          label="Classroom"
          placeholder="Classroom name"
          onAdd={addClassroom}
          onAdded={(created, keepOpen) => {
            onSelect(created._id);
            if (!keepOpen) setShowAddForm(false);
          }}
        />
      ) : (
        <button type="button" className="entity-selector__add" onClick={() => setShowAddForm(true)}>
          + Add new classroom
        </button>
      )}
    </div>
  );
}

export default ClassroomSelector;
