<script setup lang="ts">
definePageMeta({
  layout: "admin",
  middleware: "auth",
});
</script>

<template>
  <div>
    <h1>Админ-панель</h1>

    <div class="stats">
      <div class="card">
        <h3>Пользователи</h3>
        <p>120</p>
      </div>

      <div class="card">
        <h3>Заказы</h3>
        <p>58</p>
      </div>

      <div class="card">
        <h3>Доход</h3>
        <p>245 000⃀</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 20px;
}

.card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
}

.card h3 {
  margin-bottom: 10px;
  color: #475569;
}

.card p {
  font-size: 24px;
  color: #0f172a;
}
</style>
