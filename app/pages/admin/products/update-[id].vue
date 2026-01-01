<script setup>
import { ref, onMounted } from "vue";
import { useProducts } from "~/composables/useProducts";
import { useRoute, useRouter } from "vue-router";

definePageMeta({
  layout: "admin",
  // middleware: ["auth"],
});

const route = useRoute();
const router = useRouter();
const { getProduct, updateProduct, getCategories } = useProducts();
const id = route.params.id;

const categories = ref([]);
const isLoading = ref(false);
const isSaving = ref(false);
const errors = ref({});

const form = ref({
  name: "",
  sku: "",
  price: "",
  sale_price: "",
  stock_quantity: 0,
  category_id: "",
  description: "",
  short_description: "",
  image: "",
  is_active: true,
  in_stock: true,
  weight: "",
  dimensions: "",
  attributes: {},
});

const selectedFile = ref(null);
const imagePreview = ref(null);

// Helper for attributes (key-value)
const attributeList = ref([]);

const fetchCategories = async () => {
  try {
    const response = await getCategories();
    categories.value = Array.isArray(response) ? response : response.data || [];
  } catch (error) {
    console.error("Error fetching categories", error);
  }
};

const fetchProduct = async () => {
  isLoading.value = true;
  try {
    const product = await getProduct(id);

    // Fill form
    form.value = {
      ...form.value,
      ...product,
      // Ensure specific types
      category_id: product.category?.id || product.category_id,
      is_active: !!product.is_active,
      in_stock: !!product.in_stock,
    };

    if (product.image) {
      imagePreview.value = product.image.startsWith("http")
        ? product.image
        : `http://127.0.0.1:8000/storage/${product.image}`; // Simple assumption for local execution or relative path
      // Note: Adjust base URL logic as needed for production
    }

    // Parse attributes if they exist
    if (product.attributes && typeof product.attributes === "object") {
      attributeList.value = Object.entries(product.attributes).map(
        ([key, value]) => ({ key, value })
      );
    }
  } catch (error) {
    console.error("Error fetching product", error);
    alert("Товар не найден");
    router.push("/admin/products");
  } finally {
    isLoading.value = false;
  }
};

const addAttribute = () => {
  attributeList.value.push({ key: "", value: "" });
};

const removeAttribute = (index) => {
  attributeList.value.splice(index, 1);
};

const handleFileUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
    // Создаем превью
    const reader = new FileReader();
    reader.onload = (e) => {
      imagePreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    selectedFile.value = null;
    // Если отменили выбор, возвращаем старое превью (или очищаем)
    // imagePreview.value = form.value.image ? ... : null;
    // Для простоты пока оставляем как есть или сбрасываем
  }
};

const handleSubmit = async () => {
  isSaving.value = true;
  errors.value = {};

  try {
    const formData = new FormData();

    // Добавляем основные поля
    Object.keys(form.value).forEach((key) => {
      let value = form.value[key];

      // Пропускаем атрибуты (обработаем отдельно) и image (если не файл)
      if (key === "attributes") return;
      if (key === "image") return; // Image только через файл
      if (key === "category") return; // Не отправляем объект категории
      if (key === "reviews") return; // Не отправляем отзывы

      if (value === null || value === undefined) return;

      if (typeof value === "boolean") {
        value = value ? "1" : "0";
      }

      formData.append(key, value);
    });

    // Добавляем файл
    if (selectedFile.value) {
      formData.append("image", selectedFile.value);
    }

    // Добавляем атрибуты как массив/объект
    // Laravel validation 'attributes' => 'nullable|array'
    // FormData не поддерживает вложенные объекты напрямую, используем нотацию скобок
    attributeList.value.forEach((item, index) => {
      if (item.key) {
        // Отправляем как ассоциативный массив: attributes[Ключ] = Значение
        formData.append(`attributes[${item.key}]`, item.value);
      }
    });

    await updateProduct(id, formData);
    router.push("/admin/products");
  } catch (error) {
    if (error.data && error.data.errors) {
      errors.value = error.data.errors;
    } else {
      console.error(error);
      alert("Ошибка при обновлении товара");
    }
  } finally {
    isSaving.value = false;
  }
};

onMounted(async () => {
  await fetchCategories();
  await fetchProduct();
});
</script>

