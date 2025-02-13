import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useThemeStore = defineStore('themeStore', () => {
  const selectedTheme = ref(localStorage.getItem('vvv--selectedTheme') || 'dark')

  const $setTheme = (val: string) => {
    selectedTheme.value = val
    localStorage.setItem('vvv--selectedTheme', val)
  }

  return {selectedTheme, $setTheme}
})