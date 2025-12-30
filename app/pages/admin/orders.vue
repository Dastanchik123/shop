<script setup>
definePageMeta({
  layout: "admin",
});

import { useFetch } from "#app";

const { data: orders, pending } = await useFetch(
  "http://127.0.0.1:8000/api/orders",
  {
    default: () => [],
  }
);

const statusClass = (status) => {
  switch (status) {
    case "new":
      return "bg-blue-100 text-blue-700";
    case "paid":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

</script>
<template>
  <div class="p-6">
    <h1 class="text-2xl font-semibold mb-6">Заказы</h1>

    <div v-if="pending" class="text-gray-500">Загрузка заказов...</div>

    <div v-else-if="orders.length === 0" class="text-gray-500">
      Заказов пока нет
    </div>

    <div v-else class="overflow-x-auto">
      <table class="w-full border border-gray-200 rounded-lg">
        <thead class="bg-gray-100 text-left">
          <tr>
            <th class="p-3">№</th>
            <th class="p-3">Клиент</th>
            <th class="p-3">Сумма</th>
            <th class="p-3">Статус</th>
            <th class="p-3">Дата</th>
            <th class="p-3">Действия</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(order, index) in orders"
            :key="order.id"
            class="border-t hover:bg-gray-50"
          >
            <td class="p-3">{{ index + 1 }}</td>
            <td class="p-3">{{ order.customer_name }}</td>
            <td class="p-3 font-medium">{{ order.total }} сом</td>

            <td class="p-3">
              <span
                class="px-2 py-1 rounded text-sm"
                :class="statusClass(order.status)"
              >
                {{ order.status }}
              </span>
            </td>

            <td class="p-3">
              {{ formatDate(order.created_at) }}
            </td>

            <td class="p-3">
              <NuxtLink
                :to="`/orders/${order.id}`"
                class="text-blue-600 hover:underline"
              >
                Подробнее
              </NuxtLink>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
