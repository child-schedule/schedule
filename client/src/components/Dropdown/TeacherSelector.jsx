import { useState } from 'react';
import AddEntityForm from './AddEntityForm';
import { useTeachers } from '../../context/TeachersContext';

function TeacherSelector({ selectedId, onSelect }) {
  const { teachers, addTeacher, removeTeacher } = useTeachers();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="entity-selector">
      <h3 className="entity-selector__title">Teacher</h3>
      <ul className="entity-selector__list">
        {teachers.map((teacher) => (
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
              className="entity-selector__delete"
              aria-label={`Delete ${teacher.name}`}
              onClick={() => removeTeacher(teacher._id)}
            >
              ×
            </button>
          </li>
        ))}
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
