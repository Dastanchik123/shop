export const useUsers = () => {
  const api = useApi();

  const getUsers = async (params: any = {}) => {
    // Clean empty params
    const query = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== null && v !== "")
    );

    try {
      return await api.apiFetch("/user", {
        method: "GET",
        // query,
      });
    } catch (error) {
      throw error;
    }
  };

  const deleteUser = async (id: number | string) => {
    try {
      return await api.apiFetch(`/users/${id}`, {
        method: "DELETE",
      });
    } catch (error) {
      throw error;
    }
  };

  return {
    getUsers,
    deleteUser,
  };
};
