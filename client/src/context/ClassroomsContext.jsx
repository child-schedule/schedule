import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { fetchClassrooms, createClassroom, updateClassroom, deleteClassroom } from '../api/classroomsApi';

const ClassroomsContext = createContext(null);

export function ClassroomsProvider({ children }) {
  const [classrooms, setClassrooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchClassrooms()
      .then(setClassrooms)
      .catch((err) => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  const addClassroom = useCallback(async (name) => {
    const created = await createClassroom(name);
    setClassrooms((prev) => [...prev, ...created]);
    return created[0];
  }, []);

  const removeClassroom = useCallback(async (id) => {
    await deleteClassroom(id);
    setClassrooms((prev) => prev.filter((c) => c._id !== id));
  }, []);

  const renameClassroom = useCallback(async (id, name) => {
    const updated = await updateClassroom(id, name);
    setClassrooms((prev) => prev.map((c) => (c._id === id ? updated : c)));
    return updated;
  }, []);

  return (
    <ClassroomsContext.Provider
      value={{ classrooms, isLoading, error, addClassroom, removeClassroom, renameClassroom }}
    >
      {children}
    </ClassroomsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- colocating the hook with its provider is intentional
export function useClassrooms() {
  const context = useContext(ClassroomsContext);
  if (!context) throw new Error('useClassrooms must be used within a ClassroomsProvider');
  return context;
}
