<template>
  <div class="auth-container">
    <h2>{{ isLogin ? "Login" : "Register" }}</h2>
    <input v-model="email" type="email" placeholder="Email" required />
    <input v-model="password" type="password" placeholder="Password" required />
    
    <button @click="handleAuth">{{ isLogin ? "Login" : "Register" }}</button>
    <p @click="isLogin = !isLogin">
      {{ isLogin ? "Don't have an account? Sign up" : "Already have an account? Login" }}
    </p>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="user" class="success">Logged in as: {{ user.email }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { auth } from "../../firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, type User } from "firebase/auth";

const email = ref("");
const password = ref("");
const isLogin = ref(true);
const errorMessage = ref<string | null>(null);
const user = ref<User | null>(null);

const handleAuth = async () => {
  errorMessage.value = null;

  try {
    if (isLogin.value) {
      const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
      user.value = userCredential.user;
    } else {
      const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
      user.value = userCredential.user;
    }
  } catch (error) {
    errorMessage.value = (error as Error).message;
  }
};
</script>

<style scoped>
</style>