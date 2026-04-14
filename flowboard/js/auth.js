// js/auth.js
async function googleSignIn() {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
    window.location.href = 'dashboard.html';
  } catch (error) {
    console.error(error);
    alert("Error signing in");
  }
}

async function emailSignUp() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    await auth.createUserWithEmailAndPassword(email, password);
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert(error.message);
  }
}

async function emailLogin() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  
  try {
    await auth.signInWithEmailAndPassword(email, password);
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert(error.message);
  }
}

async function guestLogin() {
  try {
    await auth.signInAnonymously();
    window.location.href = 'dashboard.html';
  } catch (error) {
    alert(error.message);
  }
}

// Auto redirect if already logged in
auth.onAuthStateChanged(user => {
  if (user && window.location.pathname.includes('index.html')) {
    window.location.href = 'dashboard.html';
  }
});