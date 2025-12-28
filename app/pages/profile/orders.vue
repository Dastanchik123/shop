<script setup>
const { getOrders, getOrder, cancelOrder } = useOrders();

definePageMeta({
  middleware: "auth",
});

const orders = ref(null);
const loading = ref(false);
const error = ref(null);

// Загрузка заказов
const loadOrders = async () => {
  loading.value = true;
  error.value = null;

  try {
    orders.value = await getOrders({ per_page: 20 });
  } catch (err) {
    error.value = err.data?.message || "Ошибка загрузки заказов";
  } finally {
    loading.value = false;
  }
};

// Отмена заказа
const handleCancelOrder = async (orderId) => {
  if (!confirm("Вы уверены, что хотите отменить заказ?")) {
    return;
  }

  try {
    await cancelOrder(orderId);
    await loadOrders();
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

const getStatusText = (status) => {
  const texts = {
    pending: "Ожидает обработки",
    processing: "В обработке",
    shipped: "Отправлен",
    delivered: "Доставлен",
    cancelled: "Отменен",
    refunded: "Возвращен",
  };
  return texts[status] || status;
};

onMounted(() => {
  loadOrders();
});
</script>

<template>
  <div class="orders-page">
    <div class="container py-5">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Мои заказы</h2>
        <NuxtLink to="/profile" class="btn btn-outline-secondary">
          <i class="bi bi-arrow-left"></i> Назад к профилю
        </NuxtLink>
      </div>

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

      <!-- Пусто -->
      <div
        v-else-if="!orders || !orders.data || orders.data.length === 0"
        class="text-center py-5"
      >
        <i class="bi bi-bag-x fs-1 text-muted mb-3"></i>
        <h4 class="mb-3">Заказов пока нет</h4>
        <p class="text-muted mb-4">
          Начните делать покупки, чтобы увидеть свои заказы здесь
        </p>
        <NuxtLink to="/catalog" class="btn btn-primary">
          Перейти в каталог
        </NuxtLink>
      </div>

      <!-- Список заказов -->
      <div v-else class="row">
        <div
          v-for="order in orders.data"
          :key="order.id"
          class="col-12 mb-4"
        >
          <div class="card shadow-sm border-0">
            <div class="card-header bg-white d-flex justify-content-between align-items-center">
              <div>
                <h5 class="mb-0">Заказ #{{ order.order_number }}</h5>
                <small class="text-muted">
                  {{ new Date(order.created_at).toLocaleDateString("ru-RU") }}
                </small>
              </div>
              <div>
                <span
                  class="badge"
                  :class="`bg-${getStatusBadge(order.status)}`"
                >
                  {{ getStatusBadge(order.status) }}
                </span>
              </div>
            </div>
            <div class="card-body">
              <!-- Товары -->
              <div class="mb-3">
                <h6>Товары:</h6>
                <ul class="list-unstyled">
                  <li
                    v-for="item in order.items"
                    :key="item.id"
                    class="mb-2"
                  >
                    {{ item.product_name }} × {{ item.quantity }} =
                    {{ formatPrice(item.total) }} сом
                  </li>
                </ul>
              </div>

              <!-- Адрес доставки -->
              <div v-if="order.shipping_address" class="mb-3">
                <h6>Адрес доставки:</h6>
                <p class="mb-0 small">
                  {{ order.shipping_address.address_line_1 }},
                  {{ order.shipping_address.city }},
                  {{ order.shipping_address.postal_code }}
                </p>
              </div>

              <!-- Итого -->
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <strong class="text-primary">
                    Итого: {{ formatPrice(order.total) }} сом
                  </strong>
                </div>
                <div>
                  <NuxtLink
                    :to="`/profile/orders/${order.id}`"
                    class="btn btn-sm btn-outline-primary me-2"
                  >
                    Подробнее
                  </NuxtLink>
                  <button
                    v-if="order.status === 'pending'"
                    class="btn btn-sm btn-outline-danger"
                    @click="handleCancelOrder(order.id)"
                  >
                    Отменить
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Пагинация -->
      <nav
        v-if="orders && orders.last_page > 1"
        aria-label="Навигация по страницам"
        class="mt-4"
      >
        <ul class="pagination justify-content-center">
          <li
            class="page-item"
            :class="{ disabled: orders.current_page === 1 }"
          >
            <button
              class="page-link"
              @click="
                loadOrders({ page: orders.current_page - 1 })
              "
            >
              Предыдущая
            </button>
          </li>
          <li
            v-for="page in orders.last_page"
            :key="page"
            class="page-item"
            :class="{ active: page === orders.current_page }"
          >
            <button class="page-link" @click="loadOrders({ page })">
              {{ page }}
            </button>
          </li>
          <li
            class="page-item"
            :class="{ disabled: orders.current_page === orders.last_page }"
          >
            <button
              class="page-link"
              @click="loadOrders({ page: orders.current_page + 1 })"
            >
              Следующая
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>
