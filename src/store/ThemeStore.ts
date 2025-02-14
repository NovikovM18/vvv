import { defineStore } from 'pinia'
import { ref, watch  } from 'vue'

export const useThemeStore = defineStore('themeStore', () => {
  const STORAGE_KEY = 'vvv--selectedTheme'
  const DEFAULT_THEME = 'dark'
  const selectedTheme = ref(localStorage.getItem(STORAGE_KEY) || DEFAULT_THEME)

  const $setTheme = (val: string) => {
    selectedTheme.value = val
  }

  watch(selectedTheme, (newVal) => {
    localStorage.setItem(STORAGE_KEY, newVal)
  })
  return {selectedTheme, $setTheme}
})