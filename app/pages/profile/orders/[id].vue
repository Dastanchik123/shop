<script setup>
const route = useRoute();
const { getOrder, cancelOrder } = useOrders();
const { createPayment, getPayments } = usePayments();

definePageMeta({
  middleware: "auth",
});

const order = ref(null);
const payments = ref([]);
const loading = ref(false);
const error = ref(null);
const paymentLoading = ref(false);

// Загрузка заказа
const loadOrder = async () => {
  loading.value = true;
  error.value = null;

  try {
    order.value = await getOrder(route.params.id);
    
    // Загружаем платежи для этого заказа
    if (order.value) {
      try {
        const paymentsData = await getPayments({ order_id: order.value.id });
        payments.value = paymentsData.data || paymentsData || [];
      } catch (err) {
        // Игнорируем ошибки загрузки платежей
        console.error("Error loading payments:", err);
      }
    }
  } catch (err) {
    error.value = err.data?.message || "Ошибка загрузки заказа";
  } finally {
    loading.value = false;
  }
};

// Создание платежа
const handleCreatePayment = async () => {
  if (!order.value) return;

  const paymentMethod = prompt("Выберите способ оплаты:\n1 - Банковская карта\n2 - Электронный кошелек\n3 - Наличные");
  
  if (!paymentMethod) return;

  const methods = {
    "1": "credit_card",
    "2": "e_wallet",
    "3": "cash",
  };

  paymentLoading.value = true;

  try {
    const payment = await createPayment({
      order_id: order.value.id,
      payment_method: methods[paymentMethod] || "credit_card",
      amount: order.value.total,
      currency: order.value.currency || "KGS",
    });

    alert("Платеж успешно создан!");
    await loadOrder(); // Перезагружаем заказ для обновления статуса
  } catch (err) {
    alert(err.data?.message || "Ошибка создания платежа");
  } finally {
    paymentLoading.value = false;
  }
};

// Отмена заказа
const handleCancelOrder = async () => {
  if (!confirm("Вы уверены, что хотите отменить заказ?")) {
    return;
  }

  try {
    await cancelOrder(route.params.id);
    await loadOrder();
  } catch (err) {
    alert(err.data?.message || "Ошибка отмены заказа");
  }
};

// Форматирование цены
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Статус заказа
const getStatusBadge = (status) => {
  const badges = {
    pending: "warning",
    processing: "info",
    shipped: "primary",
    delivered: "success",
    cancelled: "danger",
    refunded: "secondary",
  };
  return badges[status] || "secondary";
};

onMounted(() => {
  loadOrder();
});
</script>

