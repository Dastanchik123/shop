<script setup>
import { ref, onMounted } from "vue";
import { useProducts } from "~/composables/useProducts"; // reusing useProducts as we added category methods there

definePageMeta({
  layout: "admin",
  // middleware: ["auth"],
});

const { getCategories, createCategory, updateCategory, deleteCategory } =
  useProducts();

const categories = ref([]);
const isLoading = ref(false);
const isModalOpen = ref(false);
const isEditing = ref(false);
const errors = ref({});

const form = ref({
  id: null,
  name: "",
  slug: "",
  description: "",
  parent_id: "",
  is_active: true,
  sort_order: 0,
});

const fetchCategories = async () => {
  isLoading.value = true;
  try {
    const response = await getCategories();
    // Support both array and paginated response
    categories.value = Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

const openCreateModal = () => {
  isEditing.value = false;
  form.value = {
    id: null,
    name: "",
    slug: "",
    description: "",
    parent_id: "",
    is_active: true,
    sort_order: 0,
  };
  errors.value = {};
  isModalOpen.value = true;
};

const openEditModal = (category) => {
  isEditing.value = true;
  form.value = { ...category, parent_id: category.parent_id || "" }; // Ensure parent_id is compatible with select
  errors.value = {};
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
};

const handleSubmit = async () => {
  errors.value = {};
  try {
    if (isEditing.value) {
      await updateCategory(form.value.id, form.value);
    } else {
      await createCategory(form.value);
    }
    closeModal();
    fetchCategories();
  } catch (error) {
    if (error.data && error.data.errors) {
      errors.value = error.data.errors;
    } else {
      console.error(error);
      alert("Ошибка при сохранении категории");
    }
  }
};

const handleDelete = async (id) => {
  if (!confirm("Вы уверены? Это может удалить и подкатегории!")) return;
  try {
    await deleteCategory(id);
    fetchCategories();
  } catch (error) {
    console.error(error);
    alert("Ошибка при удалении");
  }
};

onMounted(() => {
  fetchCategories();
});
</script>

<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 text-gray-800">Категории</h1>
      <button @click="openCreateModal" class="btn btn-primary">
        + Создать категорию
      </button>
    </div>

    <!-- Список категорий -->
    <div class="card shadow-sm">
      <div v-if="isLoading" class="p-5 text-center text-muted">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Загрузка...</span>
        </div>
      </div>
      <div
        v-else-if="categories.length === 0"
        class="p-5 text-center text-muted"
      >
        Нет категорий
      </div>

      <div v-else class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light">
            <tr>
              <th scope="col" class="ps-4">ID</th>
              <th scope="col">Название</th>
              <th scope="col">Slug</th>
              <th scope="col">Активность</th>
              <th scope="col" class="text-end pe-4">Действия</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="cat in categories" :key="cat.id">
              <td class="ps-4 text-muted">{{ cat.id }}</td>
              <td class="fw-medium">
                {{ cat.name }}
                <span v-if="cat.parent_id" class="badge bg-secondary ms-2"
                  >Подкатегория</span
                >
              </td>
              <td class="text-muted">{{ cat.slug }}</td>
              <td>
                <span
                  class="badge rounded-pill"
                  :class="cat.is_active ? 'text-bg-success' : 'text-bg-danger'"
                >
                  {{ cat.is_active ? "Активна" : "Скрыта" }}
                </span>
              </td>
              <td class="text-end pe-4">
                <button
                  @click="openEditModal(cat)"
                  class="btn btn-sm btn-outline-primary me-2"
                >
                  Ред.
                </button>
                <button
                  @click="handleDelete(cat.id)"
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

    <!-- Модальное окно (Bootstrap Overlay) -->
    <div
      v-if="isModalOpen"
      class="modal d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditing ? "Редактировать" : "Создать" }} категорию
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="closeModal"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label class="form-label">Название *</label>
                <input
                  v-model="form.name"
                  type="text"
                  class="form-control"
                  :class="{ 'is-invalid': errors.name }"
                  required
                />
                <div v-if="errors.name" class="invalid-feedback">
                  {{ errors.name[0] }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Slug</label>
                <input
                  v-model="form.slug"
                  type="text"
                  class="form-control"
                  placeholder="Автоматически если пусто"
                />
                <div v-if="errors.slug" class="invalid-feedback d-block">
                  {{ errors.slug[0] }}
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Родительская категория</label>
                <select v-model="form.parent_id" class="form-select">
                  <option value="">Нет (Корневая)</option>
                  <option
                    v-for="cat in categories"
                    :key="cat.id"
                    :value="cat.id"
                    v-show="cat.id !== form.id"
                  >
                    {{ cat.name }}
                  </option>
                </select>
              </div>

              <div class="form-check mb-3">
                <input
                  v-model="form.is_active"
                  class="form-check-input"
                  type="checkbox"
                  id="is_active"
                />
                <label class="form-check-label" for="is_active">
                  Активна
                </label>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  @click="closeModal"
                >
                  Отмена
                </button>
                <button type="submit" class="btn btn-primary">Сохранить</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
