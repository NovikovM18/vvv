<script setup lang="ts">
  import { reactive } from 'vue';
  import ThemeSwitch from '../ThemeSwitch.vue';

  const menuItems = reactive([
    {
      path: '/',
      name: 'dashboard',
    },
    {
      path: '/events',
      name: 'events',
    }
  ])

</script>

<template>
  <div class="header">
    <div class="header_main">
      <p>VVV</p>
  
      <div class="navigation">
        <router-link 
          v-for="item in menuItems"
          class="router-link"
          exact-active-class="active" 
          :to="item.path"
        >
          {{ item.name }}
        </router-link>
      </div>
    </div>
    <ThemeSwitch />
  </div>
</template>

<style scoped>
  .header {
    position: sticky;
    top: 0;
    z-index: 99;
    width: 100%;
    height: 64px;
    padding: 0 var(--padding);
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    background-color: var(--header--bg-color);

    .header_main {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: flex-start;
      gap: 4rem;
    }

    .navigation {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      
      .router-link {
        padding: 4px 12px;
        border-radius: 12px;
        text-decoration: none;
        text-transform: uppercase;
        font-weight: bold;
        transition: background-color 333ms ease-in-out;
        color: var(--text-color);
      }
      
      .router-link:hover {
        background-color: #ffffff33;
        transition: background-color 333ms ease-in-out;
      }
      
      .active {
        color: var(--link-color);
        background-color: #ffffff33;
      }
    }
  }  
</style>