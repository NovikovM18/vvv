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

    <div>
      <h1>comming soon</h1>
      <p>{{ themeStore.selectedTheme }}</p>
      
        <!-- <img src="/vite.svg" class="logo" alt="Vite logo" /> ---PUBLIC
        <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" /> ---ASSETS -->
      
      <n-button type="primary">
        Primary
      </n-button>
    </div>
  </n-config-provider>
</template>

<style>

</style>
