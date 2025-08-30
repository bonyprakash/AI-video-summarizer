// Firebase Configuration
// Your actual Firebase config from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDcH_YwtsqBVW1R9HNDS3VYwy-W98Cicwg",
  authDomain: "ai-video-summarizer-6fffc.firebaseapp.com",
  projectId: "ai-video-summarizer-6fffc",
  storageBucket: "ai-video-summarizer-6fffc.firebasestorage.app",
  messagingSenderId: "845384053299",
  appId: "1:845384053299:web:6066ed46247b878b802946",
  measurementId: "G-Y3NT1NPQDT"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Authentication
const auth = firebase.auth();

// Initialize Firebase Analytics (optional)
const analytics = firebase.analytics();

console.log('🔥 Firebase initialized successfully');
