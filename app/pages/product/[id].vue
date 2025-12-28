<script setup>
const route = useRoute();
const { getProduct } = useProducts();
const { addToCart } = useCart();
const authStore = useAuthStore();

const product = ref(null);
const pending = ref(false);
const error = ref(null);

const title = computed(() =>
  product.value ? product.value.name : "Страница товара"
);

// Загрузка товара
const loadProduct = async () => {
  if (!route.params.id) return;

  pending.value = true;
  error.value = null;

  try {
    product.value = await getProduct(route.params.id);
  } catch (err) {
    error.value = err.data?.message || "Ошибка загрузки товара";
  } finally {
    pending.value = false;
  }
};

// Форматирование цены
const formattedPrice = computed(() => {
  if (!product.value) return "0";
  const price = product.value.final_price || product.value.price;
  return parseFloat(price).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});

// Placeholder для изображения
const productImage = computed(() => {
  if (product.value?.image) {
    return `http://127.0.0.1:8000${product.value.image}`;
  }
  return "https://via.placeholder.com/600x600/0f172a/38bdf8?text=Изображение+товара";
});

// Состояние для количества товара
const quantity = ref(1);

// Функция добавления в корзину
const handleAddToCart = async () => {
  if (!authStore.isAuthenticated) {
    await navigateTo("/auth/login");
    return;
  }

  try {
    await addToCart(product.value.id, quantity.value);
    alert(
      `Добавлено в корзину: ${product.value.name} (${quantity.value} шт.)`
    );
  } catch (err) {
    alert(err.data?.message || "Ошибка добавления в корзину");
  }
};

onMounted(() => {
  loadProduct();
});
</script>

