import { useState } from 'react';
import AddEntityForm from './AddEntityForm';
import { useClassrooms } from '../../context/ClassroomsContext';

function ClassroomSelector({ selectedId, onSelect }) {
  const { classrooms, addClassroom, removeClassroom } = useClassrooms();
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="entity-selector">
      <h3 className="entity-selector__title">Classroom</h3>
      <ul className="entity-selector__list">
        {classrooms.map((classroom) => (
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
              className="entity-selector__delete"
              aria-label={`Delete ${classroom.name}`}
              onClick={() => removeClassroom(classroom._id)}
            >
              ×
            </button>
          </li>
        ))}
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
