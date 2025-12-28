<script setup>
import { useProductsStore } from "#imports";
const { getProducts, getCategories } = useProducts();
const { addToCart } = useCart();
const authStore = useAuthStore();

const store = useProductsStore();
const title = "Главная страница";

const categories = ref([]);
const featuredProducts = ref([]);
const loading = ref(false);

// Загрузка данных
const loadData = async () => {
  loading.value = true;
  try {
    const [productsData, categoriesData] = await Promise.all([
      getProducts({ per_page: 8, in_stock: true }),
      getCategories({ is_active: true }),
    ]);

    featuredProducts.value = productsData.data || [];
    categories.value = categoriesData || [];
  } catch (error) {
    console.error("Error loading data:", error);
  } finally {
    loading.value = false;
  }
};

// Форматирование цены
const formatPrice = (price) => {
  return parseFloat(price).toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Получение изображения товара
const getProductImage = (product) => {
  if (product.image) {
    return `http://127.0.0.1:8000${product.image}`;
  }
  return "https://dummyimage.com/300x300/0f172a/fff&text=Товар";
};

// Добавление в корзину
const handleAddToCart = async (productId) => {
  if (!authStore.isAuthenticated) {
    await navigateTo("/auth/login");
    return;
  }

  try {
    await addToCart(productId, 1);
    alert("Товар добавлен в корзину!");
  } catch (error) {
    alert(error.data?.message || "Ошибка добавления в корзину");
  }
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <Head>
    <Title>{{ title }}</Title>
  </Head>

  <div class="home-page">
    <!-- Героический баннер -->
    <section class="hero-section mb-5">
      <div
        id="heroCarousel"
        class="carousel slide carousel-fade"
        data-bs-ride="carousel"
      >
        <div class="carousel-indicators">
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="0"
            class="active"
            aria-current="true"
            aria-label="Slide 1"
          ></button>
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="1"
            aria-label="Slide 2"
          ></button>
          <button
            type="button"
            data-bs-target="#heroCarousel"
            data-bs-slide-to="2"
            aria-label="Slide 3"
          ></button>
        </div>
        <div class="carousel-inner">
          <div class="carousel-item active">
            <div class="hero-slide hero-slide-1">
              <div class="container">
                <div class="row align-items-center">
                  <div class="col-lg-6">
                    <h1 class="hero-title display-3 fw-bold text-white mb-4">
                      Строительные инструменты
                    </h1>
                    <p class="hero-text lead text-white mb-4">
                      Профессиональные инструменты для строительства и ремонта.
                      Высокое качество и надежность.
                    </p>
                    <NuxtLink
                      to="/catalog"
                      class="btn btn-primary btn-lg px-5 py-3 rounded-pill"
                    >
                      Смотреть каталог
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-item">
            <div class="hero-slide hero-slide-2">
              <div class="container">
                <div class="row align-items-center">
                  <div class="col-lg-6">
                    <h1 class="hero-title display-3 fw-bold text-white mb-4">
                      Материалы и крепеж
                    </h1>
                    <p class="hero-text lead text-white mb-4">
                      Широкий ассортимент строительных материалов и крепежных
                      элементов по выгодным ценам.
                    </p>
                    <NuxtLink
                      to="/catalog"
                      class="btn btn-primary btn-lg px-5 py-3 rounded-pill"
                    >
                      Перейти в каталог
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="carousel-item">
            <div class="hero-slide hero-slide-3">
              <div class="container">
                <div class="row align-items-center">
                  <div class="col-lg-6">
                    <h1 class="hero-title display-3 fw-bold text-white mb-4">
                      Доставка по всей стране
                    </h1>
                    <p class="hero-text lead text-white mb-4">
                      Быстрая доставка строительных товаров. Гарантия качества и
                      профессиональная поддержка.
                    </p>
                    <NuxtLink
                      to="/catalog"
                      class="btn btn-primary btn-lg px-5 py-3 rounded-pill"
                    >
                      Заказать сейчас
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button
          class="carousel-control-prev"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="prev"
        >
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Previous</span>
        </button>
        <button
          class="carousel-control-next"
          type="button"
          data-bs-target="#heroCarousel"
          data-bs-slide="next"
        >
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Next</span>
        </button>
      </div>
    </section>

    <!-- Категории -->
    <section class="categories-section py-5 mb-5">
      <div class="container">
        <h2 class="section-title text-center mb-5">
          <span class="section-title-text">Категории товаров</span>
        </h2>
        <div class="row g-4">
          <div
            v-for="(category, index) in categories"
            :key="index"
            class="col-md-6 col-lg-4 col-xl-3"
          >
            <div class="category-card card h-100 shadow-sm border-0">
              <div class="card-body text-center p-4">
                <div class="category-icon mb-3">
                  <i class="bi bi-tools fs-1 text-primary"></i>
                </div>
                <h5 class="card-title fw-bold mb-3">{{ category }}</h5>
                <NuxtLink
                  :to="`/catalog?category=${encodeURIComponent(category)}`"
                  class="btn btn-outline-primary btn-sm"
                >
                  Смотреть товары
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Популярные товары -->
    <section class="products-section py-5 mb-5 bg-light">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-5">
          <h2 class="section-title mb-0">
            <span class="section-title-text">Популярные товары</span>
          </h2>
          <NuxtLink to="/catalog" class="btn btn-link text-decoration-none">
            Смотреть все товары
            <i class="bi bi-arrow-right ms-2"></i>
          </NuxtLink>
        </div>

        <div v-if="store.products.length === 0" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Загрузка...</span>
          </div>
          <p class="mt-3 text-muted">Загрузка товаров...</p>
        </div>

        <div v-else class="row g-4">
          <div
            v-for="product in featuredProducts"
            :key="product.id"
            class="col-md-6 col-lg-4 col-xl-3"
          >
            <div class="product-card card h-100 shadow-sm border-0">
              <div
                class="product-image-wrapper position-relative ratio ratio-1x1"
              >
                <img
                  :src="getProductImage(product)"
                  class="card-img-top"
                  :alt="product.name"
                  style="height: 250px; object-fit: cover"
                />
                <span
                  v-if="product.quantity > 0"
                  class="badge bg-success position-absolute top-0 end-0 m-2"
                >
                  В наличии
                </span>
                <span
                  v-else
                  class="badge bg-danger position-absolute top-0 end-0 m-2"
                >
                  Нет в наличии
                </span>
                <div
                  class="product-overlay position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
                >
                  <NuxtLink
                    :to="`/product/${product.id}`"
                    class="btn btn-primary btn-sm rounded-pill px-4"
                  >
                    Подробнее
                  </NuxtLink>
                </div>
              </div>
              <div class="card-body d-flex flex-column">
                <span class="badge bg-primary mb-2 align-self-start">{{
                  product.category
                }}</span>
                <h5 class="card-title fw-bold mb-2">{{ product.name }}</h5>
                <p class="card-text text-muted small mb-3 flex-grow-1">
                  {{ product.description }}
                </p>
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <span class="h5 text-primary fw-bold mb-0">
                      {{ formatPrice(product.price) }}
                    </span>
                    <span class="text-muted small ms-1">сом</span>
                  </div>
                  <button
                    class="btn btn-outline-primary btn-sm"
                    :disabled="!product.in_stock"
                    @click="handleAddToCart(product.id)"
                  >
                    <i class="bi bi-cart-plus"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Преимущества -->
    <section class="features-section py-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-6 col-lg-3">
            <div class="feature-item text-center">
              <div class="feature-icon mb-3">
                <i class="bi bi-truck fs-1 text-white"></i>
              </div>
              <h5 class="fw-bold mb-2">Быстрая доставка</h5>
              <p class="text-muted small mb-0">
                Доставка по всей стране в кратчайшие сроки
              </p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="feature-item text-center">
              <div class="feature-icon mb-3">
                <i class="bi bi-shield-check fs-1 text-white"></i>
              </div>
              <h5 class="fw-bold mb-2">Гарантия качества</h5>
              <p class="text-muted small mb-0">
                Все товары проходят проверку качества
              </p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="feature-item text-center">
              <div class="feature-icon mb-3">
                <i class="bi bi-currency-exchange fs-1 text-white"></i>
              </div>
              <h5 class="fw-bold mb-2">Выгодные цены</h5>
              <p class="text-muted small mb-0">
                Конкурентные цены на весь ассортимент
              </p>
            </div>
          </div>
          <div class="col-md-6 col-lg-3">
            <div class="feature-item text-center">
              <div class="feature-icon mb-3">
                <i class="bi bi-headset fs-1 text-white"></i>
              </div>
              <h5 class="fw-bold mb-2">Поддержка 24/7</h5>
              <p class="text-muted small mb-0">
                Круглосуточная поддержка клиентов
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Героический баннер */
.hero-section {
  position: relative;
  overflow: hidden;
}

.carousel-item {
  height: 500px;
}

.hero-slide {
  padding: 5rem 2rem;
  height: 100%;
  display: flex;
  align-items: center;
  background-size: cover;
  background-position: center;
  position: relative;
}

.hero-slide::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    135deg,
    rgba(15, 23, 42, 0.85) 0%,
    rgba(30, 41, 59, 0.75) 100%
  );
  z-index: 1;
}

