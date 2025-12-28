<script setup>
const { getCart, updateCartItem, removeCartItem, clearCart } = useCart();
const cartStore = useCartStore();
const authStore = useAuthStore();

definePageMeta({
  middleware: "auth",
});

const loading = ref(false);
const error = ref(null);

// Загрузка корзины
const loadCart = async () => {
  loading.value = true;
  error.value = null;

  try {
    await getCart();
  } catch (err) {
    error.value = err.data?.message || "Ошибка загрузки корзины";
  } finally {
    loading.value = false;
  }
};

// Обновление количества
const updateQuantity = async (itemId, newQuantity) => {
  if (newQuantity < 1) {
    await removeItem(itemId);
    return;
  }

  try {
    await updateCartItem(itemId, newQuantity);
  } catch (err) {
    error.value = err.data?.message || "Ошибка обновления корзины";
  }
};

// Удаление товара
const removeItem = async (itemId) => {
  try {
    await removeCartItem(itemId);
  } catch (err) {
    error.value = err.data?.message || "Ошибка удаления товара";
  }
};

// Очистка корзины
const handleClearCart = async () => {
  if (confirm("Вы уверены, что хотите очистить корзину?")) {
    try {
      await clearCart();
    } catch (err) {
      error.value = err.data?.message || "Ошибка очистки корзины";
    }
  }
};

// Форматирование цены
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Получение изображения
const getProductImage = (product) => {
  if (product?.image) {
    return `http://127.0.0.1:8000${product.image}`;
  }
  return "https://via.placeholder.com/100x100/0f172a/38bdf8?text=Товар";
};

onMounted(() => {
  loadCart();
});
</script>

<template>
  <div class="cart-page">
    <div class="container py-5">
      <h2 class="mb-4">Корзина</h2>

      <!-- Ошибка -->
      <div v-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>

      <!-- Пустая корзина -->
      <div
        v-else-if="!cartStore.cart || cartStore.isEmpty"
        class="text-center py-5"
      >
        <i class="bi bi-cart-x fs-1 text-muted mb-3"></i>
        <h4 class="mb-3">Корзина пуста</h4>
        <p class="text-muted mb-4">
          Добавьте товары в корзину, чтобы продолжить покупки
        </p>
        <NuxtLink to="/catalog" class="btn btn-primary">
          Перейти в каталог
        </NuxtLink>
      </div>

      <!-- Корзина с товарами -->
      <div v-else class="row">
        <div class="col-lg-8">
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Товары в корзине</h5>
              <button
                class="btn btn-sm btn-outline-danger"
                @click="handleClearCart"
              >
                <i class="bi bi-trash"></i> Очистить корзину
              </button>
            </div>
            <div class="card-body p-0">
              <div
                v-for="item in cartStore.getItems"
                :key="item.id"
                class="cart-item border-bottom p-3"
              >
                <div class="row align-items-center">
                  <!-- Изображение -->
                  <div class="col-3 col-md-2">
                    <img
                      :src="getProductImage(item.product)"
                      :alt="item.product?.name"
                      class="img-fluid rounded"
                      style="max-height: 80px; object-fit: cover; width: 100%"
                    />
                  </div>

                  <!-- Информация о товаре -->
                  <div class="col-9 col-md-4">
                    <h6 class="mb-1">{{ item.product?.name }}</h6>
                    <p class="text-muted small mb-0">
                      {{ formatPrice(item.price) }} сом за шт.
                    </p>
                    <NuxtLink
                      :to="`/product/${item.product_id}`"
                      class="text-primary small text-decoration-none"
                    >
                      Подробнее
                    </NuxtLink>
                  </div>

                  <!-- Количество -->
                  <div class="col-12 col-md-3 mt-3 mt-md-0">
                    <div class="d-flex align-items-center">
                      <button
                        class="btn btn-sm btn-outline-secondary"
                        @click="updateQuantity(item.id, item.quantity - 1)"
                      >
                        −
                      </button>
                      <input
                        :value="item.quantity"
                        type="number"
                        class="form-control form-control-sm text-center mx-2"
                        min="1"
                        style="max-width: 60px"
                        @change="
                          updateQuantity(item.id, parseInt($event.target.value))
                        "
                      />
                      <button
                        class="btn btn-sm btn-outline-secondary"
                        @click="updateQuantity(item.id, item.quantity + 1)"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <!-- Цена и удаление -->
                  <div class="col-12 col-md-3 mt-3 mt-md-0 text-end">
                    <div class="mb-2">
                      <strong class="text-primary">
                        {{ formatPrice(item.subtotal) }} сом
                      </strong>
                    </div>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="removeItem(item.id)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Итого -->
        <div class="col-lg-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Итого</h5>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between mb-3">
                <span>Товаров:</span>
                <strong>{{ cartStore.itemsCount }} шт.</strong>
              </div>
              <div class="d-flex justify-content-between mb-3">
                <span>Сумма:</span>
                <strong class="text-primary">
                  {{ formatPrice(cartStore.total) }} сом
                </strong>
              </div>
              <hr />
              <div class="d-flex justify-content-between mb-4">
                <span class="h5 mb-0">К оплате:</span>
                <strong class="h5 text-primary mb-0">
                  {{ formatPrice(cartStore.total) }} сом
                </strong>
              </div>
              <NuxtLink
                to="/checkout"
                class="btn btn-primary w-100 py-2"
                :disabled="cartStore.isEmpty"
              >
                Оформить заказ
              </NuxtLink>
              <NuxtLink to="/catalog" class="btn btn-outline-secondary w-100 mt-2">
                Продолжить покупки
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cart-item:last-child {
  border-bottom: none !important;
}
</style>
