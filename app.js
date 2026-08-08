import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore";

// Your Firebase Config configuration (Spark no-cost plan)
const firebaseConfig = {
  apiKey: "AIzaSyA_XnffybaryptukW63qojheCXy4terHqM",
  authDomain: "trailman100-membersip-system.firebaseapp.com",
  projectId: "trailman100-membersip-system",
  storageBucket: "trailman100-membersip-system.firebasestorage.app",
  messagingSenderId: "678783149009",
  appId: "1:678783149009:web:adcd7ebef242aed5d4b6f0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// DOM Selection
const authSection = document.getElementById('auth-section');
const portalSection = document.getElementById('portal-section');
const canvas = document.getElementById('card-canvas');

// Auth Monitor
onAuthStateChanged(auth, async (user) => {
  if (user) {
    authSection.classList.add('hidden');
    portalSection.classList.remove('hidden');
    await loadMemberData(user.uid);
  } else {
    authSection.classList.remove('hidden');
    portalSection.classList.add('hidden');
  }
});

// Authentication Handlers
document.getElementById('btn-login').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  signInWithEmailAndPassword(auth, email, password).catch(err => alert(err.message));
});

document.getElementById('btn-reset').addEventListener('click', () => {
  const email = document.getElementById('email').value;
  if (!email) return alert("Please enter your email first.");
  sendPasswordResetEmail(auth, email)
    .then(() => alert("Password reset email sent!"))
    .catch(err => alert(err.message));
});

document.getElementById('btn-logout').addEventListener('click', () => signOut(auth));

// Database Loading
async function loadMemberData(uid) {
  const docRef = doc(db, "members", uid);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    const data = docSnap.data();
    document.getElementById('profile-name').value = data.name || "";
    document.getElementById('profile-number').value = data.memberNumber || "";
    document.getElementById('member-display-name').textContent = data.name || "Member";
    drawCard(data.name, data.memberNumber);
  } else {
    // Generate a default membership number if they don't have one
    const newNum = "TM-" + Math.floor(100000 + Math.random() * 900000);
    await setDoc(docRef, { name: "", memberNumber: newNum });
    document.getElementById('profile-number').value = newNum;
    drawCard("", newNum);
  }
}

// Database Saving
document.getElementById('btn-update').addEventListener('click', async () => {
  const user = auth.currentUser;
  const newName = document.getElementById('profile-name').value;
  const num = document.getElementById('profile-number').value;
  
  if (user) {
    await setDoc(doc(db, "members", user.uid), { name: newName }, { merge: true });
    document.getElementById('member-display-name').textContent = newName;
    drawCard(newName, num);
    alert("Profile and card successfully updated!");
  }
});

// Canvas Drawing (Prints details directly over the template image)
function drawCard(name, memberNumber) {
  const ctx = canvas.getContext('2d');
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = "card_template.png"; // Ensure this image is located in your public/ root directory

  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Style and place Name text
    ctx.fillStyle = "#FFFFFF"; 
    ctx.font = "bold 24px sans-serif";
    ctx.fillText(name || "New Trailman", 50, 200); 

    // Style and place Member ID text
    ctx.font = "18px monospace";
    ctx.fillText("Member No: " + memberNumber, 50, 240); 
  };
}

// Card Download
document.getElementById('btn-download').addEventListener('click', () => {
  const link = document.createElement('a');
  link.download = 'my-membership-card.png';
  link.href = canvas.toDataURL();
  link.click();
});
