<script setup>
const currentYear = new Date().getFullYear();
</script>

<template>
  <footer class="footer-section">
    <div class="container">
      <div class="footer-cta pt-5 pb-5">
        <div class="row">
          <div class="col-xl-4 col-md-4 mb-30">
            <div class="single-cta">
              <i class="bi bi-geo-alt-fill"></i>
              <div class="cta-text">
                <h4>Наш адрес</h4>
                <span>Г. Ош, ул. Примерная 123</span>
              </div>
            </div>
          </div>
          <div class="col-xl-4 col-md-4 mb-30">
            <div class="single-cta">
              <i class="bi bi-telephone-fill"></i>
              <div class="cta-text">
                <h4>Наши контакты</h4>
                <span>+996 775 910 303</span>
              </div>
            </div>
          </div>
          <div class="col-xl-4 col-md-4 mb-30">
            <div class="single-cta">
              <i class="bi bi-envelope-open-fill"></i>
              <div class="cta-text">
                <h4>Электронная почта</h4>
                <span >dastanubaidyllaev@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="footer-content pt-5 pb-5">
        <div class="row">
          <div class="col-xl-4 col-lg-4 mb-50">
            <div class="footer-widget">
              <div class="footer-logo">
                <NuxtLink to="/" class="logo-text">MyShop</NuxtLink>
              </div>
              <div class="footer-text">
                <p>
                  Мы предлагаем качественные товары для дома, строительства и
                  ремонта. Быстрая доставка, гарантия качества и отличный сервис
                  — наши главные приоритеты.
                </p>
              </div>
              <div class="footer-social-icon">
                <span>Подписывайтесь</span>
                <a href="#"><i class="bi bi-facebook facebook-bg"></i></a>
                <a href="#"><i class="bi bi-twitter twitter-bg"></i></a>
                <a href="#"><i class="bi bi-instagram instagram-bg"></i></a>
              </div>
            </div>
          </div>
          <div class="col-xl-4 col-lg-4 col-md-6 mb-30">
            <div class="footer-widget">
              <div class="footer-widget-heading">
                <h3>Полезные ссылки</h3>
              </div>
              <ul>
                <li><NuxtLink to="/">Главная</NuxtLink></li>
                <li><NuxtLink to="/catalog">Каталог</NuxtLink></li>
                <li><NuxtLink to="/about">О нас</NuxtLink></li>
                <li><NuxtLink to="/contacts">Контакты</NuxtLink></li>
                <li><NuxtLink to="/delivery">Доставка</NuxtLink></li>
                <li><NuxtLink to="/rules">Правила</NuxtLink></li>
              </ul>
            </div>
          </div>
          <div class="col-xl-4 col-lg-4 col-md-6 mb-50">
            <div class="footer-widget">
              <div class="footer-widget-heading">
                <h3>Подписка</h3>
              </div>
              <div class="footer-text mb-25">
                <p>
                  Не пропускайте наши новые поступления и акции, подпишитесь на
                  нашу рассылку!
                </p>
              </div>
              <div class="subscribe-form">
                <form action="#">
                  <input type="text" placeholder="Email адрес" />
                  <button><i class="bi bi-telegram"></i></button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="copyright-area">
      <div class="container">
        <div class="row">
          <div class="col-xl-6 col-lg-6 text-center text-lg-start">
            <div class="copyright-text">
              <p>
                Copyright &copy; {{ currentYear }}, Все права защищены
                <a href="#">Dastanchik123</a>
              </p>
            </div>
          </div>
          <div class="col-xl-6 col-lg-6 d-none d-lg-block text-end">
            <div class="footer-menu">
              <ul>
                <li><a href="#">Главная</a></li>
                <li><a href="#">Правила</a></li>
                <li><a href="#">Политика</a></li>
                <li><a href="#">Контакты</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<style scoped>
ul {
  margin: 0px;
  padding: 0px;
}
.footer-section {
  background: #151414;
  position: relative;
}
.footer-cta {
  border-bottom: 1px solid #373636;
}
.single-cta i {
  color: #ff5e14;
  font-size: 30px;
  float: left;
  margin-top: 8px;
}
.cta-text {
  padding-left: 15px;
  display: inline-block;
}
.cta-text h4 {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 2px;
}
.cta-text span {
  color: #757575;
  font-size: 15px;
}
.footer-content {
  position: relative;
  z-index: 2;
}
.footer-pattern img {
  position: absolute;
  top: 0;
  left: 0;
  height: 330px;
  background-size: cover;
  background-position: 100% 100%;
}
.footer-logo {
  margin-bottom: 30px;
}
.footer-logo .logo-text {
  color: #fff;
  font-size: 30px;
  font-weight: 700;
  text-decoration: none;
}
.footer-text p {
  margin-bottom: 14px;
  font-size: 14px;
  color: #7e7e7e;
  line-height: 28px;
}
.footer-social-icon span {
  color: #fff;
  display: block;
  font-size: 20px;
  font-weight: 700;
  font-family: "Poppins", sans-serif;
  margin-bottom: 20px;
}
.footer-social-icon a {
  color: #fff;
  font-size: 16px;
  margin-right: 15px;
}
.footer-social-icon i {
  height: 40px;
  width: 40px;
  text-align: center;
  line-height: 38px;
  border-radius: 50%;
}
.facebook-bg {
  background: #3b5998;
}
.twitter-bg {
  background: #55acee;
}
.instagram-bg {
  background: #e1306c;
}
.footer-widget-heading h3 {
  color: #fff;
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 40px;
  position: relative;
}
.footer-widget-heading h3::before {
  content: "";
  position: absolute;
  left: 0;
  bottom: -15px;
  height: 2px;
  width: 50px;
  background: #ff5e14;
}
.footer-widget ul li {
  display: inline-block;
  float: left;
  width: 50%;
  margin-bottom: 12px;
}
.footer-widget ul li a {
  color: #878787;
  text-transform: capitalize;
  text-decoration: none;
  transition: all 0.3s ease;
}
.footer-widget ul li a:hover {
  color: #ff5e14;
}
.subscribe-form {
  position: relative;
  overflow: hidden;
}
.subscribe-form input {
  width: 100%;
  padding: 14px 28px;
  background: #2e2e2e;
  border: 1px solid #2e2e2e;
  color: #fff;
}
.subscribe-form button {
  position: absolute;
  right: 0;
  background: #ff5e14;
  padding: 13px 20px;
  border: 1px solid #ff5e14;
  top: 0;
}
.subscribe-form button i {
  color: #fff;
  font-size: 22px;
  transform: rotate(-6deg);
}
.copyright-area {
  background: #202020;
  padding: 25px 0;
}
.copyright-text p {
  margin: 0;
  font-size: 14px;
  color: #878787;
}
.copyright-text p a {
  color: #ff5e14;
  text-decoration: none;
}
.footer-menu li {
  display: inline-block;
  margin-left: 20px;
}
.footer-menu li:hover a {
  color: #ff5e14;
}
.footer-menu li a {
  font-size: 14px;
  color: #878787;
  text-decoration: none;
}
</style>
