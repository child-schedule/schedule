import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Returns the schedule for this date, or null if none exists yet.
export async function fetchSchedule(date) {
  try {
    const { data } = await axios.get(`${API_BASE_URL}/api/schedule/${date}`);
    return data;
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    throw err;
  }
}

export async function copySchedule(date) {
  const { data } = await axios.post(`${API_BASE_URL}/api/schedule/${date}/copy`);
  return data;
}

export async function addRow(date, teacherId, classroomId) {
  const { data } = await axios.post(`${API_BASE_URL}/api/schedule/${date}/row`, { teacherId, classroomId });
  return data;
}

export async function saveBlock(date, rowId, payload) {
  const { data } = await axios.put(`${API_BASE_URL}/api/schedule/${date}/row/${rowId}/block`, payload);
  return data;
}

export async function deleteBlock(date, rowId, blockId) {
  const { data } = await axios.delete(`${API_BASE_URL}/api/schedule/${date}/row/${rowId}/block/${blockId}`);
  return data;
}

export async function deleteRow(date, rowId) {
  const { data } = await axios.delete(`${API_BASE_URL}/api/schedule/${date}/row/${rowId}`);
  return data;
}

// Publishes the working draft (draftRows) as the saved schedule (rows).
export async function applySchedule(date) {
  const { data } = await axios.post(`${API_BASE_URL}/api/schedule/${date}/apply`);
  return data;
}

// Saves the day's printable note (one overwritable note per date).
export async function updateNotes(date, notes) {
  const { data } = await axios.patch(`${API_BASE_URL}/api/schedule/${date}/notes`, { notes });
  return data;
}
