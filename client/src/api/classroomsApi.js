import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function fetchClassrooms() {
  const { data } = await axios.get(`${API_BASE_URL}/api/classrooms`);
  return data;
}

// The API accepts one or many names and always returns an array of created classrooms.
export async function createClassroom(name) {
  const { data } = await axios.post(`${API_BASE_URL}/api/classrooms`, { name });
  return data;
}

export async function deleteClassroom(id) {
  await axios.delete(`${API_BASE_URL}/api/classrooms/${id}`);
}

export async function updateClassroom(id, name) {
  const { data } = await axios.patch(`${API_BASE_URL}/api/classrooms/${id}`, { name });
  return data;
}
