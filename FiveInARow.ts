import EventEmitter from "./models/EventEmitter";
import Playground, {FieldValue} from "./models/Playground";
import {Behaviour, Bot} from "./bot";

const ACTIVE_CLASS: string = 'active-player';

declare type Dropdowns = 'difficultyDropdown' | 'modeDropdown' | 'colourDropdown';

enum Difficulty {
    EASY = "easy",
    MEDIUM = "medium",
}

enum Mode {
    SINGLEPLAYER = "singleplayer",
    MULTIPLAYER = "multiplayer",
}

enum Colour {
    COLOUR1 = "colour1",
    COLOUR2 = "colour2",
    COLOUR3 = "colour3"
}

export default class FiveInARow {
    private static readonly _eventEmitter: EventEmitter = new EventEmitter();
    private static readonly _botEasy: Bot = new Bot(FieldValue.CIRCLE, Behaviour.DEFENSIVE);
    private static readonly _botMedium: Bot = new Bot(FieldValue.CIRCLE, Behaviour.COMBINED);
    
    // Document object model variables (DOM variables)
    private readonly playground: HTMLElement = document.getElementById('playground');
    private readonly startButton: HTMLElement = document.getElementById('startButton');
    private readonly difficulty: HTMLElement = document.getElementById('difficulty');
    private readonly difficultyDropdown: HTMLElement = document.getElementById('difficultyDropdown');
    private readonly mode: HTMLElement = document.getElementById('mode');
    private readonly modeDropdown: HTMLElement = document.getElementById('modeDropdown');
    private readonly colour: HTMLElement = document.getElementById('colour');
    private readonly colourDropdown: HTMLElement = document.getElementById('colourDropdown');
    private readonly score1: HTMLElement = document.getElementById('score1');
    private readonly score2: HTMLElement = document.getElementById('score2');
    private readonly player1: HTMLElement = document.getElementById('player1');
    private readonly player2: HTMLElement = document.getElementById('player2');
    private readonly reset: HTMLElement = document.getElementById('reset');
    private readonly easy: HTMLElement = document.getElementById("easy");
    private readonly medium: HTMLElement = document.getElementById("medium");
    private readonly singleplayer: HTMLElement = document.getElementById("singleplayer");
    private readonly multiplayer: HTMLElement = document.getElementById("multiplayer");
    private readonly circle: HTMLElement = document.getElementById("circle");
    private readonly cross: HTMLElement = document.getElementById("cross");
    private readonly colour1: HTMLElement = document.getElementById("colour1");
    private readonly colour2: HTMLElement = document.getElementById("colour2");
    private readonly colour3: HTMLElement = document.getElementById("colour3");

    /**
     * List of opened dropdowns.
     */
    private readonly dropdownsOpened: string[] = [];
    /**
     * Playground class instance
     */
    private playgroundInstance: Playground;
    /**
     * Open timeout.
     */
    private openTimeout: number;
    private static selectedDifficulty: Difficulty = Difficulty.EASY;
    private static selectedMode: Mode = Mode.SINGLEPLAYER;

    constructor() {
        FiveInARow.eventEmitter.on('playgroundChange', (playground: HTMLDivElement) => this.handlePlaygroundChanged(playground));
        FiveInARow.eventEmitter.on('win', (player: FieldValue) => this.handleWin(player));
        FiveInARow.eventEmitter.on('switchPlayers', (player: FieldValue) => this.handleSwitchPlayer(player));

        this.playgroundInstance = new Playground();
        this.playground.append(this.startButton);
    }

    static get eventEmitter(): EventEmitter {
        return this._eventEmitter;
    }
    static get bot(): Bot {
        switch(this.selectedDifficulty) {
            case Difficulty.EASY:
                return this._botEasy;
            case Difficulty.MEDIUM:
                return this._botMedium;
        }
    }

    static get mode(): Mode {
        return this.selectedMode;
    }

    public static main(): void {
        const fiveInARow = new FiveInARow();

        // Button clicks.
        fiveInARow.startButton.addEventListener('click', (e: PointerEvent) => fiveInARow.handleStartButtonClick(e));
        fiveInARow.difficulty.addEventListener('click', (e: PointerEvent) => fiveInARow.handleDifficultyButtonClick(e));
        fiveInARow.mode.addEventListener('click', (e: PointerEvent) => fiveInARow.handleModeButtonClick(e));
        fiveInARow.colour.addEventListener('click', (e: PointerEvent) => fiveInARow.handleColourButtonClick(e));
        fiveInARow.reset.addEventListener('click', (e: PointerEvent) => fiveInARow.handleResetButtonClick(e));
        fiveInARow.easy.addEventListener("click", (e: PointerEvent) => fiveInARow.handleDifficultyChange(Difficulty.EASY));
        fiveInARow.medium.addEventListener("click", (e: PointerEvent) => fiveInARow.handleDifficultyChange(Difficulty.MEDIUM));
        fiveInARow.singleplayer.addEventListener("click", (e: PointerEvent) => fiveInARow.handleModeChange(Mode.SINGLEPLAYER));
        fiveInARow.multiplayer.addEventListener("click", (e: PointerEvent) => fiveInARow.handleModeChange(Mode.MULTIPLAYER));
        fiveInARow.colour1.addEventListener("click", (e: PointerEvent) => fiveInARow.handleColourChange(Colour.COLOUR1));
        fiveInARow.colour2.addEventListener("click", (e: PointerEvent) => fiveInARow.handleColourChange(Colour.COLOUR2));
        fiveInARow.colour3.addEventListener("click", (e: PointerEvent) => fiveInARow.handleColourChange(Colour.COLOUR3));


        // Global click
        document.addEventListener('click', (e: PointerEvent) => fiveInARow.handleGlobalClick(e));
    }

