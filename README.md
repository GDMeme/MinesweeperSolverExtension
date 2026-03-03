# MinesweeperSolverExtension

A Chrome extension that analyzes a live Minesweeper board and highlights the best next move using an external constraint-based solver.

Press **`H`** while on a supported Minesweeper page to analyze the board and highlight the best safe move.

---

## 🧠 About the Solver

This extension integrates the solver from:

**JSMinesweeper**  
https://github.com/DavidNHill/JSMinesweeper  

I did **not** implement the solving algorithm.  
This project focuses on:

- Extracting board state from a live Minesweeper webpage
- Converting DOM state into a solver-compatible format
- Dynamically loading the solver module
- Running analysis
- Visually highlighting recommended moves

All solving logic belongs to the original JSMinesweeper project.

---

## 🚀 Features

- 🔎 Live board extraction from the DOM  
- 🧩 Converts webpage state into solver input format  
- 🧠 Runs external solver analysis  
- ✨ Highlights the best non-flag move  
- ⚡ Lazy-loads the solver for performance  
- 🎯 Supports standard and custom difficulty modes  

---

## ⚙️ How It Works

### 1️⃣ Keybind

Press:

```
H
```

This triggers board analysis.

---

### 2️⃣ Dynamic Solver Loading

The solver is loaded only once using dynamic ES module import:

```js
const moduleUrl = chrome.runtime.getURL("Minesweeper/client/main.js");
const solverModule = await import(moduleUrl);

startup = solverModule.startup;
dropHandler = solverModule.dropHandler;
doAnalysis = solverModule.doAnalysis;
```

This prevents unnecessary initialization and keeps the extension lightweight.

---

### 3️⃣ Board Extraction

The extension:

- Detects total mine count (difficulty/custom/PvP)
- Reads board width and height
- Converts each tile into:
  - `H` → Hidden  
  - `F` → Flagged  
  - `0–8` → Revealed number  

It builds a formatted string:

```
WIDTHxHEIGHTxMINES
<board data>
```

Example:

```
16x16x40
HHH2F000...
```

This string is passed directly to the solver.

---

### 4️⃣ Running the Solver

```js
await startup();
await dropHandler(boardData);
const result = await doAnalysis();
```

The extension selects the best non-flag action and highlights it visually.

If no deterministic move exists, it logs:

```
No moves found
```

---

### 5️⃣ Visual Highlighting

A CSS class is injected once:

```css
.solver-highlight {
    box-shadow: 0 0 14px 5px lime !important;
    z-index: 9999;
}
```

The recommended cell receives a green glow.

---

## 📂 Project Structure

```
MinesweeperSolverExtension/
│
├── content.js
├── manifest.json
└── Minesweeper/
    └── client/
        └── main.js   (JSMinesweeper solver)
```

- `content.js` → Handles DOM extraction, solver integration, highlighting
- `main.js` → External solver (from JSMinesweeper)

---

## 🛠 Installation

1. Clone the repository.
2. Open Chrome and navigate to:

```
chrome://extensions/
```

3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the project directory

---

## 🎯 Purpose of This Project

This project demonstrates:

- Chrome extension development
- DOM parsing and dynamic state extraction
- ES module dynamic imports
- Integration of third-party solving engines
- Clean separation between UI-layer and logic-layer
- Real-time board analysis tooling

---

## 🔮 Potential Improvements

- Probability heatmap overlay
- Auto-play mode
- Multi-site support
- Performance improvements for large boards
- UI toggle instead of keybind

---

## 📜 License & Attribution

The solver logic is from:

**JSMinesweeper**  
https://github.com/DavidNHill/JSMinesweeper  

Please refer to the original repository for its license and implementation details.

This extension project handles only integration and visualization.