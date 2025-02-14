<script setup lang="ts">
  import { darkTheme, lightTheme } from 'naive-ui'
  import { onMounted } from 'vue';
  import { useThemeStore } from './store/ThemeStore';
  import Header from './components/global/Header.vue';
  
  const themeStore = useThemeStore()

  onMounted(() => {
    console.log('themeStore', themeStore);
    console.log('LS', localStorage.getItem('vvv--selectedTheme'));
    
  })

</script>

<template>
  <n-config-provider :theme="themeStore.selectedTheme === 'dark' ? darkTheme : lightTheme">
    <Header />

    <router-view v-slot="{ Component }">
      <Transition name="router-view" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>    
  </n-config-provider>
</template>

<style>
  .router-view-enter-active,
  .router-view-leave-active {
    transition: all 333ms ease-in-out;
    will-change: transform, opacity;
  }
  .router-view-enter-from {
    opacity: 0;
    transform: translateY(12px);
  }
  .router-view-leave-to {
    opacity: 0;
    transform: translateY(-12px);
  }
</style>
