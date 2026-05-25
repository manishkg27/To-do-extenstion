# To-Do List - Browser Extension

A feature-rich, full-page Chrome browser extension for managing daily tasks. This extension replaces the standard tiny popup with a full-page tab experience, complete with advanced filtering, searching, and native drag-and-drop prioritization.

## ✨ Features

* **Task Management:** Create, edit, delete, and complete tasks with ease.
* **Rich Data:** Tasks include both a Title and a detailed Description.
* **Full-Page Experience:** Opens in a brand-new tab for a spacious, distraction-free environment.
* **Persistent Storage:** Saves tasks securely using Chrome's local storage API (data persists across browser sessions).
* **Smart Sorting:** * Automatically pushes completed tasks to the bottom of the list.
  * Move tasks up or down manually using arrow buttons.
  * **Drag-and-Drop:** Native HTML5 drag-and-drop support to visually prioritize uncompleted tasks.
* **Search & Filter:**
  * Real-time search bar that filters by both title and description.
  * Quick-filter tabs to view 'All', 'Uncompleted', or 'Completed' tasks.
* **Modern UI/UX:** Clean design featuring custom CSS, modal overlays for forms, and FontAwesome icons.

## 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3 (Flexbox, CSS Variables)
* **Logic:** Vanilla JavaScript (ES6+)
* **Chrome APIs:** * Manifest V3 Standard
  * `chrome.storage.local` (Asynchronous data persistence)
  * `chrome.action` & `chrome.tabs` (Background service worker tab management)

## 📁 Project Structure
```text
todo-extension/
│
├── manifest.json       # Extension configuration (Manifest V3)
├── background.js       # Service worker to open the extension in a new tab
├── index.html          # Main application layout and hidden modals
├── style.css           # Custom styling and drag-and-drop visual states
├── app.js              # Core logic, storage, state management, and DOM events