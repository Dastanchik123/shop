<script setup>
import { ref, onMounted } from "vue";
import { useUsers } from "~/composables/useUsers";

definePageMeta({
  layout: "admin",
  // middleware: ["auth"],
});

const { getUsers, deleteUser } = useUsers();

const users = ref({
  data: [],
  current_page: 1,
  last_page: 1,
  total: 0,
  per_page: 15,
});

const isLoading = ref(false);
const filters = ref({
  search: "",
  page: 1,
});

// Debounce helper
let searchTimeout = null;
const handleSearchInput = () => {
  if (searchTimeout) clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    filters.value.page = 1;
    fetchUsers();
  }, 500);
};

const fetchUsers = async () => {
  isLoading.value = true;
  try {
    const data = await getUsers(filters.value);
    users.value = data;
    if (!users.value.last_page && users.value.total) {
      users.value.last_page = Math.ceil(
        users.value.total / users.value.per_page
      );
    }
    console.log(users.value);
    
  } catch (error) {
    console.error("Error fetching users:", error);
  } finally {
    isLoading.value = false;
  }
};

const changePage = (page) => {
  if (page < 1 || page > users.value.last_page) return;
  filters.value.page = page;
  fetchUsers();
};

const handleDelete = async (id) => {
  if (!confirm("Вы уверены, что хотите удалить этого пользователя?")) return;
  try {
    await deleteUser(id);
    fetchUsers();
  } catch (error) {
    console.error(error);
    alert("Ошибка при удалении пользователя");
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("ru-RU");
};

onMounted(() => {
  fetchUsers();
});
</script>

<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 text-gray-800">Пользователи</h1>
    </div>

    <!-- Фильтры -->
    <div class="card shadow-sm mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-4">
            <input
              v-model="filters.search"
              @input="handleSearchInput"
              type="text"
              class="form-control"
              placeholder="Поиск по имени или email..."
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Таблица -->
    <div class="card shadow-sm">
      <div v-if="isLoading" class="p-5 text-center text-muted">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>

      <div
        v-else-if="users.data.length === 0"
        class="p-5 text-center text-muted"
      >
        Пользователи не найдены
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-4">ID</th>
              <th scope="col">Имя</th>
              <th scope="col">Email</th>
              <th scope="col">Дата регистрации</th>
              <th scope="col" class="text-end pe-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users.data" :key="user.id">
              <td class="ps-4 text-muted">{{ user.id }}</td>
              <td class="fw-medium">{{ user.name }}</td>
              <td>
                <a
                  :href="`mailto:${user.email}`"
                  class="text-decoration-none"
                  >{{ user.email }}</a
                >
              </td>
              <td class="text-muted small">
                {{ formatDate(user.created_at) }}
              </td>
              <td class="text-end pe-4">
                <button
                  @click="handleDelete(user.id)"
                  class="btn btn-sm btn-outline-danger"
                >
                  Удалить
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Пагинация -->
    <div
      v-if="users.last_page > 1"
      class="d-flex justify-content-end align-items-center mt-3 gap-2"
    >
      <button
        :disabled="users.current_page <= 1"
        @click="changePage(users.current_page - 1)"
        class="btn btn-outline-secondary btn-sm"
      >
        Назад
      </button>
      <span class="small text-muted"
        >{{ users.current_page }} из {{ users.last_page }}</span
      >
      <button
        :disabled="users.current_page >= users.last_page"
        @click="changePage(users.current_page + 1)"
        class="btn btn-outline-secondary btn-sm"
      >
        Вперед
      </button>
    </div>
  </div>
</template>
