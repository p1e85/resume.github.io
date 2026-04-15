// js/dashboard.js

let currentUser = null;

// Load user info in header
auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }

  currentUser = user;
  renderUserInfo(user);
  loadBoards(user.uid);
});

function renderUserInfo(user) {
  const userDiv = document.getElementById('user-info');
  userDiv.innerHTML = `
    <img src="${user.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user.displayName || user.email)}" 
         class="w-9 h-9 rounded-2xl object-cover">
    <div>
      <p class="font-medium text-sm">${user.displayName || user.email}</p>
      <p class="text-xs text-gray-500">Click to logout</p>
    </div>
  `;
}

async function loadBoards(uid) {
  const grid = document.getElementById('boards-grid');
  const empty = document.getElementById('empty-state');
  
  try {
    const snapshot = await db.collection('boards')
      .where('members', 'array-contains', uid)
      .orderBy('updatedAt', 'desc')
      .get();

    grid.innerHTML = '';

    if (snapshot.empty) {
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');

    snapshot.forEach(doc => {
      const board = doc.data();
      const boardHTML = `
        <div onclick="openBoard('${doc.id}')" 
             class="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-3xl p-6 cursor-pointer transition-all hover:-translate-y-1">
          <div class="h-2 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-t-3xl -mx-6 -mt-6 mb-6"></div>
          
          <h3 class="font-semibold text-xl mb-1">${board.title}</h3>
          <p class="text-gray-400 text-sm line-clamp-2 mb-6">${board.description || 'No description'}</p>
          
          <div class="flex items-center justify-between">
            <div class="flex -space-x-2">
              ${board.members ? board.members.slice(0, 3).map(m => `
                <img src="https://ui-avatars.com/api/?name=${m}" class="w-7 h-7 rounded-2xl ring-2 ring-zinc-900">
              `).join('') : ''}
            </div>
            <span class="text-xs text-gray-500">${new Date(board.updatedAt?.toDate()).toLocaleDateString()}</span>
          </div>
        </div>
      `;
      grid.innerHTML += boardHTML;
    });
  } catch (error) {
    console.error(error);
  }
}

async function createNewBoard() {
  const title = prompt("Board title:", "My New Project");
  if (!title) return;

  try {
    const newBoard = {
      title: title,
      description: "",
      ownerId: currentUser.uid,
      members: [currentUser.uid],
      coverColor: "#6366f1",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    const docRef = await db.collection('boards').add(newBoard);
    openBoard(docRef.id);
  } catch (error) {
    alert("Error creating board: " + error.message);
  }
}

function openBoard(boardId) {
  window.location.href = `board.html?id=${boardId}`;
}

function logout() {
  if (confirm("Logout?")) {
    auth.signOut().then(() => {
      window.location.href = 'index.html';
    });
  }
}

function goHome() {
  window.location.href = 'dashboard.html';
}