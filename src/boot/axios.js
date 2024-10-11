import { boot } from "quasar/wrappers";
import axios from "axios";
import { useAuthStore } from "src/stores/auth";
import { Notify } from "quasar";

const api = axios.create({
  baseURL: "http://localhost:8989/api/",
});

const authStore = useAuthStore();

// Configurando request interceptors
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") ?? null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
// Configurando response interceptors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response.status === 401) {
      Notify.create({
        type: "negative",
        message: "Sua sessão expirou. Por favor, realize o login novamente.",
      });
      authStore.logout();
    }
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios;
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api;
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
});

export { api };
