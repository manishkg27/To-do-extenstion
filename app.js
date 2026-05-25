// ==========================================
// 1. DOM Elements
// ==========================================
const taskListEl = document.getElementById("task-list");
const openAddModalBtn = document.getElementById("open-add-modal-btn");
const taskModal = document.getElementById("task-modal");
const cancelModalBtn = document.getElementById("cancel-modal-btn");
const taskForm = document.getElementById("task-form");
const taskIdInput = document.getElementById("task-id");
const taskTitleInput = document.getElementById("task-title-input");
const taskDescInput = document.getElementById("task-desc-input");
const modalTitle = document.getElementById("modal-title");
const searchInput = document.getElementById("search-input");
const filterBtns = document.querySelectorAll(".filter-btn");

// ==========================================
// 2. Application State
// ==========================================
let tasks = [];
let currentFilter = "all"; // 'all', 'uncompleted', or 'completed'
let searchQuery = "";

// ==========================================
// 3. Initialization
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  loadTasks();
});

// ==========================================
// 4. Core Functions (Storage & Rendering)
// ==========================================

// Fetch tasks from Chrome's local storage
function loadTasks() {
  chrome.storage.local.get(["tasks"], (result) => {
    tasks = result.tasks || [];
    renderTasks();
  });
}

// Save current tasks array to Chrome's local storage
function saveTasks() {
  chrome.storage.local.set({ tasks: tasks });
}

// Generate the HTML for the tasks based on filters, search, AND status
function renderTasks() {
    taskListEl.innerHTML = '';

    // Filter tasks based on search query AND active filter tab
    const filteredTasks = tasks.filter(task => {
        const matchesSearch = task.title.toLowerCase().includes(searchQuery) || 
                              task.description.toLowerCase().includes(searchQuery);
        
        let matchesFilter = true;
        if (currentFilter === 'completed') matchesFilter = task.completed === true;
        if (currentFilter === 'uncompleted') matchesFilter = task.completed === false;

        return matchesSearch && matchesFilter;
    });

    // ✨ NEW LOGIC: Sort tasks so uncompleted are at the top, completed at the bottom
    filteredTasks.sort((a, b) => Number(a.completed) - Number(b.completed));

    // Empty State Check
    if (filteredTasks.length === 0) {
        taskListEl.innerHTML = `
            <tr>
                <td colspan="4" class="center-text" style="color: var(--text-muted); padding: 40px 0;">
                    <i class="fa-solid fa-inbox" style="font-size: 24px; display: block; margin-bottom: 10px;"></i>
                    No tasks found.
                </td>
            </tr>`;
        return;
    }

    // Build Rows
    filteredTasks.forEach((task) => {
      const statusIcon = task.completed
        ? '<i class="fa-solid fa-circle-check"></i>'
        : '<i class="fa-regular fa-circle"></i>';

      const textStyle = task.completed
        ? "text-decoration: line-through; color: var(--text-muted);"
        : "";

      // Update the <tr> tag inside renderTasks()
      const rowHTML = `
            <tr draggable="true" data-id="${task.id}" class="task-row">
                <td class="task-title" style="${textStyle}">${task.title}</td>
                <td class="task-desc" style="${textStyle}">${task.description}</td>
                <td class="center-text">
                    <button class="status-btn" data-id="${task.id}">
                        ${statusIcon}
                    </button>
                </td>
                <td class="center-text actions-cell">
                    <button class="action-btn move-up-btn" data-id="${task.id}" title="Move Up"><i class="fa-solid fa-arrow-up"></i></button>
                    <button class="action-btn move-down-btn" data-id="${task.id}" title="Move Down"><i class="fa-solid fa-arrow-down"></i></button>
                    <button class="action-btn edit-btn" data-id="${task.id}"><i class="fa-solid fa-pen-to-square"></i> Edit</button>
                    <button class="action-btn delete-btn" data-id="${task.id}"><i class="fa-solid fa-trash-can"></i> Delete</button>
                </td>
            </tr>
        `;

      taskListEl.insertAdjacentHTML("beforeend", rowHTML);
    });
}

// ==========================================
// 5. Event Listeners (Modals & Forms)
// ==========================================

// Open Modal for a New Task
openAddModalBtn.addEventListener("click", () => {
  taskIdInput.value = "";
  taskForm.reset();
  modalTitle.textContent = "Add New Task";
  taskModal.classList.remove("hidden");
  taskTitleInput.focus();
});

// Close Modal
cancelModalBtn.addEventListener("click", () => {
  taskModal.classList.add("hidden");
});

// Submit Form (Handles Add & Edit)
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const title = taskTitleInput.value.trim();
  const description = taskDescInput.value.trim();
  const id = taskIdInput.value;

  if (!title) return;

  if (id) {
    // Edit existing
    const taskIndex = tasks.findIndex((t) => t.id == id);
    if (taskIndex > -1) {
      tasks[taskIndex].title = title;
      tasks[taskIndex].description = description;
    }
  } else {
    // Add new
    tasks.push({
      id: Date.now(),
      title: title,
      description: description,
      completed: false,
    });
  }

  saveTasks();
  renderTasks();
  taskModal.classList.add("hidden");
});

