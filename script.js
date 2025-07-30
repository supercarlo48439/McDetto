// CONFIGURAZIONE FIREBASE - DA COMPILARE
const firebaseConfig = {
  apiKey: "AIzaSyBWvmJMdhIj6Q-KQhngTHLhkiiOW4bY_QU",
  authDomain: "mcdetto-b1264.firebaseapp.com",
  projectId: "mcdetto-b1264",
  storageBucket: "mcdetto-b1264.firebasestorage.app",
  messagingSenderId: "562034060696",
  appId: "1:562034060696:web:bcbe0e9897c5bef2334fed",
  measurementId: "G-CPEJSTMQ4L"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Form pubblico
const commentForm = document.getElementById("comment-form");
if (commentForm) {
    commentForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const content = document.getElementById("comment-input").value.trim();
        if (content) {
            await db.collection("comments").add({
                text: content,
                approved: false,
                reported: false,
                timestamp: new Date()
            });
            commentForm.reset();
            alert("Commento inviato! Sarà visibile dopo l'approvazione.");
        }
    });
}

// Admin panel
async function loadAdminComments() {
    const pendingContainer = document.getElementById("pending-messages");
    const publishedContainer = document.getElementById("published-messages");
    if (!pendingContainer || !publishedContainer) return;

    const snapshot = await db.collection("comments").orderBy("timestamp", "desc").get();
    pendingContainer.innerHTML = "";
    publishedContainer.innerHTML = "";

    snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.textContent = data.text;

        if (data.reported) div.style.borderLeft = "5px solid red";

        if (!data.approved) {
            const approveBtn = document.createElement("button");
            approveBtn.textContent = "Approva";
            approveBtn.onclick = async () => {
                await db.collection("comments").doc(doc.id).update({ approved: true });
                loadAdminComments();
            };
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Elimina";
            deleteBtn.onclick = async () => {
                await db.collection("comments").doc(doc.id).delete();
                loadAdminComments();
            };
            div.appendChild(approveBtn);
            div.appendChild(deleteBtn);
            pendingContainer.appendChild(div);
        } else {
            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Elimina";
            deleteBtn.onclick = async () => {
                await db.collection("comments").doc(doc.id).delete();
                loadAdminComments();
            };
            publishedContainer.appendChild(div);
            div.appendChild(deleteBtn);
        }
    });
}

async function loadPublicComments() {
    const container = document.getElementById("messages");
    if (!container) return;

    const snapshot = await db.collection("comments")
        .where("approved", "==", true)
        .orderBy("timestamp", "desc")
        .get();

    container.innerHTML = "";
    snapshot.forEach(doc => {
        const data = doc.data();
        const div = document.createElement("div");
        div.textContent = data.text;

        const reportBtn = document.createElement("button");
        reportBtn.textContent = "Segnala";
        reportBtn.onclick = async () => {
            await db.collection("comments").doc(doc.id).update({ reported: true });
            alert("Commento segnalato.");
        };
        div.appendChild(reportBtn);
        container.appendChild(div);
    });
}

window.onload = () => {
    loadAdminComments();
    loadPublicComments();
};