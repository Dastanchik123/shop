import { defineStore } from "pinia";

export const useProductsStore = defineStore("products", {
  state: () => ({
    products: [],
    categories: [],
    loaded: false,
    categoriesLoaded: false,
  }),

  actions: {
    setProducts(items) {
      this.products = items;
      this.loaded = true;
    },

    setCategories(categories) {
      this.categories = categories;
      this.categoriesLoaded = true;
    },

    clearProducts() {
      this.products = [];
      this.loaded = false;
    },
  },
});
