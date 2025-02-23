<template>
    <div class="chat-container">
      <div class="room-selector">
        <label>Select Room:</label>
        <select v-model="currentRoom" @change="setRoom">
          <option value="general">General</option>
          <option value="tech">Tech</option>
          <option value="random">Random</option>
        </select>
      </div>
      <div class="messages">
        <div v-for="message in messages" :key="message.id" class="message">
          <span>{{ message.text }}</span>
        </div>
      </div>
      <div class="chat-input">
        <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
        <button @click="sendMessage">Send</button>
      </div>
    </div>
</template>

<script setup lang="ts">
  import { computed, onMounted, ref, watch } from "vue";
  import { auth, db } from "../firebase";
  import { addDoc, collection, getDocs, onSnapshot, orderBy, query } from "firebase/firestore";
  import { onAuthStateChanged } from "firebase/auth";

  const messages = ref<any[]>([]);
    const newMessage = ref('');
    const user = ref<any>(null);
    const currentRoom = ref('general');

    onAuthStateChanged(auth, (currentUser) => {
      user.value = currentUser;
    });

    const q = computed(() => query(collection(db, `rooms/${currentRoom.value}/messages`), orderBy('timestamp', 'asc')));

    onMounted(() => {

      fetchMess()
    });

    const setRoom = () => {
      console.log(currentRoom.value);
      messages.value = [];
      fetchMess()
    }

    const fetchMess = async () => {
      const querySnapshot = await getDocs(collection(db, `rooms/${currentRoom.value}/messages`));
      messages.value = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
    }

    watch(q, (newQuery) => {
      onSnapshot(newQuery, (snapshot) => {
        messages.value = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      });
    }, { immediate: true });

    const sendMessage = async () => {
    if (!newMessage.value.trim()) return;
      try {
        await addDoc(collection(db, `rooms/${currentRoom.value}/messages`), {
          text: newMessage.value,
          userId: user.value.uid,
          timestamp: new Date()
        });
        newMessage.value = '';
        console.log("send to", currentRoom.value);
      } catch (error) {
        console.log("err send to", currentRoom.value);
      }
    };
</script>
<style scoped>
  
</style>