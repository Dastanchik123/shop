<script setup>
definePageMeta({
  layout: "admin",
  // middleware: ["auth"],
});
</script>

<template>
  <div class="container-fluid p-4">
    <h1 class="h3 mb-4 text-gray-800">Панель управления</h1>

    <div class="row g-4">
      <div class="col-md-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">Товары</h5>
            <p class="card-text text-muted">
              Управление каталогом товаров, ценами и остатками.
            </p>
            <NuxtLink to="/admin/products" class="btn btn-outline-primary"
              >Перейти к товарам &rarr;</NuxtLink
            >
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">Категории</h5>
            <p class="card-text text-muted">
              Структура каталога и управление категориями.
            </p>
            <NuxtLink to="/admin/categories" class="btn btn-outline-primary"
              >Перейти к категориям &rarr;</NuxtLink
            >
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card shadow-sm h-100">
          <div class="card-body">
            <h5 class="card-title">Заказы</h5>
            <p class="card-text text-muted">
              Просмотр и обработка заказов клиентов.
            </p>
            <NuxtLink to="/admin/orders" class="btn btn-outline-primary"
              >Перейти к заказам &rarr;</NuxtLink
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Quick instructions or status -->
    <div class="alert alert-info mt-4" role="alert">
      <h4 class="alert-heading h5">Добро пожаловать в админ-панель</h4>
      <p class="mb-0">
        Используйте меню слева для навигации по разделам. Здесь вы можете
        управлять контентом вашего интернет-магазина.
      </p>
    </div>
  </div>
</template>