// ==========================================
// 6. Event Listeners (Table Actions)
// ==========================================

// Handle Complete, Edit, and Delete clicks inside the table
taskListEl.addEventListener("click", (e) => {
  const targetBtn = e.target.closest("button");
  if (!targetBtn) return;

  const taskId = targetBtn.getAttribute("data-id");

  // Move Up
  if (targetBtn.classList.contains("move-up-btn")) {
    const currentIndex = tasks.findIndex((t) => t.id == taskId);
    const currentTask = tasks[currentIndex];

    // Find the closest task ABOVE it with the same completion status
    let targetIndex = -1;
    for (let i = currentIndex - 1; i >= 0; i--) {
      if (tasks[i].completed === currentTask.completed) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex !== -1) {
      // Swap their positions in the array
      [tasks[currentIndex], tasks[targetIndex]] = [
        tasks[targetIndex],
        tasks[currentIndex],
      ];
      saveTasks();
      renderTasks();
    }
  }

  // Move Down
  if (targetBtn.classList.contains("move-down-btn")) {
    const currentIndex = tasks.findIndex((t) => t.id == taskId);
    const currentTask = tasks[currentIndex];

    // Find the closest task BELOW it with the same completion status
    let targetIndex = -1;
    for (let i = currentIndex + 1; i < tasks.length; i++) {
      if (tasks[i].completed === currentTask.completed) {
        targetIndex = i;
        break;
      }
    }

    if (targetIndex !== -1) {
      // Swap their positions in the array
      [tasks[currentIndex], tasks[targetIndex]] = [
        tasks[targetIndex],
        tasks[currentIndex],
      ];
      saveTasks();
      renderTasks();
    }
  }
  // Toggle Complete
  if (targetBtn.classList.contains("status-btn")) {
    const task = tasks.find((t) => t.id == taskId);
    if (task) {
      task.completed = !task.completed;
      saveTasks();
      renderTasks();
    }
  }

  // Delete
  if (targetBtn.classList.contains("delete-btn")) {
    if (confirm("Are you sure you want to delete this task?")) {
      tasks = tasks.filter((t) => t.id != taskId);
      saveTasks();
      renderTasks();
    }
  }

  // Edit
  if (targetBtn.classList.contains("edit-btn")) {
    const task = tasks.find((t) => t.id == taskId);
    if (task) {
      taskIdInput.value = task.id;
      taskTitleInput.value = task.title;
      taskDescInput.value = task.description;
      modalTitle.textContent = "Edit Task";
      taskModal.classList.remove("hidden");
    }
  }
});

// ==========================================
// 7. Event Listeners (Search & Filters)
// ==========================================

// Handle Search Input
searchInput.addEventListener("input", (e) => {
  searchQuery = e.target.value.toLowerCase().trim();
  renderTasks(); // Re-render table as user types
});

// Handle Filter Buttons
filterBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    // Remove 'active' class from all buttons
    filterBtns.forEach((b) => b.classList.remove("active"));

    // Add 'active' class to clicked button
    e.target.classList.add("active");

    // Update filter state and re-render
    currentFilter = e.target.getAttribute("data-filter");
    renderTasks();
  });
});
// ==========================================
// 8. Drag and Drop Functionality
// ==========================================

let draggedTaskId = null;

// 1. When the user grabs a row
taskListEl.addEventListener('dragstart', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;

    draggedTaskId = row.getAttribute('data-id');
    row.classList.add('dragging');
    
    // This makes the ghost image look nicer
    e.dataTransfer.effectAllowed = 'move';
});

// 2. When the row is released
taskListEl.addEventListener('dragend', (e) => {
    const row = e.target.closest('tr');
    if (row) row.classList.remove('dragging');
    draggedTaskId = null;
});

// 3. Allow dropping by preventing the default browser behavior
taskListEl.addEventListener('dragover', (e) => {
    e.preventDefault(); 
});

// 4. When the user drops the row onto a new location
taskListEl.addEventListener('drop', (e) => {
    e.preventDefault();
    
    const targetRow = e.target.closest('tr');
    if (!targetRow || !draggedTaskId) return;

    const targetTaskId = targetRow.getAttribute('data-id');
    
    // Don't do anything if they dropped it on itself
    if (draggedTaskId === targetTaskId) return;

    // Find the positions in our array
    const draggedIndex = tasks.findIndex(t => t.id == draggedTaskId);
    const targetIndex = tasks.findIndex(t => t.id == targetTaskId);

    if (draggedIndex > -1 && targetIndex > -1) {
        // Cut the dragged task out of the array
        const [draggedTask] = tasks.splice(draggedIndex, 1);
        
        // Paste it back in at the new target location
        tasks.splice(targetIndex, 0, draggedTask);

        // Save and update UI
        saveTasks();
        renderTasks();
    }
});