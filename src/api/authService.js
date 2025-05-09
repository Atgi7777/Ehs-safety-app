import axiosInstance from './axiosInstance';

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/api/auth/login_emp', {
      email,
      password,
    });
    return response.data; // Амжилттай хариу
  } catch (error) {
    if (error.response) {
      console.error('Error Response:', error.response.data);
      throw new Error(error.response?.data?.message || 'Нэвтрэх үед алдаа гарлаа');
    } else if (error.request) {
      console.error('Error Request:', error.request);
      throw new Error('Сервертэй холбогдох үед алдаа гарлаа');
    } else {
      console.error('Error Message:', error.message);
      throw new Error('Алдаа гарлаа: ' + error.message);
    }
  }
};
