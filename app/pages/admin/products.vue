<script setup>
import { useProductsStore } from "#imports";
const { getProducts, getCategories } = useProducts();

const featuredProducts = ref([]);
const loading = ref(false);

const loadData = async () => {
  loading.value = true;
  try {
    const productsData = await getProducts();

    featuredProducts.value = productsData.data || [];
    console.log(productsData.data);
    
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
};
onMounted(() => {
  loadData();
});
</script>
<template>
  <table class="table">
    <thead>
      <tr>
        <th>#</th>
        <th>Название</th>
        <th>Цена</th>
        <th>Статус</th>
        <th></th>
      </tr>
    </thead>

    <tbody>
      <tr v-for="product in featuredProducts" :key="product.id">
        <td>{{ product.id }}</td>
        <td>{{ product.name }}</td>
        <td>{{ product.price.toLocaleString() }} ₸</td>
        <td>
          <span class="status" :class="product.status">
            {{ product.status }}
          </span>
        </td>
        <td class="actions">
          <NuxtLink :to="`/admin/products/${product.id}`" class="link">
            Редактировать
          </NuxtLink>

          <button class="link danger" @click="deleteProduct(product.id)">
            Удалить
          </button>
        </td>
      </tr>
    </tbody>
  </table>
</template>
<style scoped>
.btn {
  background: #38bdf8;
  color: #0f172a;
  padding: 8px 14px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;
}

th,
td {
  padding: 12px;
  border-bottom: 1px solid #e5e7eb;
  text-align: left;
}

th {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
}

.link {
  background: none;
  border: none;
  color: #38bdf8;
  cursor: pointer;
  padding: 0;
  text-decoration: none;
}

.link.danger {
  color: #ef4444;
}

.status {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 500;
}

.status.active {
  background: #dcfce7;
  color: #166534;
}

.status.inactive {
  background: #fee2e2;
  color: #991b1b;
}
</style>
