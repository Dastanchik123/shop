<script setup>
const { getProducts, getCategories } = useProducts();
const route = useRoute();
const router = useRouter();

const title = "Каталог товаров";

// Фильтры
const filters = ref({
  category_id: route.query.category_id
    ? Number(route.query.category_id)
    : undefined,
  search: route.query.search || "",
  min_price: route.query.min_price ? Number(route.query.min_price) : undefined,
  max_price: route.query.max_price ? Number(route.query.max_price) : undefined,
  in_stock: route.query.in_stock === "true" ? true : undefined,
  per_page: 15,
  page: route.query.page ? Number(route.query.page) : 1,
});

const products = ref(null);
const categories = ref([]);
const loading = ref(false);
const error = ref(null);

// Загрузка данных
const loadData = async () => {
  loading.value = true;
  error.value = null;

  try {
    const [productsData, categoriesData] = await Promise.all([
      getProducts(filters.value),
      getCategories({ is_active: true }),
    ]);

    products.value = productsData;
    categories.value = categoriesData;
  } catch (err) {
    error.value = err.data?.message || "Ошибка загрузки данных";
  } finally {
    loading.value = false;
  }
};

// Применение фильтров
const applyFilters = () => {
  const query = {};
  Object.entries(filters.value).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query[key] = value;
    }
  });
  router.push({ query });
};

// Сброс фильтров
const resetFilters = () => {
  filters.value = {
    category_id: undefined,
    search: "",
    min_price: undefined,
    max_price: undefined,
    in_stock: undefined,
    per_page: 15,
    page: 1,
  };
  router.push({ query: {} });
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
  if (product.image) {
    return `http://127.0.0.1:8000${product.image}`;
  }
  return "https://via.placeholder.com/300x300/0f172a/38bdf8?text=Товар";
};