.hero-slide > .container {
  position: relative;
  z-index: 2;
}

.hero-slide-1 {
  background-image: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.9) 0%,
      rgba(30, 41, 59, 0.8) 100%
    ),
    url("https://images.unsplash.com/photo-1504307651254-35680f05301a?w=1920");
}

.hero-slide-2 {
  background-image: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.9) 0%,
      rgba(30, 41, 59, 0.8) 100%
    ),
    url("https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=1920");
}

.hero-slide-3 {
  background-image: linear-gradient(
      135deg,
      rgba(15, 23, 42, 0.9) 0%,
      rgba(30, 41, 59, 0.8) 100%
    ),
    url("https://images.unsplash.com/photo-1504148455328-c376907d081c?w=1920");
}

.hero-title {
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 0.8s ease;
}

.hero-text {
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  animation: fadeInUp 1s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Заголовки секций */
.section-title {
  position: relative;
  display: inline-block;
}

.section-title-text {
  position: relative;
  padding-bottom: 15px;
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
}

.section-title-text::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 60px;
  height: 4px;
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  border-radius: 2px;
}

/* Карточки категорий */
.category-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.category-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.category-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  border-radius: 50%;
  color: white !important;
}

/* Карточки товаров */
.product-card {
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15) !important;
}

.product-image-wrapper {
  overflow: hidden;
  background: #f8fafc;
}

.product-image-wrapper img {
  transition: transform 0.5s ease;
}

.product-card:hover .product-image-wrapper img {
  transform: scale(1.1);
}

.product-overlay {
  background: rgba(15, 23, 42, 0.7);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
  opacity: 1;
}

/* Преимущества */
.feature-item {
  padding: 30px 20px;
  transition: transform 0.3s ease;
}

.feature-item:hover {
  transform: translateY(-5px);
}

.feature-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
  border-radius: 50%;
  color: white !important;
}

/* Адаптивность */
@media (max-width: 768px) {
  .carousel-item {
    height: 400px;
  }

  .hero-title {
    font-size: 2rem !important;
  }

  .hero-text {
    font-size: 1rem !important;
  }

  .section-title-text {
    font-size: 1.5rem;
  }
}
</style>
