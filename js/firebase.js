// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCFdL2ek5R4Z0UPUj23q3tNIBbJMhvmlco",
    authDomain: "sigil-creator-6f512.firebaseapp.com",
    projectId: "sigil-creator-6f512",
    storageBucket: "sigil-creator-6f512.firebasestorage.app",
    messagingSenderId: "193540808508",
    appId: "1:193540808508:web:c7f94a70c174a0baf78839",
    measurementId: "G-15MVDQFBTT"
};

/// ✅ Initialize using compat
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// ✅ Make functions accessible in HTML (via window)
window.signup = function () {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  auth.createUserWithEmailAndPassword(email, pass).catch(console.error);
};

window.login = function () {
  const email = document.getElementById("email").value;
  const pass = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, pass).catch(console.error);
};

window.logout = function () {
  auth.signOut();
};

// ✅ Auth state listener
auth.onAuthStateChanged(user => {
    const loginModal = bootstrap.Modal.getInstance(document.getElementById("loginModal"));
    if (user) {
      if (loginModal) {
        loginModal.hide();
      }
      loadUserDictionary(user.uid);
      document.getElementById("loginStatus").textContent = `Logged in as ${user.email}`;
      document.getElementById("logoutBtn").style.display = "inline-block";
      document.getElementById("openLoginModalBtn").style.display = "none";
      document.getElementById("cloudSyncStatus").textContent = "Synced with cloud.";
    } else {
      document.getElementById("loginStatus").textContent = `Not logged in`;
      document.getElementById("logoutBtn").style.display = "none";
      document.getElementById("openLoginModalBtn").style.display = "inline-block";
      document.getElementById("cloudSyncStatus").textContent = "Local dictionary only. Log in to sync.";
    }
  });
  

// ✅ Firestore save/load
function saveUserDictionary(uid, dictionary) {
  db.collection("dictionaries").doc(uid).set({ data: dictionary }).then(() => {
    console.log("Dictionary synced to Firestore.");
  }).catch(error => {
    console.error("Error saving to Firestore:", error);
  });
}

function loadUserDictionary(uid) {
  db.collection("dictionaries").doc(uid).get().then(doc => {
    if (doc.exists) {
      const saved = doc.data().data;
      localStorage.setItem("sigilDictionary", JSON.stringify(saved));
      updateDictionaryDisplay();
      console.log("Dictionary loaded from Firestore.");
    } else {
      console.log("No dictionary found for user.");
    }
  }).catch(error => {
    console.error("Error loading from Firestore:", error);
  });
}