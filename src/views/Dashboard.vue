<script setup lang="ts">
  import Login from '../components/auth/Login.vue';

</script>

<template>
  <div class="view-container dashboard">
    <h1>Dashboard</h1>
    
    <n-button type="primary">Primary</n-button>
    <n-button type="info">Info</n-button>

    <n-input type="text" placeholder="Basic Input" />

    <Login />

  </div>
</template>

<style scoped>
  .dashboard {
  }
</style>