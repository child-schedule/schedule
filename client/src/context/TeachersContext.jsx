import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchTeachers, createTeacher, updateTeacher, deleteTeacher } from '../api/teachersApi';

const TeachersContext = createContext(null);

export function TeachersProvider({ children }) {
  const [teachers, setTeachers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTeachers()
      .then(setTeachers)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const addTeacher = useCallback(async (name) => {
    const created = await createTeacher(name);
    setTeachers((prev) => [...prev, ...created]);
    return created[0];
  }, []);

  const removeTeacher = useCallback(async (id) => {
    await deleteTeacher(id);
    setTeachers((prev) => prev.filter((t) => t._id !== id));
  }, []);

  const renameTeacher = useCallback(async (id, name) => {
    const updated = await updateTeacher(id, name);
    setTeachers((prev) => prev.map((t) => (t._id === id ? updated : t)));
    return updated;
  }, []);

  return (
    <TeachersContext.Provider
      value={{ teachers, isLoading, error, addTeacher, removeTeacher, renameTeacher }}
    >
      {children}
    </TeachersContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- colocating the hook with its provider is intentional
export function useTeachers() {
  const context = useContext(TeachersContext);
  if (!context) throw new Error('useTeachers must be used within a TeachersProvider');
  return context;
}
