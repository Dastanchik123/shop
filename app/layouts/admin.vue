<template>
  <div class="admin-layout">
    <aside class="sidebar">
      <h3>Admin</h3>
      <NuxtLink to="/admin">Dashboard</NuxtLink>
      <NuxtLink to="/admin/products">Products</NuxtLink>
      <NuxtLink to="/admin/users">Users</NuxtLink>
    </aside>

    <main class="content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 220px;
  background: #0f172a;
  color: #fff;
  padding: 20px;
}

.sidebar a {
  display: block;
  margin: 10px 0;
  color: #94a3b8;
  text-decoration: none;
}

.sidebar a.router-link-active {
  color: #38bdf8;
}

.content {
  flex: 1;
  padding: 24px;
}
</style>
