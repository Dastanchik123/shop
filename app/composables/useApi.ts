export const useApi = () => {
  const baseURL = "http://127.0.0.1:8000/api";

  const getAuthToken = () => {
    if (import.meta.client) {
      return localStorage.getItem("auth_token");
    }
    return null;
  };

  const apiFetch = async (endpoint: string, options: any = {}) => {
    const token = getAuthToken();
    const headers: any = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(options.headers || {}),
    };

    // Если body это FormData, Content-Type должен быть удален, чтобы браузер выставил boundary
    if (options.body instanceof FormData) {
      delete headers["Content-Type"];
    }

    // Если Content-Type явно задан как null/undefined, удаляем его
    if (
      headers["Content-Type"] === undefined ||
      headers["Content-Type"] === null
    ) {
      delete headers["Content-Type"];
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await $fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers,
        method: options.method || "GET",
      });

      return response;
    } catch (error: any) {
      // Обработка ошибок согласно документации
      if (error.status === 401) {
        // Не авторизован - очищаем токен и перенаправляем
        if (import.meta.client) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          navigateTo("/auth/login");
        }
      } else if (error.status === 404) {
        // Ресурс не найден
        console.error("Resource not found:", endpoint);
      } else if (error.status === 422) {
        // Ошибка валидации - данные уже в error.data.errors
        console.error("Validation error:", error.data?.errors);
      } else if (error.status === 403) {
        // Доступ запрещен
        console.error("Access forbidden");
      } else if (error.status >= 500) {
        // Внутренняя ошибка сервера
        console.error("Server error:", error.data?.message);
      }

      // Пробрасываем ошибку дальше для обработки в компонентах
      throw error;
    }
  };

  return {
    apiFetch,
    baseURL,
    getAuthToken,
  };
};
