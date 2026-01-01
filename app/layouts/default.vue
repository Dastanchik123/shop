<script setup lang="ts">
import Header from "../components/loyaut/Header.vue";
import Footer from "../components/loyaut/Footer.vue";
</script>
<template>
  <div>
    <Header />
    <div class="container py-4 mx-auto">
      <slot />
    </div>
    <Footer />
  </div>
</template>
