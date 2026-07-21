<template>
  <div class="mobile-layout">
    <router-view />
  </div>
</template>

<script setup>
</script>

<style scoped>
.mobile-layout {
  width: 100%;
  max-width: 480px;
  margin: 0 auto;
  min-height: 100vh;
  background: #f5f7fa;
}
</style>
