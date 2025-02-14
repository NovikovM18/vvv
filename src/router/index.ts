import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Events from '../views/Events.vue'

const routes = [
  { path: '/', component: Dashboard, name: 'Dashboard' },
  { path: '/events', component: Events, name: 'Events' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router