import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchTeachers() {
  const { data } = await axios.get(`${API_BASE_URL}/api/teachers`);
  return data;
}

// The API accepts one or many names and always returns an array of created teachers.
export async function createTeacher(name) {
  const { data } = await axios.post(`${API_BASE_URL}/api/teachers`, { name });
  return data;
}