    /**
     * Handles playground change.
     * @param playground New playground HTML.
     */
    private handlePlaygroundChanged(playground: HTMLDivElement): void {
        this.playground.innerHTML = '';

        const length = playground.children.length;
        for (let i = 0; i < length; i++) {
            this.playground.append(playground.children[0]);
        }
    }

    /**
     * Handles actions when someone has won.
     * @param player Player who won.
     */
    private handleWin(player: FieldValue): void {
        if (player === FieldValue.CIRCLE) {
            const score: number = parseInt(this.score1.innerText);
            this.score1.innerText = (score + 1).toString();
        } else {
            const score: number = parseInt(this.score2.innerText);
            this.score2.innerText = (score + 1).toString();
        }

        const winButton = this.createWinButton(player);
        this.playground.append(winButton);
        this.playgroundInstance.running = false;

        winButton.click();
    }

    /**
     * Switches players.
     * @param player Player who is playing.
     */
    private handleSwitchPlayer(player: FieldValue): void {
        if (player === FieldValue.CROSS) {
            this.player2.classList.remove(ACTIVE_CLASS);
            this.player1.classList.add(ACTIVE_CLASS);
        } else {
            this.player1.classList.remove(ACTIVE_CLASS);
            this.player2.classList.add(ACTIVE_CLASS);
        }
    }

    /**
     * Handles start button click.
     * @param event Click event.
     */
    private handleStartButtonClick(event: PointerEvent): void  {
        this.playground.removeChild(this.startButton);
        this.playgroundInstance.running = true;
    }

    /**
     * Handles difficulty button click.
     * @param event Click event.
     */
    private handleDifficultyButtonClick(event: PointerEvent): void {
        this.openDropdown(event.target as HTMLElement, 'difficultyDropdown');
    }

    /**
     * Handles mode button click.
     * @param event Click event.
     */
    private handleModeButtonClick(event: PointerEvent): void {
        this.openDropdown(event.target as HTMLElement, 'modeDropdown');
    }

    /**
     * Handles colour button click.
     * @param event Click event.
     */
    private handleColourButtonClick(event: PointerEvent): void {
        this.openDropdown(event.target as HTMLElement, 'colourDropdown');
    }

    /**
     * Handles reset button click.
     * @param event Click event.
     */
    private handleResetButtonClick(event: PointerEvent): void {
        this.playgroundInstance = new Playground();

        this.player2.classList.remove(ACTIVE_CLASS);
        this.player1.classList.add(ACTIVE_CLASS);

        this.score1.innerText = (0).toString();
        this.score2.innerText = (0).toString();

        this.playgroundInstance.running = true;
    }

    private handleDifficultyChange(difficulty: Difficulty): void {
        FiveInARow.selectedDifficulty = difficulty;
    }

    private handleModeChange(mode: Mode): void {
        FiveInARow.selectedMode = mode;
    }

    /**
     * Handles Colour change.
     * @param colour New Colour.
     */
    private handleColourChange(colour: Colour): void {
        switch (colour) {
            case Colour.COLOUR1:
                this.circle.style.fill = "tomato";
                this.cross.style.fill = "#222222";
                break;
            case Colour.COLOUR2:
                this.circle.style.fill = "purple";
                this.cross.style.fill = "pink";
                break;
            case Colour.COLOUR3:
                this.circle.style.fill = "green";
                this.cross.style.fill = "blue";
                break;
        }

        this.playgroundInstance.regenerate();
    }

    /**
     * Handles global click.
     * @param event Click event.
     * @private
     */
    private handleGlobalClick(event: PointerEvent): void {
        for (const id of this.dropdownsOpened) {
            const dropdown = document.getElementById(id);

            dropdown.style.display = 'none';
            this.dropdownsOpened.splice(this.dropdownsOpened.indexOf(id));
            clearTimeout(this.openTimeout);
        }
    }

    /**
     * Creates win button.
     * @param player Player who won.
     */
    private createWinButton(player: FieldValue): HTMLDivElement {
        const winButton: HTMLDivElement = document.createElement('div');
        winButton.classList.add('win-button');
        winButton.innerText = 'Vyhrál hráč ' + player;
        winButton.addEventListener('click', () => {
           this.playgroundInstance.reset();
        });
        return winButton;
    }

    /**
     * Opens specified dropdown.
     *
     * @param target Event target.
     * @param dropdown Dropdown to be opened.
     * @private
     */
    private openDropdown(target: HTMLElement, dropdown: Dropdowns): void {
        this.openTimeout = window.setTimeout(() => {
            if (this.dropdownsOpened.some((id: string) => this[dropdown].id === id) && target.classList.contains('dropdown-item')) {
                this[dropdown].style.display = 'none';
                this.dropdownsOpened.splice(this.dropdownsOpened.indexOf(this[dropdown].id));
            } else {
                this[dropdown].style.display = 'block';
                this.dropdownsOpened.push(this[dropdown].id);
            }
        });
    }
}
