let startup, dropHandler, doAnalysis;

// Load solver module dynamically (only once)
async function loadSolver() {
    if (startup) return; // already loaded

    const moduleUrl = chrome.runtime.getURL("Minesweeper/client/main.js");
    const solverModule = await import(moduleUrl);

    startup = solverModule.startup;
    dropHandler = solverModule.dropHandler;
    doAnalysis = solverModule.doAnalysis;

    console.log("Solver loaded");
}

// Listen for keypress
document.addEventListener("keydown", e => {
    if (e.key === "h") {
        analyzeBoard();
    }
});

async function analyzeBoard() {
    try {
        await loadSolver();

        const boardData = extractBoard();

        await startup();
        await dropHandler(boardData);
        const result = await doAnalysis();

        if (!result || result.length === 0) {
            console.log("No moves found");
            return;
        }

        const bestMove = result.find(e => e.action !== 2);
        highlightCell(bestMove.x, bestMove.y);

    } catch (err) {
        console.error("Solver error:", err);
    }
}

// Inject highlight style once
const style = document.createElement("style");
style.textContent = `
.solver-highlight {
    box-shadow: 0 0 14px 5px lime !important;
    z-index: 9999;
}
`;
document.head.appendChild(style);

function highlightCell(x, y) {
    const old = document.querySelector(".solver-highlight");
    if (old) old.classList.remove("solver-highlight");

    const cell = document.getElementById(`cell_${x}_${y}`);
    if (!cell) {
        console.warn("Cell not found:", x, y);
        return;
    }

    cell.classList.add("solver-highlight");
}

function extractBoard() {
    let data = "";
    const totalMines = document.getElementById("custom_mines")?.value || ((100 * parseInt(document.getElementById("top_area_mines_100").className.split("hdd_top-area-num")[1])) + (10 * parseInt(document.getElementById("top_area_mines_10").className.split("hdd_top-area-num")[1])) + parseInt(document.getElementById("top_area_mines_1").className.split("hdd_top-area-num")[1]));
    
    const allCellsHTML = document.getElementById("AreaBlock");
    if (!allCellsHTML) {
        console.warn("Board not found");
        return "";
    }

    let width;
    let height;
    let currentWidth = 0;
    let newWidth, newHeight;

    for (const cell of allCellsHTML.children) {
        if (cell.className === "clear") continue;

        const classArray = cell.className.split(" ");
        let tileStatus;

        if (classArray[2]?.split("_")[1] === "closed") {
            tileStatus = classArray[3]?.includes("flag") ? "F" : "H";
        } else {
            tileStatus = classArray[3]?.split("_")[1]?.slice(-1) ?? "0";
        }

        [newWidth, newHeight] = cell.id.slice(5).split("_").map(Number);

        if (newWidth === 0 && newHeight !== 0) {
            data += "\n";
            if (!width) width = currentWidth + 1;
        }

        currentWidth = newWidth;
        data += tileStatus;
    }

    height = newHeight + 1;

    return `${width}x${height}x${totalMines}\n` + data;
}
