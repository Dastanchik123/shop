<script setup>
const { login } = useAuth();
const authStore = useAuthStore();

definePageMeta({
  layout: "auth",
  middleware: "guest",
});

const form = ref({
  email: "",
  password: "",
});

const errors = ref({});
const loading = ref(false);

const handleSubmit = async () => {
  errors.value = {};
  loading.value = true;

  try {
    await login(form.value);
    await navigateTo("/");
  } catch (error) {
    if (error.data?.errors) {
      errors.value = error.data.errors;
    } else if (error.data?.message) {
      errors.value = { general: [error.data.message] };
    } else {
      errors.value = { general: ["Ошибка при входе. Проверьте данные."] };
    }
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <div class="text-center mb-4">
                <h2 class="fw-bold mb-2">Вход в систему</h2>
                <p class="text-muted">Войдите в свой аккаунт</p>
              </div>

              <div v-if="errors.general" class="alert alert-danger" role="alert">
                <ul class="mb-0">
                  <li v-for="error in errors.general" :key="error">
                    {{ error }}
                  </li>
                </ul>
              </div>

              <form @submit.prevent="handleSubmit">
                <div class="mb-3">
                  <label for="email" class="form-label">Email</label>
                  <input
                    id="email"
                    v-model="form.email"
                    type="email"
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                    placeholder="your@email.com"
                    required
                  />
                  <div v-if="errors.email" class="invalid-feedback">
                    <div v-for="error in errors.email" :key="error">
                      {{ error }}
                    </div>
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Пароль</label>
                  <input
                    id="password"
                    v-model="form.password"
                    type="password"
                    class="form-control"
                    :class="{ 'is-invalid': errors.password }"
                    placeholder="••••••••"
                    required
                  />
                  <div v-if="errors.password" class="invalid-feedback">
                    <div v-for="error in errors.password" :key="error">
                      {{ error }}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  class="btn btn-primary w-100 py-2 mb-3"
                  :disabled="loading"
                >
                  <span
                    v-if="loading"
                    class="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  {{ loading ? "Вход..." : "Войти" }}
                </button>
              </form>

              <div class="text-center">
                <p class="mb-0">
                  Нет аккаунта?
                  <NuxtLink to="/auth/register" class="text-primary">
                    Зарегистрироваться
                  </NuxtLink>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 200px);
  display: flex;
  align-items: center;
  padding: 40px 0;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
}
</style>