// Следим за изменениями query параметров
watch(
  () => route.query,
  (newQuery) => {
    filters.value.category_id = newQuery.category_id
      ? Number(newQuery.category_id)
      : undefined;
    filters.value.search = newQuery.search || "";
    filters.value.min_price = newQuery.min_price
      ? Number(newQuery.min_price)
      : undefined;
    filters.value.max_price = newQuery.max_price
      ? Number(newQuery.max_price)
      : undefined;
    filters.value.in_stock =
      newQuery.in_stock === "true" ? true : undefined;
    filters.value.page = newQuery.page ? Number(newQuery.page) : 1;
    loadData();
  },
  { immediate: true }
);

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="catalog-page">
    <div class="container py-5">
      <div class="row">
        <!-- Фильтры -->
        <div class="col-lg-3 mb-4">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Фильтры</h5>
            </div>
            <div class="card-body">
              <!-- Поиск -->
              <div class="mb-3">
                <label for="search" class="form-label">Поиск</label>
                <input
                  id="search"
                  v-model="filters.search"
                  type="text"
                  class="form-control"
                  placeholder="Название товара..."
                  @keyup.enter="applyFilters"
                />
              </div>

              <!-- Категории -->
              <div class="mb-3">
                <label class="form-label">Категория</label>
                <select
                  v-model="filters.category_id"
                  class="form-select"
                  @change="applyFilters"
                >
                  <option :value="undefined">Все категории</option>
                  <option
                    v-for="category in categories"
                    :key="category.id"
                    :value="category.id"
                  >
                    {{ category.name }}
                  </option>
                </select>
              </div>

              <!-- Цена -->
              <div class="mb-3">
                <label class="form-label">Цена</label>
                <div class="row g-2">
                  <div class="col-6">
                    <input
                      v-model.number="filters.min_price"
                      type="number"
                      class="form-control"
                      placeholder="От"
                      min="0"
                    />
                  </div>
                  <div class="col-6">
                    <input
                      v-model.number="filters.max_price"
                      type="number"
                      class="form-control"
                      placeholder="До"
                      min="0"
                    />
                  </div>
                </div>
              </div>

              <!-- Наличие -->
              <div class="mb-3">
                <div class="form-check">
                  <input
                    id="in_stock"
                    v-model="filters.in_stock"
                    class="form-check-input"
                    type="checkbox"
                    :true-value="true"
                    :false-value="undefined"
                    @change="applyFilters"
                  />
                  <label class="form-check-label" for="in_stock">
                    Только в наличии
                  </label>
                </div>
              </div>

              <!-- Кнопки -->
              <div class="d-grid gap-2">
                <button
                  class="btn btn-primary"
                  type="button"
                  @click="applyFilters"
                >
                  Применить
                </button>
                <button
                  class="btn btn-outline-secondary"
                  type="button"
                  @click="resetFilters"
                >
                  Сбросить
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Товары -->
        <div class="col-lg-9">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">Каталог товаров</h2>
            <div v-if="products" class="text-muted">
              Найдено: {{ products.total || 0 }} товаров
            </div>
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

          <!-- Товары -->
          <div v-else-if="products && products.data?.length" class="row g-4">
            <div
              v-for="product in products.data"
              :key="product.id"
              class="col-md-6 col-xl-4"
            >
              <div class="card h-100 shadow-sm border-0 product-card">
                <div
                  class="product-image-wrapper position-relative ratio ratio-1x1"
                >
                  <img
                    :src="product.image_url"
                    class="card-img-top"
                    :alt="product.name"
                    style="object-fit: cover"
                  />
                  <!-- <span
                    v-if="product.in_stock"
                    class="badge bg-success text-white position-absolute top-0 end-0 m-2"
                  >
                    В наличии
                  </span>
                  <span
                    v-else
                    class="badge bg-danger text-white position-absolute top-0 end-0 m-2"
                  >
                    Нет в наличии
                  </span> -->
                  <div
                    class="product-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                  >
                    <NuxtLink
                      :to="`/product/${product.id}`"
                      class="btn btn-primary btn-sm rounded-pill px-4"
                    >
                      Подробнее
                    </NuxtLink>
                  </div>
                </div>
                <div class="card-body d-flex flex-column">
                  <span
                    v-if="product.category"
                    class="badge bg-primary mb-2 align-self-start"
                  >
                    {{ product.category.name }}
                  </span>
                  <h5 class="card-title fw-bold mb-2">{{ product.name }}</h5>
                  <p
                    v-if="product.short_description"
                    class="card-text text-muted small mb-3 flex-grow-1"
                  >
                    {{ product.short_description }}
                  </p>
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <span
                        v-if="product.sale_price"
                        class="text-decoration-line-through text-muted me-2"
                      >
                        {{ formatPrice(product.price) }}
                      </span>
                      <span class="h5 text-primary fw-bold mb-0">
                        {{ formatPrice(product.final_price || product.price) }}
                      </span>
                      <span class="text-muted small ms-1">сом</span>
                    </div>
                    <button
                      class="btn btn-outline-primary btn-sm"
                      :disabled="!product.in_stock"
                      @click="
                        $router.push(`/product/${product.id}`)
                      "
                    >
                      <i class="bi bi-cart-plus"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Пусто -->
          <div v-else class="text-center py-5">
            <p class="text-muted">Товары не найдены</p>
          </div>

          <!-- Пагинация -->
          <nav
            v-if="products && products.last_page > 1"
            aria-label="Навигация по страницам"
            class="mt-4"
          >
            <ul class="pagination justify-content-center">
              <li
                class="page-item"
                :class="{ disabled: products.current_page === 1 }"
              >
                <NuxtLink
                  class="page-link"
                  :to="{
                    query: { ...route.query, page: products.current_page - 1 },
                  }"
                >
                  Предыдущая
                </NuxtLink>
              </li>
              <li
                v-for="page in products.last_page"
                :key="page"
                class="page-item"
                :class="{ active: page === products.current_page }"
              >
                <NuxtLink
                  class="page-link"
                  :to="{ query: { ...route.query, page } }"
                >
                  {{ page }}
                </NuxtLink>
              </li>
              <li
                class="page-item"
                :class="{
                  disabled: products.current_page === products.last_page,
                }"
              >
                <NuxtLink
                  class="page-link"
                  :to="{
                    query: { ...route.query, page: products.current_page + 1 },
                  }"
                >
                  Следующая
                </NuxtLink>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.product-image-wrapper {
  overflow: hidden;
  background: #f8fafc;
}

.product-image-wrapper img {
  transition: transform 0.5s ease;
}

.product-card:hover .product-image-wrapper img {
  transform: scale(1.1);
}

.product-overlay {
  background: rgba(15, 23, 42, 0.7);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}
</style>
