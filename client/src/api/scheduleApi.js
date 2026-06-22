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
