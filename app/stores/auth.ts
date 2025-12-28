import { defineStore } from "pinia";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null as any,
    token: null as string | null,
    isAuthenticated: false,
  }),

  getters: {
    getUser: (state) => state.user,
    getToken: (state) => state.token,
    isAuth: (state) => !!state.token && !!state.user,
  },

  actions: {
    setUser(user: any) {
      this.user = user;
      this.isAuthenticated = !!user;
    },

    setToken(token: string) {
      this.token = token;
      if (import.meta.client) {
        localStorage.setItem("auth_token", token);
      }
    },

    clearAuth() {
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      if (import.meta.client) {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user");
      }
    },

    initAuth() {
      if (import.meta.client) {
        const token = localStorage.getItem("auth_token");
        const userStr = localStorage.getItem("user");

        if (token && userStr) {
          try {
            this.token = token;
            this.user = JSON.parse(userStr);
            this.isAuthenticated = true;
          } catch (error) {
            this.clearAuth();
          }
        }
      }
    },
  },
});

