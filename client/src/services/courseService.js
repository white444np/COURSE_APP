import api from '../api';

export async function getCourses(params = {}) {
  const response = await api.get('/courses', { params });
  return response.data;
}

export async function getCourse(courseId) {
  const response = await api.get(`/courses/${courseId}`);
  return response.data.course;
}

export async function createCourse(payload) {
  const response = await api.post('/courses', payload);
  return response.data.course;
}

export async function updateCourse(courseId, payload) {
  const response = await api.patch(`/courses/${courseId}`, payload);
  return response.data.course;
}

export async function deleteCourse(courseId) {
  await api.delete(`/courses/${courseId}`);
}
