import axios from "axios"

const API = axios.create({
    baseURL:"http://localhost:8000/api/v1",
    withCredentials:true
})


API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Browser sends refreshToken cookie automatically
      await API.post("/auth/refresh-token");

      // Browser now has the new accessToken cookie
      return API(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default API  
