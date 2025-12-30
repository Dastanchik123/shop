<!-- /pages/admin/products.vue -->

<script setup>
import { ref, onMounted } from "vue";
import { useProducts } from "~/composables/useProducts";

definePageMeta({
  layout: 'admin',
})

const { getProducts, getCategories } = useProducts();

const products = ref({
  data: [],
  current_page: 1,
  last_page: 1,
});

const categories = ref([]);

const filters = ref({
  search: "",
  category_id: "",
  is_active: "",
  page: 1,
  per_page: 10,
});

const fetchProducts = async () => {
  const params = { ...filters.value, page: filters.value.page };
  if (filters.value.is_active === "") delete params.is_active;
  if (filters.value.category_id === "") delete params.category_id;

  const data = await getProducts(params);
  products.value = data;
};

const fetchCategories = async () => {
  try {
    const response = await getCategories();
    categories.value = response.data || []; // массив категорий
  } catch (error) {
    console.error(error);
  }
};

const changePage = (page) => {
  filters.value.page = page;
  fetchProducts();
};

onMounted(async () => {
  await fetchCategories();
  await fetchProducts();
});
</script>

<template>
  <div class="p-6 bg-gray-100 min-h-screen">
    <h1 class="text-3xl font-bold mb-6">Управление товарами</h1>

    <!-- Фильтры -->
    <div class="flex gap-4 mb-6 flex-wrap">
      <input
        v-model="filters.search"
        @input="fetchProducts"
        type="text"
        placeholder="Поиск по названию..."
        class="px-4 py-2 rounded border w-full md:w-1/3"
      />
      <select
        v-model="filters.category_id"
        @change="fetchProducts"
        class="px-4 py-2 rounded border"
      >
        <option value="">Все категории</option>
        <option v-for="cat in categories" :key="cat.id" :value="cat.id">
          {{ cat.title }}
        </option>
      </select>
      <select
        v-model="filters.is_active"
        @change="fetchProducts"
        class="px-4 py-2 rounded border"
      >
        <option value="">Все</option>
        <option :value="true">Активные</option>
        <option :value="false">Неактивные</option>
      </select>
    </div>

    <!-- Таблица товаров -->
    <div class="overflow-x-auto bg-white shadow rounded-lg">
      <table class="min-w-full table-auto">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-left">ID</th>
            <th class="px-4 py-2 text-left">Название</th>
            <th class="px-4 py-2 text-left">Категория</th>
            <th class="px-4 py-2 text-left">Цена</th>
            <th class="px-4 py-2 text-left">Статус</th>
            <th class="px-4 py-2 text-left">Действия</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="product in products.data"
            :key="product.id"
            class="border-b hover:bg-gray-50"
          >
            <td class="px-4 py-2">{{ product.id }}</td>
            <td class="px-4 py-2">{{ product.name }}</td>
            <td class="px-4 py-2">{{ product.category || "-" }}</td>
            <td class="px-4 py-2">{{ product.price }} ₽</td>
            <td class="px-4 py-2">
              <span :class="product.is_active ? 'text-green-600' : 'text-red-600'">
                {{ product.is_active ? "Активен" : "Не активен" }}
              </span>
            </td>
            <td class="px-4 py-2 flex gap-2">
              <button class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
                Редактировать
              </button>
              <button class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">
                Удалить
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Пагинация -->
    <div class="mt-4 flex justify-end gap-2">
      <button
        :disabled="products.current_page <= 1"
        @click="changePage(products.current_page - 1)"
        class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
      >
        Назад
      </button>
      <span class="px-3 py-1">{{ products.current_page }} / {{ products.last_page }}</span>
      <button
        :disabled="products.current_page >= products.last_page"
        @click="changePage(products.current_page + 1)"
        class="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
      >
        Вперед
      </button>
    </div>
  </div>
</template>



<style scoped>
tr:hover {
  transition: background-color 0.2s;
}
</style>
