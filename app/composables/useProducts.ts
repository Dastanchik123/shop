import { useApi } from "./useApi";

export const useProducts = () => {
  const api = useApi();

  const getProducts = async (
    params: {
      category_id?: number;
      is_active?: boolean;
      in_stock?: boolean;
      search?: string;
      min_price?: number;
      max_price?: number;
      per_page?: number;
      page?: number;
    } = {}
  ) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/products${queryString ? `?${queryString}` : ""}`;

      return await api.apiFetch(endpoint);
    } catch (error) {
      throw error;
    }
  };

  const getProduct = async (id: number | string) => {
    try {
      return await api.apiFetch(`/products/${id}`);
    } catch (error) {
      throw error;
    }
  };

  const getCategories = async (
    params: {
      parent_id?: number;
      is_active?: boolean;
    } = {}
  ) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const queryString = queryParams.toString();
      const endpoint = `/categories${queryString ? `?${queryString}` : ""}`;

      return await api.apiFetch(endpoint);
    } catch (error) {
      throw error;
    }
  };

  const getCategory = async (id: number | string) => {
    try {
      return await api.apiFetch(`/categories/${id}`);
    } catch (error) {
      throw error;
    }
  };

  return {
    getProducts,
    getProduct,
    getCategories,
    getCategory,
  };
};
