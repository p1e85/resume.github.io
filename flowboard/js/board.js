// js/board.js
let currentBoardId = null;
let currentUser = null;

auth.onAuthStateChanged(user => {
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  currentUser = user;
  initBoard();
});

function initBoard() {
  const urlParams = new URLSearchParams(window.location.search);
  currentBoardId = urlParams.get('id');

  if (!currentBoardId) {
    window.location.href = 'dashboard.html';
    return;
  }

  loadBoardData();
}

async function loadBoardData() {
  try {
    const boardDoc = await db.collection('boards').doc(currentBoardId).get();
    if (!boardDoc.exists) {
      alert("Board not found");
      return;
    }

    const board = boardDoc.data();
    document.getElementById('board-title').textContent = board.title;

    renderColumns();
  } catch (e) {
    console.error(e);
  }
}

async function renderColumns() {
  const columnsContainer = document.getElementById('columns');
  columnsContainer.innerHTML = '';

  // Get columns for this board
  const snapshot = await db.collection(`boards/${currentBoardId}/columns`)
    .orderBy('order')
    .get();

  snapshot.forEach(doc => {
    const col = doc.data();
    const colHTML = `
      <div class="column bg-zinc-900 rounded-3xl p-4 w-80 flex-shrink-0" data-column-id="${doc.id}">
        <div class="flex justify-between items-center mb-4 px-2">
          <h3 class="font-semibold">${col.title}</h3>
          <span class="text-xs bg-zinc-800 px-3 py-1 rounded-2xl" id="count-${doc.id}">0</span>
        </div>
        
        <div class="min-h-[400px] space-y-3 column-dropzone" 
             ondrop="drop(event)" 
             ondragover="allowDrop(event)">
          <!-- Tasks will be added here by JS -->
        </div>
        
        <button onclick="addNewTask('${doc.id}')" 
                class="mt-4 w-full py-3 text-sm text-gray-400 hover:text-white border border-dashed border-zinc-700 hover:border-zinc-500 rounded-2xl">
          + Add Task
        </button>
      </div>
    `;
    columnsContainer.innerHTML += colHTML;
  });

  // Load tasks after columns
  loadTasks();
}

async function loadTasks() {
  const snapshot = await db.collection(`boards/${currentBoardId}/tasks`).get();
  
  snapshot.forEach(doc => {
    const task = doc.data();
    const columnDropzone = document.querySelector(`[data-column-id="${task.columnId}"] .column-dropzone`);
    
    if (columnDropzone) {
      const taskHTML = createTaskHTML(doc.id, task);
      columnDropzone.innerHTML += taskHTML;
    }
  });
}

function createTaskHTML(id, task) {
  return `
    <div class="card bg-zinc-800 hover:bg-zinc-700 rounded-2xl p-4 cursor-pointer" 
         draggable="true" 
         ondragstart="drag(event)" 
         data-task-id="${id}"
         onclick="openTaskModal('${id}')">
      <p class="font-medium">${task.title}</p>
      \( {task.description ? `<p class="text-sm text-gray-400 mt-2 line-clamp-2"> \){task.description}</p>` : ''}
    </div>
  `;
}

// Drag & Drop Functions
function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  ev.dataTransfer.setData("text", ev.target.getAttribute("data-task-id"));
  ev.target.classList.add('dragging');
}

async function drop(ev) {
  ev.preventDefault();
  const taskId = ev.dataTransfer.getData("text");
  const newColumnId = ev.currentTarget.parentElement.getAttribute("data-column-id");
  
  // Update in Firestore
  await db.collection(`boards/${currentBoardId}/tasks`).doc(taskId).update({
    columnId: newColumnId,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  
  // Refresh the board
  renderColumns();
}

// Add new column
async function addNewColumn() {
  const title = prompt("Column name:", "New Column");
  if (!title) return;

  await db.collection(`boards/${currentBoardId}/columns`).add({
    title: title,
    order: Date.now(),
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  renderColumns();
}

// Add new task
async function addNewTask(columnId) {
  const title = prompt("Task title:");
  if (!title) return;

  await db.collection(`boards/${currentBoardId}/tasks`).add({
    title: title,
    description: "",
    columnId: columnId,
    createdBy: currentUser.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  renderColumns();
}

// Task Modal
let currentEditingTaskId = null;

async function openTaskModal(taskId) {
  currentEditingTaskId = taskId;
  const taskDoc = await db.collection(`boards/${currentBoardId}/tasks`).doc(taskId).get();
  const task = taskDoc.data();

  document.getElementById('modal-task-title').value = task.title || '';
  document.getElementById('modal-task-desc').value = task.description || '';
  document.getElementById('task-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('task-modal').classList.add('hidden');
}

async function saveTaskModal() {
  if (!currentEditingTaskId) return;

  const newTitle = document.getElementById('modal-task-title').value;
  const newDesc = document.getElementById('modal-task-desc').value;

  await db.collection(`boards/${currentBoardId}/tasks`).doc(currentEditingTaskId).update({
    title: newTitle,
    description: newDesc,
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  closeModal();
  renderColumns();
}

function goToDashboard() {
  window.location.href = 'dashboard.html';
}