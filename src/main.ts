import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import naive from 'naive-ui'
import { createPinia } from 'pinia'
import router from './router'
// import firebase from 'firebase'
// import { initializeApp } from "firebase/app"
// import {firebaseConfig} from '../src/f'

// firebase.initializeApp(firebaseConfig);
const pinia = createPinia()
createApp(App).use(router).use(naive).use(pinia).mount('#app')
