<template>
  <div>
    <h2>Group Video Call</h2>
    <video ref="localVideo" autoplay playsinline muted></video>

    <div v-for="(stream, id) in remoteStreams" :key="id">
      <video :ref="el => remoteVideos[id] = (el as HTMLVideoElement)" autoplay playsinline></video>
      <span>{{ stream }}</span>
    </div>

    <input v-model="callId" placeholder="Enter Call ID" />
    <button @click="createCall">Start Call</button>
    <button @click="joinCall">Join Call</button>
    <button @click="leaveCall">Leave Call</button>
  </div>
</template>

<script setup lang="ts">
  import { ref, reactive, onUnmounted } from "vue";
  import { collection, doc, setDoc, getDoc, onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
  import { db } from "../../firebase";

  const localVideo = ref<HTMLVideoElement | null>(null);
  const remoteVideos = reactive<Record<string, HTMLVideoElement | null>>({});
  const localStream = ref<MediaStream | null>(null);
  const remoteStreams = reactive<Record<string, MediaStream>>({});
  const callId = ref<string>("");
  const peerConnections = reactive<Record<string, RTCPeerConnection>>({});

  const ICE_SERVERS: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  type SignalingState = 'stable' | 'have-local-offer' | 'have-remote-offer' | 'closed';

  // Очистка при выходе
  onUnmounted(() => leaveCall());

  // Создать звонок
  const createCall = async () => {
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideo.value) localVideo.value.srcObject = localStream.value;

    const callDoc = doc(collection(db, "calls"));
    callId.value = callDoc.id;

    await setDoc(callDoc, { participants: [] });
    listenForParticipants(callDoc);
  };

  // Присоединиться к звонку
  const joinCall = async () => {
    if (!callId.value) return alert("Please enter a Call ID!");

    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideo.value) localVideo.value.srcObject = localStream.value;

    const callDoc = doc(db, "calls", callId.value);
    const callData = (await getDoc(callDoc)).data();
    if (!callData) return alert("Invalid Call ID!");

    await setDoc(callDoc, { participants: [...callData.participants, callId.value] }, { merge: true });
    listenForParticipants(callDoc);
  };

  // Следим за участниками
  const listenForParticipants = (callDoc: any) => {
    onSnapshot(callDoc, async (snapshot: any) => {
      const data = snapshot.data();
      if (!data || !data.participants) return;

      const newParticipants = data.participants;
      console.log('newParticipants', newParticipants);
      console.log('data', data);
      
      newParticipants.forEach((participantId: any) => {
        if (!peerConnections[participantId]) {
          createPeerConnection(participantId);
        }
      });
    });
  };

  // Создание соединения WebRTC
  const createPeerConnection = async (participantId: any) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnections[participantId] = pc;

    localStream.value?.getTracks().forEach((track) => pc.addTrack(track, localStream.value!));

    pc.ontrack = (event) => {
      if (!remoteStreams[participantId]) {
        remoteStreams[participantId] = event.streams[0];
      }
      if (remoteVideos[participantId]) {
        remoteVideos[participantId]!.srcObject = event.streams[0];
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(collection(db, `calls/${callId.value}/candidates`), {
          candidate: event.candidate.toJSON(),
          sender: callId.value,
          receiver: participantId,
        });
      }
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await setDoc(doc(db, `calls/${callId.value}/offers`, callId.value), { offer });

    listenForOffers();
  };


const listenForOffers = () => {
  onSnapshot(collection(db, `calls/${callId.value}/offers`), async (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        const { offer } = change.doc.data();
        const senderId = change.doc.id;

        if (!peerConnections[senderId]) {
          await createPeerConnection(senderId);
        }

        const pc = peerConnections[senderId];
        const signalingState = pc.signalingState as SignalingState;

        // Печатаем состояние сигнализации, чтобы понять, что происходит
        console.log("signalingState", signalingState);

        if (signalingState === "have-local-offer" || signalingState === "have-remote-offer") {
          // Игнорируем предложение, если есть локальное или удалённое предложение
          console.warn("Ignoring incoming offer because the signaling state is not stable.");
          return;
        }

        // Устанавливаем удалённое описание
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        console.log("Remote description set");

        // Если мы в состоянии "have-remote-offer", создаем ответ
        if (pc.signalingState === "have-remote-offer" || pc.signalingState === "stable") {
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await setDoc(doc(db, `calls/${callId.value}/answers`, senderId), { answer });
          console.log("Answer sent");
        }
      }
    });
  });

  listenForCandidates();
};

// Получение ICE-кандидатов
const listenForCandidates = () => {
  onSnapshot(collection(db, `calls/${callId.value}/candidates`), async (snapshot) => {
    snapshot.docChanges().forEach(async (change) => {
      if (change.type === "added") {
        const { candidate, sender } = change.doc.data();
        const pc = peerConnections[sender];

        if (pc) {
          const signalingState = pc.signalingState as RTCSignalingState;

          // Проверяем, что состояние сигнализации позволяет добавить кандидата
          if (signalingState === "have-remote-offer" || signalingState === "stable") {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
              console.log("ICE candidate added");
            } catch (error) {
              console.error("Failed to add ICE candidate", error);
            }
          } else {
            console.warn("Ignoring ICE candidate because the signaling state is not correct:", signalingState);
          }
        }
      }
    });
  });
};





  // Покинуть звонок
  const leaveCall = async () => {
    Object.values(peerConnections).forEach((pc) => pc.close());
    Object.keys(peerConnections).forEach((id) => delete peerConnections[id]);

    localStream.value?.getTracks().forEach((track) => track.stop());
    localStream.value = null;

    if (localVideo.value) localVideo.value.srcObject = null;

    await deleteDoc(doc(db, "calls", callId.value));
    callId.value = "";
  };
</script>

<style scoped>
video {
  width: 300px;
  height: auto;
  border: 2px solid #000;
  margin: 10px;
}
</style>
