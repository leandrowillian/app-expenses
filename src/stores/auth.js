import { defineStore } from "pinia";
import { Router } from "src/router";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: JSON.parse(localStorage.getItem("logged_user")) || null,
  }),

  getters: {
    name() {
      return this.user?.name;
    },
    email() {
      return this.user?.email;
    },
  },

  actions: {
    login(data) {
      const { email, name, token, exp } = data;
      this.user = null;
      if (email !== "" && token !== "") {
        const loggedUserObj = {
          name: name,
          email: email,
          exp: exp,
        };
        this.user = loggedUserObj;
        localStorage.setItem("logged_user", JSON.stringify(loggedUserObj));
        localStorage.setItem("token", token);
      }
      return this.user;
    },
    logout() {
      this.user = null;
      localStorage.clear();
      // Redireciona para o login
      Router.push({ path: "/login" });
    },
  },
});