<template>
  <div class="container-fluid p-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="h3 text-gray-800">Редактирование товара #{{ id }}</h1>
      <NuxtLink to="/admin/products" class="btn btn-link text-decoration-none">
        &larr; Назад к списку
      </NuxtLink>
    </div>

    <div v-if="isLoading" class="text-center p-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Загрузка...</span>
      </div>
    </div>

    <div v-else class="card shadow-sm">
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <!-- Основная информация -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label">Название товара *</label>
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

            <div class="col-md-6">
              <label class="form-label">SKU (Артикул) *</label>
              <input
                v-model="form.sku"
                type="text"
                class="form-control"
                :class="{ 'is-invalid': errors.sku }"
                required
              />
              <div v-if="errors.sku" class="invalid-feedback">
                {{ errors.sku[0] }}
              </div>
            </div>
          </div>

          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label">Категория *</label>
              <select
                v-model="form.category_id"
                class="form-select"
                :class="{ 'is-invalid': errors.category_id }"
                required
              >
                <option value="" disabled>Выберите категорию</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.id">
                  {{ cat.name }}
                </option>
              </select>
              <div v-if="errors.category_id" class="invalid-feedback">
                {{ errors.category_id[0] }}
              </div>
            </div>

            <div class="col-md-6">
              <label class="form-label">Статус</label>
              <div class="d-flex gap-3 mt-2">
                <div class="form-check">
                  <input
                    v-model="form.is_active"
                    type="checkbox"
                    class="form-check-input"
                    id="isActive"
                  />
                  <label class="form-check-label" for="isActive">Активен</label>
                </div>
                <div class="form-check">
                  <input
                    v-model="form.in_stock"
                    type="checkbox"
                    class="form-check-input"
                    id="inStock"
                  />
                  <label class="form-check-label" for="inStock"
                    >В наличии</label
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Цены и Склад -->
          <div class="row g-3 mb-4">
            <div class="col-md-4">
              <label class="form-label">Цена *</label>
              <div class="input-group">
                <input
                  v-model="form.price"
                  type="number"
                  step="0.01"
                  class="form-control"
                  :class="{ 'is-invalid': errors.price }"
                  required
                />
                <span class="input-group-text">₽</span>
              </div>
              <div v-if="errors.price" class="text-danger small">
                {{ errors.price[0] }}
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Цена со скидкой</label>
              <div class="input-group">
                <input
                  v-model="form.sale_price"
                  type="number"
                  step="0.01"
                  class="form-control"
                />
                <span class="input-group-text">₽</span>
              </div>
            </div>

            <div class="col-md-4">
              <label class="form-label">Количество на складе</label>
              <input
                v-model="form.stock_quantity"
                type="number"
                class="form-control"
              />
            </div>
          </div>

          <!-- Описание -->
          <div class="mb-4">
            <label class="form-label">Краткое описание</label>
            <textarea
              v-model="form.short_description"
              rows="2"
              class="form-control"
            ></textarea>
          </div>

          <div class="mb-4">
            <label class="form-label">Полное описание</label>
            <textarea
              v-model="form.description"
              rows="5"
              class="form-control"
            ></textarea>
          </div>

          <!-- Изображения -->
          <div class="mb-4">
            <label class="form-label">Изображение</label>

            <div class="mb-2">
              <input
                @change="handleFileUpload"
                type="file"
                class="form-control"
                accept="image/*"
              />
            </div>

            <div v-if="imagePreview" class="mt-2">
              <div class="small text-muted mb-1">
                Предпросмотр (Текущее/Новое):
              </div>
              <img
                :src="imagePreview"
                class="img-thumbnail"
                style="max-height: 150px"
              />
            </div>
          </div>

          <!-- Дополнительно -->
          <div class="row g-3 mb-4">
            <div class="col-md-6">
              <label class="form-label">Вес (кг)</label>
              <input
                v-model="form.weight"
                type="number"
                step="0.01"
                class="form-control"
              />
            </div>
            <div class="col-md-6">
              <label class="form-label">Габариты (LxWxH)</label>
              <input
                v-model="form.dimensions"
                type="text"
                placeholder="30x20x10 cm"
                class="form-control"
              />
            </div>
          </div>

          <!-- Атрибуты -->
          <div class="border-top pt-4">
            <label class="form-label mb-2">Характеристики</label>
            <div
              v-for="(attr, index) in attributeList"
              :key="index"
              class="input-group mb-2"
            >
              <input
                v-model="attr.key"
                placeholder="Название (напр. Цвет)"
                class="form-control"
              />
              <input
                v-model="attr.value"
                placeholder="Значение (напр. Красный)"
                class="form-control"
              />
              <button
                @click.prevent="removeAttribute(index)"
                class="btn btn-outline-danger"
              >
                ✕
              </button>
            </div>
            <button
              @click.prevent="addAttribute"
              class="btn btn-sm btn-link text-decoration-none ps-0"
            >
              + Добавить характеристику
            </button>
          </div>

          <div class="d-flex justify-content-end gap-2 pt-3 border-top mt-3">
            <NuxtLink to="/admin/products" class="btn btn-outline-secondary">
              Отмена
            </NuxtLink>
            <button type="submit" :disabled="isSaving" class="btn btn-primary">
              {{ isSaving ? "Сохранение..." : "Сохранить изменения" }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
