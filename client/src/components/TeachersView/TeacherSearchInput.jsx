import { useState, useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Typeahead teacher selector.
 * Props:
 *   onSelect(teacher) — called with { _id, name } when a teacher is chosen
 */
export default function TeacherSearchInput({ onSelect }) {
  const [allTeachers, setAllTeachers] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch teacher list once on mount
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/teachers`)
      .then((r) => r.json())
      .then((data) => setAllTeachers(Array.isArray(data) ? data : []))
      .catch(() => {});
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleMouseDown(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, []);

  function getFiltered(value) {
    const lower = value.trim().toLowerCase();
    if (!lower) return allTeachers;
    return allTeachers.filter((t) => t.name.toLowerCase().includes(lower));
  }

  function handleInputChange(e) {
    const val = e.target.value;
    setInputValue(val);
    setFiltered(getFiltered(val));
    setIsOpen(true);
    setHighlightedIndex(-1);
  }

  function handleFocus() {
    setFiltered(getFiltered(inputValue));
    setIsOpen(true);
    setHighlightedIndex(-1);
  }

  function selectTeacher(teacher) {
    setInputValue(teacher.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onSelect(teacher);
    // Return focus to the input after selection
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (!isOpen || filtered.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && filtered[highlightedIndex]) {
        selectTeacher(filtered[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  return (
    <div ref={containerRef} className="tv-search">
      <input
        ref={inputRef}
        id="teacher-search"
        type="text"
        className="tv-search__input"
        placeholder="Search teacher…"
        value={inputValue}
        onChange={handleInputChange}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen && filtered.length > 0}
        aria-haspopup="listbox"
        aria-controls="tv-search-listbox"
        aria-activedescendant={
          highlightedIndex >= 0 ? `tv-option-${highlightedIndex}` : undefined
        }
      />
      {isOpen && filtered.length > 0 && (
        <ul
          id="tv-search-listbox"
          role="listbox"
          className="tv-search__list"
          aria-label="Teachers"
        >
          {filtered.map((teacher, i) => (
            <li
              key={teacher._id}
              id={`tv-option-${i}`}
              role="option"
              aria-selected={i === highlightedIndex}
              className={`tv-search__option${
                i === highlightedIndex ? ' tv-search__option--highlighted' : ''
              }`}
              // Use onMouseDown (not onClick) so the input blur doesn't close
              // the list before the click registers
              onMouseDown={() => selectTeacher(teacher)}
              onMouseEnter={() => setHighlightedIndex(i)}
            >
              {teacher.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