<template>
  <Head>
    <Title>{{ title }}</Title>
  </Head>

  <section class="product-page">
    <!-- Загрузка -->
    <div v-if="pending" class="loading">
      <div class="spinner"></div>
      <p>Загрузка товара...</p>
    </div>

    <!-- Ошибка -->
    <div v-else-if="error" class="error">
      <h2>Ошибка загрузки</h2>
      <p>Не удалось загрузить информацию о товаре.</p>
      <NuxtLink to="/" class="back-link">Вернуться на главную</NuxtLink>
    </div>

    <!-- Товар не найден -->
    <div v-else-if="!product" class="not-found">
      <h2>Товар не найден</h2>
      <p>Товар с указанным ID не существует.</p>
      <NuxtLink to="/" class="back-link">Вернуться на главную</NuxtLink>
    </div>

    <!-- Информация о товаре -->
    <div v-else class="product-container">
      <!-- Хлебные крошки -->
      <nav class="breadcrumbs">
        <NuxtLink to="/" class="breadcrumb-link">Главная</NuxtLink>
        <span class="breadcrumb-separator">/</span>
        <NuxtLink to="/catalog" class="breadcrumb-link">Каталог</NuxtLink>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ product.category }}</span>
        <span class="breadcrumb-separator">/</span>
        <span class="breadcrumb-current">{{ product.name }}</span>
      </nav>

      <div class="product-content">
        <!-- Галерея изображений -->
        <div class="product-gallery">
          <div class="main-image">
            <img
              :src="'http://127.0.0.1:8000' + productImage"
              :alt="product.name"
            />
          </div>
          <div class="image-thumbnails" v-if="product.image">
            <div class="thumbnail active">
              <img :src="productImage" :alt="product.name" />
            </div>
          </div>
        </div>

        <!-- Информация о товаре -->
        <div class="product-info">
          <!-- Категория -->
          <div class="product-category">
            <span class="category-badge">{{ product.category }}</span>
          </div>

          <!-- Название -->
          <h1 class="product-title">{{ product.name }}</h1>

          <!-- Цена -->
          <div class="product-price">
            <span class="price-value">{{ formattedPrice }}</span>
            <span class="price-currency">сом</span>
          </div>

          <!-- Наличие -->
          <div class="product-stock">
            <span
              :class="[
                'stock-badge',
                product.quantity > 0 ? 'in-stock' : 'out-of-stock',
              ]"
            >
              {{
                product.in_stock
                  ? `В наличии (${product.stock_quantity || product.quantity} шт.)`
                  : "Нет в наличии"
              }}
            </span>
          </div>

          <!-- Описание -->
          <div class="product-description">
            <h3>Описание</h3>
            <p>{{ product.description }}</p>
          </div>

          <!-- Количество и кнопка -->
          <div class="product-actions">
            <div class="quantity-selector">
              <label for="quantity">Количество:</label>
              <div class="quantity-controls">
                <button
                  @click="quantity = Math.max(1, quantity - 1)"
                  class="quantity-btn"
                  :disabled="quantity <= 1"
                >
                  −
                </button>
                <input
                  id="quantity"
                  type="number"
                  v-model.number="quantity"
                  min="1"
                  :max="product.stock_quantity || product.quantity"
                  class="quantity-input"
                />
                <button
                  @click="quantity = Math.min(product.quantity, quantity + 1)"
                  class="quantity-btn"
                  :disabled="quantity >= (product.stock_quantity || product.quantity)"
                >
                  +
                </button>
              </div>
            </div>

            <button
              @click="handleAddToCart"
              class="add-to-cart-btn"
              :disabled="!product.in_stock"
            >
              <span class="btn-icon">🛒</span>
              <span>Добавить в корзину</span>
            </button>
          </div>

          <!-- Дополнительная информация -->
          <div class="product-meta">
            <div class="meta-item">
              <span class="meta-label">ID товара:</span>
              <span class="meta-value">#{{ product.id }}</span>
            </div>
            <div class="meta-item" v-if="formattedDate">
              <span class="meta-label">Обновлено:</span>
              <span class="meta-value">{{ formattedDate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.product-page {
  min-height: calc(100vh - 200px);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

/* Загрузка */
.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 20px;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e2e8f0;
  border-top-color: #38bdf8;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Ошибка и не найдено */
.error,
.not-found {
  text-align: center;
  padding: 60px 20px;
}

.error h2,
.not-found h2 {
  font-size: 32px;
  color: #1e293b;
  margin-bottom: 16px;
}

.back-link {
  display: inline-block;
  margin-top: 20px;
  color: #38bdf8;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.back-link:hover {
  color: #0ea5e9;
  text-decoration: underline;
}

/* Хлебные крошки */
.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  font-size: 14px;
  flex-wrap: wrap;
}

.breadcrumb-link {
  color: #64748b;
  text-decoration: none;
  transition: color 0.2s;
}

.breadcrumb-link:hover {
  color: #38bdf8;
}

.breadcrumb-separator {
  color: #cbd5e1;
}

.breadcrumb-current {
  color: #1e293b;
  font-weight: 500;
}

/* Контейнер товара */
.product-container {
  max-width: 1200px;
  margin: 0 auto;
}

.product-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  margin-top: 20px;
}

/* Галерея */
.product-gallery {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.main-image {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  overflow: hidden;
  background: #f8fafc;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;
}

.main-image:hover {
  transform: scale(1.02);
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-thumbnails {
  display: flex;
  gap: 12px;
}

.thumbnail {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s;
}

.thumbnail.active {
  border-color: #38bdf8;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Информация о товаре */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-category {
  margin-bottom: -8px;
}

.category-badge {
  display: inline-block;
  padding: 6px 12px;
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-title {
  font-size: 36px;
  font-weight: 700;
  color: #1e293b;
  line-height: 1.2;
  margin: 0;
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 8px;
}

.price-value {
  font-size: 48px;
  font-weight: 700;
  color: #0f172a;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.price-currency {
  font-size: 24px;
  color: #64748b;
  font-weight: 500;
}

.product-stock {
  margin-top: -8px;
}

.stock-badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
}

.stock-badge.in-stock {
  background: #dcfce7;
  color: #166534;
}

.stock-badge.out-of-stock {
  background: #fee2e2;
  color: #991b1b;
}

.product-description {
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.product-description h3 {
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 12px;
}

.product-description p {
  font-size: 16px;
  line-height: 1.6;
  color: #475569;
}

/* Действия */
.product-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
}

.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quantity-selector label {
  font-size: 14px;
  font-weight: 500;
  color: #475569;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 0;
  width: fit-content;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  background: #f8fafc;
  border: none;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background: #e2e8f0;
  color: #0f172a;
}

.quantity-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-input {
  width: 60px;
  height: 40px;
  border: none;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  background: white;
  outline: none;
}

.quantity-input::-webkit-inner-spin-button,
.quantity-input::-webkit-outer-spin-button {
  opacity: 1;
}

.add-to-cart-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 16px 32px;
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px -1px rgba(14, 165, 233, 0.3);
}

.add-to-cart-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 12px -2px rgba(14, 165, 233, 0.4);
}

.add-to-cart-btn:active:not(:disabled) {
  transform: translateY(0);
}

.add-to-cart-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-icon {
  font-size: 20px;
}

/* Мета информация */
.product-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 24px;
  border-top: 1px solid #e2e8f0;
  font-size: 14px;
}

.meta-item {
  display: flex;
  gap: 8px;
}

.meta-label {
  color: #64748b;
  font-weight: 500;
}

.meta-value {
  color: #1e293b;
}

/* Адаптивность */
@media (max-width: 968px) {
  .product-content {
    grid-template-columns: 1fr;
    gap: 40px;
  }

  .product-title {
    font-size: 28px;
  }

  .price-value {
    font-size: 36px;
  }
}

@media (max-width: 640px) {
  .product-page {
    padding: 20px 16px;
  }

  .product-title {
    font-size: 24px;
  }

  .price-value {
    font-size: 32px;
  }

  .add-to-cart-btn {
    padding: 14px 24px;
    font-size: 16px;
  }
}
</style>
