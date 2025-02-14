<script setup lang="ts">
  import { onMounted, ref } from 'vue'
  import { useThemeStore } from '../store/ThemeStore';

  const themeStore = useThemeStore()

  const switchValue = ref(true)

  onMounted(() => {
    setGlobalTheme(themeStore.selectedTheme)
    switchValue.value = themeStore.selectedTheme === 'dark' ? false : true
  });   

  const toogleTheme = () => {   
    if (themeStore.selectedTheme === 'dark') {
      setGlobalTheme('light')
    } else {
      setGlobalTheme('dark')
    }
  }
  
  const setGlobalTheme = (type: string) => {
    themeStore.$setTheme(type)
    const root = document.documentElement
    switch (type) {
      case 'dark':
        root.style.setProperty('--header--bg-color', '#333')
        root.style.setProperty('--bg-color', '#666')
        root.style.setProperty('--text-color', '#FFF')
        root.style.setProperty('--link-color', '#70C0E8')
        
        break;
      case 'light':
          root.style.setProperty('--header--bg-color', '#CCC')
          root.style.setProperty('--bg-color', '#EEE')
          root.style.setProperty('--text-color', '#000')
          root.style.setProperty('--link-color', '#2080F0')
        
        break;
    
      default:
        break;
    }
  }

</script>

<template>
  <n-switch v-model:value="switchValue" size="large" @update:value="toogleTheme">
    <template #icon v-if="switchValue">🌙</template>
    <template #icon v-else>☀️</template>
  </n-switch>
</template>