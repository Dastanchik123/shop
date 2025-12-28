<script setup>
const { getCart } = useCart();
const { createOrder } = useOrders();
const { getAddresses, createAddress } = useAddresses();
const cartStore = useCartStore();

definePageMeta({
  middleware: "auth",
});

const loading = ref(false);
const submitting = ref(false);
const error = ref(null);

// Форма адреса доставки
const shippingAddress = ref({
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  country: "Кыргызстан",
  city: "",
  state: "",
  postal_code: "",
  address_line_1: "",
  address_line_2: "",
  is_default: true,
});

const notes = ref("");

// Загрузка данных
const loadData = async () => {
  loading.value = true;
  error.value = null;

  try {
    await getCart();
    if (cartStore.isEmpty) {
      await navigateTo("/cart");
      return;
    }

    // Загружаем сохраненные адреса
    try {
      const addresses = await getAddresses({ type: "shipping" });
      if (addresses.length > 0) {
        const defaultAddress = addresses.find((a) => a.is_default) || addresses[0];
        Object.assign(shippingAddress.value, defaultAddress);
      }
    } catch (err) {
      // Игнорируем ошибку, если адресов нет
    }
  } catch (err) {
    error.value = err.data?.message || "Ошибка загрузки данных";
  } finally {
    loading.value = false;
  }
};

// Оформление заказа
const handleSubmit = async () => {
  submitting.value = true;
  error.value = null;

  try {
    const orderData = {
      shipping_address: shippingAddress.value,
      notes: notes.value,
    };

    const order = await createOrder(orderData);
    
    // Очищаем корзину
    cartStore.clearCart();
    
    // Перенаправляем на страницу заказа
    await navigateTo(`/profile/orders/${order.id}`);
  } catch (err) {
    if (err.data?.errors) {
      error.value = Object.values(err.data.errors)
        .flat()
        .join(", ");
    } else {
      error.value = err.data?.message || "Ошибка оформления заказа";
    }
  } finally {
    submitting.value = false;
  }
};

// Форматирование цены
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="checkout-page">
    <div class="container py-5">
      <h2 class="mb-4">Оформление заказа</h2>

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

      <!-- Форма заказа -->
      <div v-else-if="!cartStore.isEmpty" class="row">
        <!-- Форма адреса -->
        <div class="col-lg-8">
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Адрес доставки</h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="handleSubmit">
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="first_name" class="form-label">Имя *</label>
                    <input
                      id="first_name"
                      v-model="shippingAddress.first_name"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="last_name" class="form-label">Фамилия *</label>
                    <input
                      id="last_name"
                      v-model="shippingAddress.last_name"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="phone" class="form-label">Телефон *</label>
                    <input
                      id="phone"
                      v-model="shippingAddress.phone"
                      type="tel"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="email" class="form-label">Email</label>
                    <input
                      id="email"
                      v-model="shippingAddress.email"
                      type="email"
                      class="form-control"
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label for="country" class="form-label">Страна *</label>
                  <input
                    id="country"
                    v-model="shippingAddress.country"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>

                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="city" class="form-label">Город *</label>
                    <input
                      id="city"
                      v-model="shippingAddress.city"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="postal_code" class="form-label"
                      >Почтовый индекс *</label
                    >
                    <input
                      id="postal_code"
                      v-model="shippingAddress.postal_code"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                </div>

                <div class="mb-3">
                  <label for="address_line_1" class="form-label"
                    >Адрес (строка 1) *</label
                  >
                  <input
                    id="address_line_1"
                    v-model="shippingAddress.address_line_1"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label for="address_line_2" class="form-label"
                    >Адрес (строка 2)</label
                  >
                  <input
                    id="address_line_2"
                    v-model="shippingAddress.address_line_2"
                    type="text"
                    class="form-control"
                  />
                </div>

                <div class="mb-3">
                  <label for="notes" class="form-label"
                    >Примечания к заказу</label
                  >
                  <textarea
                    id="notes"
                    v-model="notes"
                    class="form-control"
                    rows="3"
                    placeholder="Особые пожелания по доставке..."
                  ></textarea>
                </div>

                <div class="d-grid gap-2 d-md-flex justify-content-md-end">
                  <NuxtLink to="/cart" class="btn btn-outline-secondary">
                    Назад к корзине
                  </NuxtLink>
                  <button
                    type="submit"
                    class="btn btn-primary"
                    :disabled="submitting"
                  >
                    <span
                      v-if="submitting"
                      class="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    {{ submitting ? "Оформление..." : "Оформить заказ" }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Итого -->
        <div class="col-lg-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Ваш заказ</h5>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <strong>Товаров: {{ cartStore.itemsCount }} шт.</strong>
              </div>
              <div class="mb-3">
                <div class="d-flex justify-content-between">
                  <span>Сумма:</span>
                  <strong>{{ formatPrice(cartStore.total) }} сом</strong>
                </div>
              </div>
              <hr />
              <div class="d-flex justify-content-between mb-3">
                <span class="h5 mb-0">К оплате:</span>
                <strong class="h5 text-primary mb-0">
                  {{ formatPrice(cartStore.total) }} сом
                </strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
