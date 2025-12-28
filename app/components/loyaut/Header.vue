<template>
  <header class="header">
    <nav class="nav container">
      <NuxtLink to="/" class="logo"> MyShop </NuxtLink>

      <ul class="menu">
        <li>
          <NuxtLink to="/" active-class="active"> Главная </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/catalog" active-class="active"> Каталог </NuxtLink>
        </li>

        <li>
          <NuxtLink to="/cart" active-class="active" class="position-relative">
            <i class="bi bi-cart"></i> Корзина
            <span
              v-if="cartStore.itemsCount > 0"
              class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
              style="font-size: 0.7rem"
            >
              {{ cartStore.itemsCount }}
            </span>
          </NuxtLink>
        </li>

        <li v-if="authStore.isAuthenticated">
          <div class="dropdown">
            <button
              class="btn btn-link text-decoration-none text-white p-0 border-0"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <i class="bi bi-person-circle"></i>
              {{ authStore.user?.name || "Профиль" }}
            </button>
            <ul class="dropdown-menu dropdown-menu-end">
              <li>
                <NuxtLink class="dropdown-item text-dark" to="/profile">
                  Профиль
                </NuxtLink>
              </li>
              <li>
                <NuxtLink class="dropdown-item text-dark" to="/profile/orders">
                  Мои заказы
                </NuxtLink>
              </li>
              <li>
                <hr class="dropdown-divider" />
              </li>
              <li>
                <button class="dropdown-item text-danger" @click="handleLogout">
                  Выйти
                </button>
              </li>
            </ul>
          </div>
        </li>

        <li v-else>
          <NuxtLink to="/auth/login" active-class="active"> Войти </NuxtLink>
        </li>
      </ul>
    </nav>
  </header>
</template>

<script setup>
const authStore = useAuthStore();
const cartStore = useCartStore();
const { logout } = useAuth();
const { getCart } = useCart();

// Загрузка корзины при монтировании
onMounted(() => {
  authStore.initAuth();
  if (authStore.isAuthenticated) {
    getCart().catch(() => {
      // Игнорируем ошибки загрузки корзины
    });
  }
});

const handleLogout = async () => {
  await logout();
};
</script>

<style scoped>
.header {
  background: #0f172a;
  padding: 16px 24px;
}

.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  color: #ffffff;
  font-size: 20px;
  font-weight: 700;
  text-decoration: none;
}

.menu {
  display: flex;
  gap: 20px;
  list-style: none;
}

.menu a {
  color: #cbd5f5;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}


.menu a:hover {
  color: #ffffff;
}

.active {
  color: #38bdf8;
  padding-bottom: 2px;
  position: relative;
}

.active::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2px;
  background-color: #38bdf8;

  transform: scaleX(0);
  transform-origin: left;
  animation: activeLine 0.2s ease-in-out forwards;
}

@keyframes activeLine {
  to {
    transform: scaleX(1);
  }
}
</style>
