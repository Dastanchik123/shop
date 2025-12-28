<script setup>
const { getUser, logout } = useAuth();
const authStore = useAuthStore();

definePageMeta({
  middleware: "auth",
});

const user = ref(null);
const loading = ref(false);

const loadUser = async () => {
  loading.value = true;
  try {
    user.value = await getUser();
  } catch (error) {
    console.error("Error loading user:", error);
  } finally {
    loading.value = false;
  }
};

const handleLogout = async () => {
  await logout();
};

onMounted(() => {
  if (authStore.user) {
    user.value = authStore.user;
  } else {
    loadUser();
  }
});
</script>

<template>
  <div class="profile-page">
    <div class="container py-5">
      <h2 class="mb-4">Профиль</h2>

      <div v-if="loading" class="text-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>

      <div v-else class="row">
        <div class="col-lg-8">
          <div class="card shadow-sm border-0">
            <div class="card-header bg-primary text-white">
              <h5 class="mb-0">Личная информация</h5>
            </div>
            <div class="card-body">
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong>Имя:</strong>
                </div>
                <div class="col-sm-8">{{ user?.name || "Не указано" }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong>Email:</strong>
                </div>
                <div class="col-sm-8">{{ user?.email || "Не указано" }}</div>
              </div>
              <div class="row mb-3">
                <div class="col-sm-4">
                  <strong>Дата регистрации:</strong>
                </div>
                <div class="col-sm-8">
                  {{
                    user?.created_at
                      ? new Date(user.created_at).toLocaleDateString("ru-RU")
                      : "Не указано"
                  }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="card shadow-sm border-0 mb-3">
            <div class="card-body">
              <h5 class="card-title">Быстрые действия</h5>
              <div class="d-grid gap-2">
                <NuxtLink to="/profile/orders" class="btn btn-outline-primary">
                  <i class="bi bi-bag"></i> Мои заказы
                </NuxtLink>
                <button
                  class="btn btn-outline-danger"
                  @click="handleLogout"
                >
                  <i class="bi bi-box-arrow-right"></i> Выйти
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
