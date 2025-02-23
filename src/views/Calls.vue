<template>
  <div>
    <video ref="localVideo" autoplay playsinline></video>
    <video ref="remoteVideo" autoplay playsinline></video>
    <button @click="createCall">Start Call</button>
    <button @click="joinCall">Join Call</button>
    <button @click="leaveCall">Leave Call</button>
    <input v-model="callId" placeholder="Enter Call ID" />
  </div>
</template>

<script setup lang="ts">
  import { ref, onUnmounted } from "vue";
  import { collection, doc, setDoc, getDoc, onSnapshot, addDoc, deleteDoc } from "firebase/firestore";
  import { db } from "../firebase";

  const localVideo = ref<HTMLVideoElement | null>(null);
  const remoteVideo = ref<HTMLVideoElement | null>(null);
  const localStream = ref<MediaStream | null>(null);
  const peerConnection = ref<RTCPeerConnection | null>(null);
  const callId = ref<string>("");

  // STUN Server Configuration
  const ICE_SERVERS: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };


  onUnmounted(() => {
    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => track.stop());
    }
    if (peerConnection.value) {
      peerConnection.value.close();
    }
  });
  
  // Start Call
  const createCall = async () => {
    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideo.value) localVideo.value.srcObject = localStream.value;

    peerConnection.value = new RTCPeerConnection(ICE_SERVERS);
    localStream.value.getTracks().forEach((track) => peerConnection.value!.addTrack(track, localStream.value!));

    // Handle remote stream
    peerConnection.value.ontrack = (event) => {
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = event.streams[0];
      }
    };

    // Generate Firestore Document
    const callDoc = doc(collection(db, "calls"));
    callId.value = callDoc.id;

    // Handle ICE Candidates (Store as a new document for each)
    peerConnection.value.onicecandidate = (event) => {
      if (event.candidate) {        
        addDoc(collection(db, `calls/${callId.value}/candidates`), event.candidate.toJSON());
      }
    };

    // Create and Save Offer
    const offer = await peerConnection.value.createOffer();
    await peerConnection.value.setLocalDescription(offer);
    await setDoc(callDoc, { offer });

    console.log("📞 Call Started. Offer Sent:", offer);

    // Listen for Answer
    onSnapshot(callDoc, async (snapshot) => {
      const data = snapshot.data();
      if (data?.answer && peerConnection.value && !peerConnection.value.remoteDescription) {
        await peerConnection.value.setRemoteDescription(new RTCSessionDescription(data.answer));
        console.log("✅ Remote Description Set");
      }
    });

    // Listen for Remote ICE Candidates
    listenForICECandidates();
  };

  // Join Call
  const joinCall = async () => {
    if (!callId.value) {
      alert("Please enter a Call ID!");
      return;
    }

    localStream.value = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    if (localVideo.value) localVideo.value.srcObject = localStream.value;

    peerConnection.value = new RTCPeerConnection(ICE_SERVERS);
    localStream.value.getTracks().forEach((track) => peerConnection.value!.addTrack(track, localStream.value!));

    // Handle remote stream
    peerConnection.value.ontrack = (event) => {
      if (remoteVideo.value) {
        remoteVideo.value.srcObject = event.streams[0];
      }
    };

    // Handle ICE Candidates (Store as a new document for each)
    peerConnection.value.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(collection(db, `calls/${callId.value}/candidates`), event.candidate.toJSON());
      }
    };

    // Get Offer from Firestore
    const callDoc = doc(db, "calls", callId.value);
    const callData = (await getDoc(callDoc)).data();

    if (!callData?.offer) {
      alert("Invalid Call ID!");
      return;
    }

    await peerConnection.value.setRemoteDescription(new RTCSessionDescription(callData.offer));
    console.log("✅ Remote Offer Set");

    // Create and Save Answer
    const answer = await peerConnection.value.createAnswer();
    await peerConnection.value.setLocalDescription(answer);
    await setDoc(callDoc, { answer }, { merge: true });

    console.log("📞 Joined Call. Answer Sent:", answer);

    // Listen for Remote ICE Candidates
    listenForICECandidates();
  };

  // Listen for ICE Candidates
  const listenForICECandidates = () => {
    if (!callId.value) return;
    const candidatesRef = collection(db, `calls/${callId.value}/candidates`);
    onSnapshot(candidatesRef, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added" && peerConnection.value) {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.value.addIceCandidate(candidate);
          console.log("✅ Added Remote ICE Candidate:", candidate);
        }
      });
    });
  };

  const leaveCall = async () => {
    if (peerConnection.value) {
      peerConnection.value.close(); // Close the connection
      peerConnection.value = null;
      console.log("📴 Peer Connection Closed");
    }

    if (localStream.value) {
      localStream.value.getTracks().forEach((track) => track.stop()); // Stop all tracks
      localStream.value = null;
      console.log("📴 Local Stream Stopped");
    }

    if (remoteVideo.value) {
      remoteVideo.value.srcObject = null; // Clear remote video
    }

    if (localVideo.value) {
      localVideo.value.srcObject = null; // Clear local video
    }

    // Optional: Remove Call Data from Firestore
    if (callId.value) {
      await deleteDoc(doc(db, "calls", callId.value));
      console.log("🗑️ Call Data Deleted from Firestore");
    }

    callId.value = ""; // Reset Call ID
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
