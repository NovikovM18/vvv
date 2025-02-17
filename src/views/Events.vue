<script setup lang="ts">
  import { onMounted, ref } from "vue";
  import { db } from "../firebase";
  import { collection, getDocs, addDoc } from "firebase/firestore";


  type DocumentType = { id: string; name: string; timestamp: string };

  const documents = ref<DocumentType[]>([]);

  onMounted(() => {
    fetchDocuments()
  })

  const fetchDocuments = async () => {
  const querySnapshot = await getDocs(collection(db, "test"));
  documents.value = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as DocumentType[];
  console.log('***',documents.value);
  
};

  const addData = async () => {
    try {
      const docRef = await addDoc(collection(db, "test"), {
        name: "Vue 3 + Firebase",
        timestamp: new Date(),
      });
      console.log("Document written with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding document:", error);
    }
  };

</script>

<template>
  <div class="view-container events">
    <h1>Events</h1>

    <button @click="addData">Add Data to Firestore</button>

    <div class="test">
      <div class="test_item" v-for="(item, index) in documents" :key="index">
        <p>{{index+1}} -- {{ item.name }}</p>
      </div>
    </div>

  </div>
</template>

<style scoped>
  .events {
  }
</style>