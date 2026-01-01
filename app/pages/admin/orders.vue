<script setup>
import { ref, onMounted } from "vue";
import { useOrders } from "~/composables/useOrders";

definePageMeta({
  layout: "admin",
  // middleware: ["auth"],
});

const { getOrders, updateOrder } = useOrders();

const orders = ref({
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 15,
});

const isLoading = ref(false);
const selectedOrder = ref(null);
const isModalOpen = ref(false);

const filters = ref({
  status: "",
  page: 1,
});

const fetchOrders = async () => {
  isLoading.value = true;
  try {
    const data = await getOrders(filters.value);
    orders.value = data;
    if (!orders.value.last_page && orders.value.total) {
      // Approx fix if meta missing
      orders.value.last_page = Math.ceil(
        orders.value.total / orders.value.per_page
      );
    }
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const changePage = (page) => {
  if (page < 1 || page > orders.value.last_page) return;
  filters.value.page = page;
  fetchOrders();
};

const openOrderModal = (order) => {
  selectedOrder.value = JSON.parse(JSON.stringify(order)); // Deep copy
  isModalOpen.value = true;
};

const closeOrderModal = () => {
  isModalOpen.value = false;
  selectedOrder.value = null;
};

const updateOrderStatus = async () => {
  try {
    await updateOrder(selectedOrder.value.id, {
      status: selectedOrder.value.status,
      payment_status: selectedOrder.value.payment_status,
    });
    alert("Статус обновлен");
    closeOrderModal();
    fetchOrders();
  } catch (error) {
    console.error(error);
    alert("Ошибка при обновлении статуса");
  }
};

const statusClass = (status) => {
  switch (status) {
    case "pending":
      return "text-bg-warning";
    case "processing":
      return "text-bg-primary";
    case "shipped":
      return "text-bg-info";
    case "delivered":
      return "text-bg-success";
    case "cancelled":
      return "text-bg-danger";
    case "refunded":
      return "text-bg-secondary";
    default:
      return "text-bg-light text-dark";
  }
};

const paymentStatusClass = (status) => {
  switch (status) {
    case "paid":
      return "text-success fw-bold";
    case "pending":
      return "text-warning";
    case "failed":
      return "text-danger";
    default:
      return "text-muted";
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("ru-RU");
};

onMounted(() => {
  fetchOrders();
});
</script>

<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 text-gray-800">Заказы</h1>
    </div>

    <!-- Фильтры -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-3">
            <select
              v-model="filters.status"
              @change="fetchOrders"
              class="form-select"
            >
              <option value="">Все статусы</option>
              <option value="pending">Ожидает (Pending)</option>
              <option value="processing">В обработке (Processing)</option>
              <option value="shipped">Отправлен (Shipped)</option>
              <option value="delivered">Доставлен (Delivered)</option>
              <option value="cancelled">Отменен (Cancelled)</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <!-- Таблица -->
    <div class="card shadow-sm">
      <div v-if="isLoading" class="p-5 text-center text-muted">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>
      <div
        v-else-if="orders.data.length === 0"
        class="p-5 text-center text-muted"
      >
        Заказов не найдено
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-4">№ Заказа</th>
              <th scope="col">Статус</th>
              <th scope="col">Оплата</th>
              <th scope="col">Сумма</th>
              <th scope="col">Дата</th>
              <th scope="col" class="text-end pe-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="order in orders.data"
              :key="order.id"
              class="cursor-pointer"
              @click="openOrderModal(order)"
            >
              <td class="ps-4 fw-medium">{{ order.order_number }}</td>
              <td>
                <span
                  class="badge rounded-pill"
                  :class="statusClass(order.status)"
                >
                  {{ order.status }}
                </span>
              </td>
              <td>
                <span :class="paymentStatusClass(order.payment_status)">
                  {{ order.payment_status }}
                </span>
              </td>
              <td>{{ order.total }} {{ order.currency || "" }}</td>
              <td class="text-muted small">
                {{ formatDate(order.created_at) }}
              </td>
              <td class="text-end pe-4">
                <button
                  @click.stop="openOrderModal(order)"
                  class="btn btn-sm btn-outline-primary"
                >
                  Детали
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Пагинация -->
    <div
      v-if="orders.last_page > 1"
      class="d-flex justify-content-end align-items-center mt-3 gap-2"
    >
      <button
        :disabled="orders.current_page <= 1"
        @click="changePage(orders.current_page - 1)"
        class="btn btn-outline-secondary btn-sm"
      >
        Назад
      </button>
      <span class="small text-muted"
        >{{ orders.current_page }} из {{ orders.last_page }}</span
      >
      <button
        :disabled="orders.current_page >= orders.last_page"
        @click="changePage(orders.current_page + 1)"
        class="btn btn-outline-secondary btn-sm"
      >
        Вперед
      </button>
    </div>

    <!-- Модальное окно деталей заказа -->
    <div
      v-if="isModalOpen && selectedOrder"
      class="modal d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg modal-dialog-scrollable">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Заказ {{ selectedOrder.order_number }}</h5>
            <button
              type="button"
              class="btn-close"
              @click="closeOrderModal"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row g-3 mb-4">
              <div class="col-md-6">
                <label class="form-label text-muted small uppercase"
                  >Статус</label
                >
                <select v-model="selectedOrder.status" class="form-select">
                  <option value="pending">pending</option>
                  <option value="processing">processing</option>
                  <option value="shipped">shipped</option>
                  <option value="delivered">delivered</option>
                  <option value="cancelled">cancelled</option>
                  <option value="refunded">refunded</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted small uppercase"
                  >Статус оплаты</label
                >
                <select
                  v-model="selectedOrder.payment_status"
                  class="form-select"
                >
                  <option value="pending">pending</option>
                  <option value="paid">paid</option>
                  <option value="failed">failed</option>
                </select>
              </div>
            </div>

            <div class="card mb-4">
              <div class="card-header bg-light">Товары</div>
              <table class="table table-sm mb-0">
                <thead>
                  <tr>
                    <th scope="col" class="ps-3">Товар</th>
                    <th scope="col" class="text-center">Кол-во</th>
                    <th scope="col" class="text-end">Цена</th>
                    <th scope="col" class="text-end pe-3">Сумма</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedOrder.items" :key="item.id">
                    <td class="ps-3">
                      {{ item.product_name || "Товар #" + item.product_id }}
                    </td>
                    <td class="text-center">{{ item.quantity }}</td>
                    <td class="text-end">{{ item.price }}</td>
                    <td class="text-end pe-3">{{ item.total }}</td>
                  </tr>
                </tbody>
                <tfoot class="table-light fw-bold">
                  <tr>
                    <td colspan="3" class="text-end">Итого:</td>
                    <td class="text-end pe-3">{{ selectedOrder.total }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div class="row g-4">
              <div class="col-md-6">
                <h6 class="text-muted small uppercase mb-2">Адрес доставки</h6>
                <div
                  class="p-3 bg-light rounded border"
                  v-if="selectedOrder.shipping_address"
                >
                  {{ selectedOrder.shipping_address.address_line_1 }}<br />
                  {{ selectedOrder.shipping_address.city }},
                  {{ selectedOrder.shipping_address.country }}<br />
                  <span class="fw-medium"
                    >{{ selectedOrder.shipping_address.first_name }}
                    {{ selectedOrder.shipping_address.last_name }}</span
                  ><br />
                  <span class="small text-muted">{{
                    selectedOrder.shipping_address.phone
                  }}</span>
                </div>
                <div v-else class="text-muted fst-italic">Не указан</div>
              </div>
              <div class="col-md-6">
                <h6 class="text-muted small uppercase mb-2">Заметки</h6>
                <div class="p-3 bg-light rounded border min-h-100">
                  {{ selectedOrder.notes || "Нет заметок" }}
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="closeOrderModal"
            >
              Закрыть
            </button>
            <button
              type="button"
              class="btn btn-primary"
              @click="updateOrderStatus"
            >
              Сохранить изменения
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
