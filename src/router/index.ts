import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import Events from '../views/Events.vue'
import Calls from '../views/Calls.vue'
import GroupCall from '../components/calls/GroupCall.vue'

const routes = [
  { path: '/', component: Dashboard, name: 'Dashboard' },
  { path: '/events', component: Events, name: 'Events' },
  { path: '/calls', component: Calls, name: 'Calls' },
  { path: '/callsG', component: GroupCall, name: 'CallsG' },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router