<template>
  <div class="order-detail-page">
    <div class="container py-5">
      <div class="mb-4">
        <NuxtLink to="/profile/orders" class="btn btn-outline-secondary mb-3">
          <i class="bi bi-arrow-left"></i> Назад к заказам
        </NuxtLink>
      </div>

      <!-- Загрузка -->
      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>

      <!-- Ошибка -->
      <div v-else-if="error" class="alert alert-danger" role="alert">
        {{ error }}
      </div>

      <!-- Заказ -->
      <div v-else-if="order" class="row">
        <div class="col-lg-8">
          <!-- Информация о заказе -->
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 class="mb-0">Заказ #{{ order.order_number }}</h5>
              <span
                class="badge"
                :class="`bg-${getStatusBadge(order.status)}`"
              >
                {{ order.status }}
              </span>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong>Дата заказа:</strong>
                </div>
                <div class="col-sm-8">
                  {{ new Date(order.created_at).toLocaleString("ru-RU") }}
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong>Статус:</strong>
                </div>
                <div class="col-sm-8">
                  <span
                    class="badge"
                    :class="`bg-${getStatusBadge(order.status)}`"
                  >
                    {{ order.status }}
                  </span>
                </div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong>Статус оплаты:</strong>
                </div>
                <div class="col-sm-8">
                  <span
                    class="badge"
                    :class="
                      order.payment_status === 'paid'
                        ? 'bg-success'
                        : 'bg-warning'
                    "
                  >
                    {{ order.payment_status === "paid" ? "Оплачен" : "Не оплачен" }}
                  </span>
                </div>
              </div>
              <div v-if="order.notes" class="row mb-3">
                <div class="col-sm-4">
                  <strong>Примечания:</strong>
                </div>
                <div class="col-sm-8">{{ order.notes }}</div>
              </div>
            </div>
          </div>

          <!-- Товары -->
          <div class="card shadow-sm border-0 mb-4">
            <div class="card-header bg-white">
              <h5 class="mb-0">Товары в заказе</h5>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table">
                  <thead>
                    <tr>
                      <th>Товар</th>
                      <th>Количество</th>
                      <th>Цена</th>
                      <th>Итого</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in order.items" :key="item.id">
                      <td>{{ item.product_name }}</td>
                      <td>{{ item.quantity }}</td>
                      <td>{{ formatPrice(item.price) }} сом</td>
                      <td>{{ formatPrice(item.total) }} сом</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Адрес доставки -->
          <div v-if="order.shipping_address" class="card shadow-sm border-0">
            <div class="card-header bg-white">
              <h5 class="mb-0">Адрес доставки</h5>
            </div>
            <div class="card-body">
              <p class="mb-1">
                <strong>{{ order.shipping_address.first_name }}
                {{ order.shipping_address.last_name }}</strong>
              </p>
              <p class="mb-1">{{ order.shipping_address.address_line_1 }}</p>
              <p v-if="order.shipping_address.address_line_2" class="mb-1">
                {{ order.shipping_address.address_line_2 }}
              </p>
              <p class="mb-1">
                {{ order.shipping_address.city }},
                {{ order.shipping_address.postal_code }}
              </p>
              <p class="mb-0">
                <strong>Телефон:</strong> {{ order.shipping_address.phone }}
              </p>
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
              <div class="d-flex justify-content-between mb-2">
                <span>Товары:</span>
                <strong>{{ formatPrice(order.subtotal) }} сом</strong>
              </div>
              <div v-if="order.tax" class="d-flex justify-content-between mb-2">
                <span>Налог:</span>
                <strong>{{ formatPrice(order.tax) }} сом</strong>
              </div>
              <div
                v-if="order.shipping_cost"
                class="d-flex justify-content-between mb-2"
              >
                <span>Доставка:</span>
                <strong>{{ formatPrice(order.shipping_cost) }} сом</strong>
              </div>
              <div
                v-if="order.discount"
                class="d-flex justify-content-between mb-2 text-success"
              >
                <span>Скидка:</span>
                <strong>-{{ formatPrice(order.discount) }} сом</strong>
              </div>
              <hr />
              <div class="d-flex justify-content-between">
                <span class="h5 mb-0">К оплате:</span>
                <strong class="h5 text-primary mb-0">
                  {{ formatPrice(order.total) }} сом
                </strong>
              </div>
              <!-- Платежи -->
              <div v-if="payments.length > 0" class="mt-3 mb-3">
                <h6 class="mb-2">Платежи:</h6>
                <div
                  v-for="payment in payments"
                  :key="payment.id"
                  class="mb-2 p-2 bg-light rounded"
                >
                  <div class="d-flex justify-content-between">
                    <span class="small">{{ payment.payment_method }}</span>
                    <span
                      class="badge"
                      :class="
                        payment.status === 'completed'
                          ? 'bg-success'
                          : payment.status === 'failed'
                          ? 'bg-danger'
                          : 'bg-warning'
                      "
                    >
                      {{ payment.status }}
                    </span>
                  </div>
                  <div class="small text-muted">
                    {{ formatPrice(payment.amount) }} {{ payment.currency || 'сом' }}
                  </div>
                </div>
              </div>

              <!-- Кнопки действий -->
              <div v-if="order.status === 'pending'" class="mt-3">
                <button
                  v-if="order.payment_status !== 'paid'"
                  class="btn btn-primary w-100 mb-2"
                  :disabled="paymentLoading"
                  @click="handleCreatePayment"
                >
                  <span
                    v-if="paymentLoading"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Оплатить заказ
                </button>
                <button
                  class="btn btn-danger w-100"
                  @click="handleCancelOrder"
                >
                  Отменить заказ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

