<script setup>
import { ref, onMounted, watch } from "vue";
import { useProducts } from "~/composables/useProducts";
// import debounce from "lodash/debounce"; // If we had lodash, good for search debounce. For now, we'll just use @change or @input with simple implementation.

definePageMeta({
  layout: "admin",
  // middleware: ["auth"], // Assuming there is an auth middleware
});

const { getProducts, getCategories, deleteProduct } = useProducts();

const products = ref({
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 15,
});

const categories = ref([]);
const isLoading = ref(false);

const filters = ref({
  search: "",
  category_id: "",
  is_active: "",
  page: 1,
  per_page: 10,
});

// Debounce search manually
let searchTimeout = null;
const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.value.page = 1;
    fetchProducts();
  }, 500);
};

const fetchProducts = async () => {
  isLoading.value = true;
  const params = { ...filters.value };

  // Clean up empty filters
  if (params.is_active === "") delete params.is_active;
  if (params.category_id === "") delete params.category_id;
  if (!params.search) delete params.search;

  try {
    const data = await getProducts(params);
    products.value = data;
    // Calculate last_page if not provided, though Laravel usually provides it.
    if (!products.value.last_page && products.value.total) {
      products.value.last_page = Math.ceil(
        products.value.total / products.value.per_page
      );
    }
  } catch (error) {
    console.error("Error fetching products:", error);
  } finally {
    isLoading.value = false;
  }
};

const fetchCategories = async () => {
  try {
    const response = await getCategories();
    // Check structure based on API docs: returns array directly or { data: [] }?
    // Doc example: [ {id: 1...} ]
    categories.value = Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    console.error("Error fetching categories:", error);
  }
};

const changePage = (page) => {
  if (page < 1 || page > products.value.last_page) return;
  filters.value.page = page;
  fetchProducts();
};

const handleDelete = async (id) => {
  if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;

  try {
    await deleteProduct(id);
    // Refresh list
    await fetchProducts();
    // Use a toast notification if available, e.g. useToast().success(...)
  } catch (error) {
    console.error("Error deleting product:", error);
    alert("Ошибка при удалении товара");
  }
};

onMounted(async () => {
  await fetchCategories();
  await fetchProducts();
});
</script>

<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 text-gray-800">Управление товарами</h1>
      <NuxtLink to="/admin/products/create" class="btn btn-primary">
        + Добавить товар
      </NuxtLink>
    </div>

    <!-- Фильтры -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row g-3 align-items-center">
          <div class="col-md-4">
            <input
              v-model="filters.search"
              @input="handleSearchInput"
              type="text"
              placeholder="Поиск по названию, SKU..."
              class="form-control"
            />
          </div>

          <div class="col-md-3">
            <select
              v-model="filters.category_id"
              @change="fetchProducts"
              class="form-select"
            >
              <option value="">Все категории</option>
              <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </option>
            </select>
          </div>

          <div class="col-md-3">
            <select
              v-model="filters.is_active"
              @change="fetchProducts"
              class="form-select"
            >
              <option value="">Все статусы</option>
              <option :value="true">Активные</option>
              <option :value="false">Неактивные</option>
            </select>
          </div>

          <div class="col-md-2 text-end">
            <button
              @click="fetchProducts"
              class="btn btn-link text-decoration-none"
            >
              Обновить
            </button>
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
        v-else-if="products.data.length === 0"
        class="p-5 text-center text-muted"
      >
        Товары не найдены
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-4">ID</th>
              <th scope="col">Товар</th>
              <th scope="col">Категория</th>
              <th scope="col">Цена</th>
              <th scope="col">Статус</th>
              <th scope="col" class="text-end pe-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in products.data" :key="product.id">
              <td class="ps-4 text-muted">{{ product.id }}</td>
              <td>
                <div class="d-flex align-items-center">
                  <div class="flex-shrink-0" style="width: 40px; height: 40px">
                    <img
                      v-if="product.image"
                      class="rounded-circle w-100 h-100 object-fit-cover"
                      :src="product.image_url"
                      alt=""  
                    />
                    <div
                      v-else
                      class="rounded-circle w-100 h-100 bg-secondary-subtle d-flex align-items-center justify-content-center text-secondary"
                    >
                      <span style="font-size: 10px">IMG</span>
                    </div>
                  </div>
                  <div class="ms-3">
                    <div class="fw-bold text-dark">{{ product.name }}</div>
                    <div class="small text-muted">{{ product.sku }}</div>
                  </div>
                </div>
              </td>
              <td class="text-muted">
                {{ product.category?.name || "-" }}
              </td>
              <td>
                <div class="fw-semibold">
                  {{ product.price }} ₽
                  <span
                    v-if="product.sale_price"
                    class="small text-danger text-decoration-line-through ms-1"
                    >{{ product.sale_price }}</span
                  >
                </div>
              </td>
              <td>
                <span
                  class="badge rounded-pill"
                  :class="
                    product.is_active ? 'text-bg-success' : 'text-bg-danger'
                  "
                >
                  {{ product.is_active ? "Активен" : "Скрыт" }}
                </span>
                <span
                  v-if="!product.in_stock"
                  class="badge rounded-pill text-bg-warning ms-1"
                >
                  Нет в наличии
                </span>
              </td>
              <td class="text-end pe-4">
                <NuxtLink
                  :to="`/admin/products/update-${product.id}`"
                  class="btn btn-sm btn-outline-primary me-2"
                >
                <!-- Изменить -->
                  <i class="bi bi-pencil"></i>
                </NuxtLink>
                <button
                  @click="handleDelete(product.id)"
                  class="btn btn-sm btn-outline-danger"
                >
                  <!-- Удалить -->
                  <i class="bi bi-trash"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Пагинация -->
    <div
      v-if="products.last_page > 1"
      class="d-flex justify-content-between align-items-center mt-3"
    >
      <div class="small text-muted">
        Показано {{ (products.current_page - 1) * products.per_page + 1 }}-{{
          Math.min(products.current_page * products.per_page, products.total)
        }}
        из {{ products.total }}
      </div>
      <nav aria-label="Page navigation">
        <ul class="pagination mb-0">
          <li
            class="page-item"
            :class="{ disabled: products.current_page <= 1 }"
          >
            <button
              class="page-link"
              @click="changePage(products.current_page - 1)"
            >
              Назад
            </button>
          </li>
          <li class="page-item disabled">
            <span class="page-link text-dark"
              >{{ products.current_page }} из {{ products.last_page }}</span
            >
          </li>
          <li
            class="page-item"
            :class="{ disabled: products.current_page >= products.last_page }"
          >
            <button
              class="page-link"
              @click="changePage(products.current_page + 1)"
            >
              Вперед
            </button>
          </li>
        </ul>
      </nav>
    </div>
  </div>
</template>
