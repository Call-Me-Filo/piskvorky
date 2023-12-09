// Document object model variables (DOM variables)
const Playground = document.getElementById("playground");
const StartButton = document.getElementById("startButton");
const Difficulty = document.getElementById("difficulty");
const Mode = document.getElementById("mode");
const DifficultyDropdown = document.getElementById("difficultyDropdown");
const ModeDropdown = document.getElementById("modeDropdown");
const Score1 = document.getElementById("score1");
const Score2 = document.getElementById("score2");
const Player1 = document.getElementById("player1");
const Player2 = document.getElementById("player2");
const Reset = document.getElementById("reset");

// Other variables
const dropdownsOpened = []; // Currently, opened dropdowns

const rows = 18; // Number of rows
const columns = 18; // Number of columns
const board = []; // 2-dimensional array representing the board
const winAmount = 5; // How many same objects in a row to win
let isRunning=false; // Flag if game is running
let counter = 1; // Number of move

clearPlayground();
generatePlayground();

/**
 * Generates cleared board 2-dimensional array.
 */
function clearPlayground() {
    for(let i = 0; i < rows; i++) {
        const row = []
        for(let j = 0; j < columns; j++) {
            row[j] = 0
        }
        board[i] = row
    }
}

/**
 * Generates playground visually on page.
 */
function generatePlayground() {
    for(let i = 0; i < rows; i++) {
        const Row = document.createElement("div");
        Row.classList.add("row");
        Playground.append(Row);
        for(let j = 0; j < columns; j++) {
            const Field = document.createElement("div");
            Field.classList.add("field");
            Field.setAttribute("id",i+"x"+j);
            if (board[i][j] === 1) {
                Field.classList.add("circle");
            } else if (board[i][j] === 2) {
                Field.classList.add("cross");
            }
            Field.addEventListener("click",handleClick);
            Row.append(Field);
        }
    }
}

/**
 * Determines which player is on move.
 *
 * @returns {string} Circle | Cross
 */
function nextPlayer() {
    return counter%2 ? "circle" : "cross"
}

/**
 * Handles a click to a field.
 * @param event
 */
function handleClick(event) {
    if (!isRunning) {
        return;
    }

    const split = event.target.getAttribute("id").split("x"); // Current field (fe. 3x8)
    const row = parseInt(split[0]); // From split array x coordinate
    const column = parseInt(split[1]); // From split array y coordinate

    if(board[row][column] !== 0) { // If field is occupied return the function.
        return;
    }

    const nextObject = nextPlayer() ==="circle" ? 1 : 2;
    board[row][column] = nextObject;
    Playground.innerHTML = "";
    generatePlayground();

    const win = checkForWin();
    if(win) {
        if(nextObject === 1) {
            const score = parseInt(Score1.innerText);
            Score1.innerText = "" + (score + 1);
        } else {
            const score = parseInt(Score2.innerText);
            Score2.innerText = "" + (score + 1);
        }

        const WinButton = document.createElement("div");
        WinButton.classList.add("win-button");
        WinButton.innerText = "Vyhrál hráč " + nextObject;
        WinButton.addEventListener("click", function () {
            isRunning = true;
            clearPlayground();

            Playground.innerHTML = '';
            generatePlayground();
            switchActivePlayer(nextObject);
        });

        Playground.append(WinButton);
        isRunning = false;
    } else {
        switchActivePlayer(nextObject);
    }
    counter++;
}

/**
 * Switch active player classes.
 * @param nextObject Next player
 */
function switchActivePlayer(nextObject) {
    if (nextObject === 2) {
        Player2.classList.remove("active-player");
        Player1.classList.add("active-player");
    } else {
        Player1.classList.remove("active-player");
        Player2.classList.add("active-player");
    }
}

