import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Events from '../views/Events.vue'
import Calls from '../views/Calls.vue'
import Chats from '../views/Chats.vue'

const routes = [
  { path: '/', component: Dashboard, name: 'Dashboard' },
  { path: '/events', component: Events, name: 'Events' },
  { path: '/chats', component: Chats, name: 'Chats' },
  { path: '/calls', component: Calls, name: 'Calls' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router