# 📅 Year Planner

> **A fast, Figma-smooth annual roadmap planning web application.** Visualize your whole year at a glance, drag and extend goals across dates, select with Windows-style marquee boxes, and manage your annual roadmap with effortless 60fps responsiveness.

---

## ✨ Features

- **🗓️ 12-Month Interactive Calendar Grid**:
  - Full-year view (January to December) with month headers and quarter indicators (Q1–Q4).
  - **Drag-to-Move**: Seamlessly move goal bars across months and dates.
  - **Edge Resizing**: Drag left and right resize handles to stretch or contract start and end dates with real-time feedback.
  - **Real-Time Date Calculations**: Instant live formatting (e.g. `May 1 - Jun 29`) and duration calculation in days.
  - **Current Day Marker**: Visual red line indicating today's exact position in the year.

- **🟦 Windows / Figma-Style Marquee Selection**:
  - Click and drag across any empty timeline area to draw a **translucent blue selection rectangle**.
  - Batch-select multiple goals to move them synchronously or delete them in one step.

- **🎯 Synchronized Goals List**:
  - Live synchronized with the timeline board.
  - **`+ Add Goal`** button conveniently located on the middle-right.
  - One-click color palette picker to customize goal colors.
  - Inline title editing with auto-save.
  - Drag-and-drop handles to reorder goal rows.
  - One-click deletion with instant updates.

- **🧲 Custom Snapping Precision**:
  - **Day** — Exact calendar day alignment (Default).
  - **Week** — 7-day sprint alignment.
  - **15 Days** — 1st and 15th of each month.
  - **Month** — Snap to month boundaries.
  - **Free** — Smooth floating movement without snapping.

- **💾 Persistent Local Storage**:
  - Automatically saves all your roadmap goals, colors, dates, and settings in your browser (`localStorage`).
  - No login or server setup required; your data is 100% private and persists across refreshes and restarts.
  - Real-time **`● Saved`** status indicator in the header.

- **📤 Export & Backup**:
  - **Download High-Res Image (PNG)**: 2x Retina-ready export of your roadmap for presentations and documentation.
  - **JSON Backup / Restore**: Download backup files or load existing roadmaps anytime.

---

## ⌨️ Keyboard & Gesture Shortcuts

| Gesture / Key | Action |
| :--- | :--- |
| **Drag Bar** | Move start/end dates smoothly along the timeline or between lanes |
| **Drag Ends (Handles)** | Stretch / resize duration from left or right edge |
| **Click & Drag Canvas** | Draw translucent blue marquee box to select multiple goals |
| **Shift + Click** | Add / remove goal from multi-selection |
| **Double Click Bar / Title** | Inline edit goal title directly |
| **Ctrl + A** | Select all goals in the current year |
| **Ctrl + D** | Duplicate selected goal |
| **Delete / Backspace** | Delete selected goal(s) |
| **Ctrl + Z** | Undo last change |
| **Ctrl + Y / Ctrl+Shift+Z** | Redo last undone change |
| **Escape** | Clear active selection |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- `npm` or `yarn`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tingirikar/Year-Planner.git
   cd Year-Planner
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🛠️ Production Build

To create an optimized production build:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

---

## 🏗️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Vanilla CSS (Custom Design System with CSS Tokens)
- **Icons**: Lucide React
- **Exporting**: `html-to-image`
- **State & Persistence**: React Context API + LocalStorage + Undo/Redo Engine

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
