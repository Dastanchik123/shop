<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <h3>Admin</h3>
      <NuxtLink to="/admin">Панель управления</NuxtLink>
      <NuxtLink to="/admin/products">Товары</NuxtLink>
      <NuxtLink to="/admin/orders">Заказы</NuxtLink>
    </aside>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
h3 {
  text-align: center;
}
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #0f172a;
  color: #fff;
  padding: 20px;
  padding-right: 0;
}

.sidebar a {
  display: block;
  margin: 10px 0;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 10px;
  padding: 0.4rem 1rem;
}

.sidebar a.router-link-active {
  font-weight: bold;
  color: #0f172a;
  background-color: #fff;
  width: 100%;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    background-color: transparent;
    top: -30px;
    right: 0;
    width: 30px;
    height: 30px;
    box-shadow: 10px 10px 2px 0px white;
    border-radius: 50%;
  }
  &::before {
    content: "";
    position: absolute;
    background-color: transparent;
    bottom: -30px;
    right: 0;
    width: 30px;
    height: 30px;
    box-shadow: 10px -10px 2px 0px white;
    border-radius: 50%;
  }
}

.content {
  flex: 1;
  padding: 24px;
}
</style>
