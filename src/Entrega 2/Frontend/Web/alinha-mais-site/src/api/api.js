import axios from "axios";

const api = axios.create({
  baseURL: "https://projeto-interdisciplinar-3.onrender.com/",
});

// Adiciona o token em todas as requisições automaticamente
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Se receber 401, desloga automaticamente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default api;
