import { defineStore } from "pinia";

export const useCartStore = defineStore("cart", {
  state: () => ({
    cart: null as any,
    total: "0.00",
    itemsCount: 0,
  }),

  getters: {
    getCart: (state) => state.cart,
    getTotal: (state) => state.total,
    getItemsCount: (state) => state.itemsCount,
    getItems: (state) => state.cart?.items || [],
    isEmpty: (state) => state.itemsCount === 0,
  },

  actions: {
    setCart(cart: any) {
      this.cart = cart;
    },

    setTotal(total: string | number) {
      this.total = typeof total === "number" ? total.toFixed(2) : total;
    },

    setItemsCount(count: number) {
      this.itemsCount = count;
    },

    clearCart() {
      this.cart = null;
      this.total = "0.00";
      this.itemsCount = 0;
    },
  },
});

