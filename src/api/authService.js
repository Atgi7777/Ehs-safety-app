import axiosInstance from './axiosInstance';

export const login = async (email, password) => {
  try {
    const response = await axiosInstance.post('/safety-engineer/login', {
      email,
      password,
    });
    return response.data; // Амжилттай хариу
  } catch (error) {
    if (error.response) {
      // Серверээс ирсэн алдааны мессежийг авч үзэх
      console.error('Error Response:', error.response.data);
      // Хэрэглэгчид илүү тодорхой мэдээлэл өгөх
      throw new Error(error.response?.data?.message || 'Нэвтрэх үед алдаа гарлаа');
    } else if (error.request) {
      // Хэрэв сервертэй холбогдсон ч хариу аваагүй бол
      console.error('Error Request:', error.request);
      throw new Error('Сервертэй холбогдох үед алдаа гарлаа');
    } else {
      // Хэрвээ өөр ямар нэгэн алдаа гарсан бол
      console.error('Error Message:', error.message);
      throw new Error('Алдаа гарлаа: ' + error.message);
    }
  }
};
