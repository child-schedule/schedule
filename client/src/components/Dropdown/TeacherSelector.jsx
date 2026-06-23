import { useState } from 'react';
import AddEntityForm from './AddEntityForm';
import { useTeachers } from '../../context/TeachersContext';

function TeacherSelector({ selectedId, onSelect }) {
  const { teachers, addTeacher, removeTeacher, renameTeacher } = useTeachers();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');

  function startEditing(teacher) {
    setEditingId(teacher._id);
    setEditingName(teacher.name);
  }

  async function saveEdit() {
    const trimmed = editingName.trim();
    if (trimmed) await renameTeacher(editingId, trimmed);
    setEditingId(null);
  }

  return (
    <div className="entity-selector">
      <h3 className="entity-selector__title">Teacher</h3>
      <ul className="entity-selector__list">
        {teachers.map((teacher) =>
          editingId === teacher._id ? (
            <li key={teacher._id} className="entity-selector__row">
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
            <li key={teacher._id} className="entity-selector__row">
              <button
                type="button"
                className={`entity-selector__item${
                  selectedId === teacher._id ? ' entity-selector__item--selected' : ''
                }`}
                onClick={() => onSelect(teacher._id)}
              >
                {teacher.name}
              </button>
              <button
                type="button"
                className="entity-selector__edit"
                aria-label={`Rename ${teacher.name}`}
                onClick={() => startEditing(teacher)}
              >
                ✎
              </button>
              <button
                type="button"
                className="entity-selector__delete"
                aria-label={`Delete ${teacher.name}`}
                onClick={() => removeTeacher(teacher._id)}
              >
                ×
              </button>
            </li>
          )
        )}
      </ul>

      {showAddForm ? (
        <AddEntityForm
          label="Teacher"
          placeholder="Teacher name"
          onAdd={addTeacher}
          onAdded={(created, keepOpen) => {
            onSelect(created._id);
            if (!keepOpen) setShowAddForm(false);
          }}
        />
      ) : (
        <button type="button" className="entity-selector__add" onClick={() => setShowAddForm(true)}>
          + Add new teacher
        </button>
      )}
    </div>
  );
}

export default TeacherSelector;
