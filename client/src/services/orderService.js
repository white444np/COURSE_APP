import api from '../api';

export async function createOrder(courseId) {
  const { data } = await api.post('/orders', { courseId });
  return data;
}

export async function verifyPayment(payload) {
  const { data } = await api.post('/orders/verify', payload);
  return data;
}

export async function fetchMyOrders() {
  const { data } = await api.get('/orders/mine');
  return data.orders;
}