/**
 * Checks if some player has won.
 * @returns `true` if someone won.
 */
 function checkForWin() {
    // Check rows
    for (let i = 0; i < rows; i++) {
        let object = 0; // 1 - cross; 2 - circle
        let inARow = 0; // How many of them in a row

        for (let j = 0; j < columns; j++) {
            if (board[i][j] === 1) {
                if (object !== 1) inARow = 0;
                object = 1;
                inARow++;
            } else if (board[i][j] === 2) {
                if (object !== 2) inARow = 0;
                object = 2;
                inARow++;
            }

            if (inARow === winAmount) {
                return true;
            }
        }
    }

    // Check columns
    for (let i = 0; i < rows; i++) {
        let object = 0; // 1 - cross; 2 - circle
        let inARow = 0; // How many of them in a row

        for (let j = 0; j < columns; j++) {
            if (board[j][i] === 1) {
                if (object !== 1) inARow = 0;
                object = 1;
                inARow++;
            } else if (board[j][i] === 2) {
                if (object !== 2) inARow = 0;
                object = 2;
                inARow++;
            }

            if (inARow === winAmount) {
                return true;
            }
        }
    }

    // Check diagonals xy
    for (let i = 0; i < rows+columns - 1; i++) {
        let object = 0; // 1 - cross; 2 - circle
        let inARow = 0; // How many of them in a row

        let row = i < rows ? 0 : i - rows + 1;
        let col = i < columns ? i : columns - 1;

        for (let j = 0; (i < rows && j < i + 1) || (i >= rows && j < 2*rows - i - 1); j++) {

            if (board[row][col] === 1) {
                if (object !== 1) inARow = 0;
                object = 1;
                inARow++;
            } else if (board[row][col] === 2) {
                if (object !== 2) inARow = 0;
                object = 2;
                inARow++;
            }

            if (inARow === winAmount) {
                return true;
            }

            row++;
            col--;
        }
    }

    // Check diagonals yx
    for (let i = 0; i < rows+columns - 1; i++) {
        let object = 0; // 1 - cross; 2 - circle
        let inARow = 0; // How many of them in a row

        let row = i < rows ? 17 : 2* rows - i - 2;
        let col = i < columns ? i : columns - 1;

        for (let j = 0; (i < rows && j < i + 1) || (i >= rows && j < 2*rows - i - 1); j++) {
            if (board[row][col] === 1) {
                if (object !== 1) inARow = 0;
                object = 1;
                inARow++;
            } else if (board[row][col] === 2) {
                if (object !== 2) inARow = 0;
                object = 2;
                inARow++;
            }

            if (inARow === winAmount) {
                return true;
            }

            row--;
            col--;
        }


    }
}

// Start button click
StartButton.addEventListener("click", function(event) {
    Playground.removeChild(StartButton)
    isRunning=true
});

let openTimeout;

// Difficulty button click
Difficulty.addEventListener("click", function(event) {
    openTimeout = setTimeout(() => {
        if(dropdownsOpened.includes(DifficultyDropdown) && !event.target.classList.contains("dropdown-item")) {
            DifficultyDropdown.style.display = "none";
            dropdownsOpened.splice(dropdownsOpened.indexOf(DifficultyDropdown));
        } else {
            DifficultyDropdown.style.display = "block";
            dropdownsOpened.push(DifficultyDropdown);
        }
    });
});

// Mode button click
Mode.addEventListener("click", function(event) {
    openTimeout = setTimeout(() => {
        if(dropdownsOpened.includes(ModeDropdown) && !event.target.classList.contains("dropdown-item")) {
            ModeDropdown.style.display = "none";
            dropdownsOpened.splice(dropdownsOpened.indexOf(ModeDropdown));
        } else {
            ModeDropdown.style.display = "block";
            dropdownsOpened.push(ModeDropdown);
        }
    });
});

/*
colour.addEventListener("click", function(event)  {

});
*/

// Reset click
Reset.addEventListener("click", function (event) {
    counter = 1;
    isRunning = true;
    clearPlayground();
    Playground.innerHTML = '';
    generatePlayground();

    Player2.classList.remove("active-player");
    Player1.classList.add("active-player");

    Score1.innerText = 0 + "";
    Score2.innerText = 0 + "";
});

// Global click
document.addEventListener("click", function(event) {
    if(dropdownsOpened.includes(DifficultyDropdown) && !event.target.classList.contains("dropdown-item")) {
        DifficultyDropdown.style.display = "none";
        dropdownsOpened.splice(dropdownsOpened.indexOf(DifficultyDropdown));
        clearTimeout(openTimeout);
    }
    if(dropdownsOpened.includes(ModeDropdown) && !event.target.classList.contains("dropdown-item")) {
        ModeDropdown.style.display = "none";
        dropdownsOpened.splice(dropdownsOpened.indexOf(ModeDropdown));
        clearTimeout(openTimeout);
    }
})
