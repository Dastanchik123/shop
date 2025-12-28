<template>
  <div>
    <Header />
    <div class="container py-4 mx-auto">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import Header from "../components/loyaut/Header.vue";
</script>
