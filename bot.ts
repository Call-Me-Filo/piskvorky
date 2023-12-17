import {FieldValue, Position} from "./models/Playground";
import MathUtils from "./utils/MathUtils";

declare type Character = FieldValue.CIRCLE | FieldValue.CROSS;

export enum Behaviour {
    OFFENSIVE = 'offensive',
    DEFENSIVE = 'defensive',
    COMBINED = 'combined'
}

//0.05
export class Bot {
    /**
     * Bot's character
     */
    private readonly CHARACTER: Character;
    /**
     * Enemy's character
     */
    private readonly ENEMY_CHARACTER: Character;
    /**
     * Bot's behaviour
     */
    private readonly BEHAVIOUR: Behaviour;
    /**
     * Risk / Reward increase value
     */
    private readonly INCREASE = 0.05;

    constructor(character: Character, behaviour: Behaviour) {
        this.CHARACTER = character;
        this.ENEMY_CHARACTER = character === FieldValue.CIRCLE ? FieldValue.CROSS : FieldValue.CIRCLE;
        this.BEHAVIOUR = behaviour;

        console.log(behaviour, character);
    }

    run(board: FieldValue[][]): Position {
        // Calculates risks if bot has defensive or combined behaviour.
        let highestRisks: Position[] = [];
        let highestRisk: number = -1;
        if (this.BEHAVIOUR === Behaviour.DEFENSIVE || this.BEHAVIOUR === Behaviour.COMBINED) {
            const risks = this.getValues(board, this.ENEMY_CHARACTER);
            for (let x = 0; x < risks.length; x++) {
                for (let y = 0; y < risks[0].length; y++) {
                    const risk = risks[x][y];

                    if (risk > highestRisk) {
                        highestRisks = [];
                        highestRisks.push({ x, y});
                        highestRisk = risk;
                    } else if (risk === highestRisk) {
                        highestRisks.push({ x, y });
                    }
                }
            }
        }

        // Calculates rewards if bot has combined behaviour.
        let highestRewards: Position[] = [];
        let highestReward: number = -1;
        if (this.BEHAVIOUR === Behaviour.OFFENSIVE || this.BEHAVIOUR === Behaviour.COMBINED) {
            const rewards = this.getValues(board, this.CHARACTER, true);
            for (let x = 0; x < rewards.length; x++) {
                for (let y = 0; y < rewards[0].length; y++) {
                    const reward = rewards[x][y];

                    if (reward > highestReward) {
                        highestRewards = [];
                        highestRewards.push({ x, y});
                        highestReward = reward;
                    } else if (reward === highestReward) {
                        highestRewards.push({ x, y });
                    }
                }
            }
        }

        if (highestRisk >= highestReward) {
            const random = MathUtils.getRandomInt(0, highestRisks.length - 1);
            return highestRisks[random];
        } else if (highestRisk < highestReward) {
            const random = MathUtils.getRandomInt(0, highestRewards.length - 1);
            return highestRewards[random];
        }
    }

    private getValues(board: FieldValue[][], character: Character, noSurroundings: boolean = false): number[][] {
        const risks: number[][] = [];
        for (let x = 0; x < board.length; x++) {
            const riskRow: number[] = [];
            for (let y = 0; y < board[0].length; y++) {
                if (board[x][y] === FieldValue.CROSS || board[x][y] === FieldValue.CIRCLE
                    || (!this.hasEnemyNeighbours(board, { x, y }) && !noSurroundings)) {
                    riskRow.push(0);
                    continue;
                }

                let risk = 0;
                risk += this.getTopRisk(board, character, { x, y });
                risk += this.getTopRightRisk(board, character, { x, y });
                risk += this.getRightRisk(board, character, { x, y });
                risk += this.getBotRightRisk(board, character, { x, y });
                risk += this.getBotRisk(board, character, { x, y });
                risk += this.getBotLeftRisk(board, character, { x, y });
                risk += this.getLeftRisk(board, character, { x, y });
                risk += this.getTopLeftRisk(board, character, { x, y });

                riskRow.push(risk);
            }
            risks.push(riskRow);
        }

        return risks;
    }

    private hasEnemyNeighbours(board: FieldValue[][], position: Position): boolean {
        const { x, y } = position;

        if (board[x] && board[x][y - 1] && (board[x][y - 1] === this.ENEMY_CHARACTER)) return true;
        if (board[x + 1] && board[x + 1] &&  board[x + 1][y - 1] && (board[x + 1][y - 1] === this.ENEMY_CHARACTER)) return true;
        if (board[x + 1] && board[x + 1] && board[x + 1][y] && (board[x + 1][y] === this.ENEMY_CHARACTER)) return true;
        if (board[x + 1] && board[x + 1] && board[x + 1][y + 1] && (board[x + 1][y + 1] === this.ENEMY_CHARACTER)) return true;
        if (board[x] && board[x][y + 1] && (board[x][y + 1] === this.ENEMY_CHARACTER)) return true;
        if (board[x - 1] && board[x - 1] && board[x - 1][y - 1] && (board[x - 1][y - 1] === this.ENEMY_CHARACTER))return true;
        if (board[x - 1] && board[x - 1][y] && (board[x - 1][y] === this.ENEMY_CHARACTER)) return true;
        if (board[x - 1] && board[x - 1][y + 1] && (board[x - 1][y + 1] === this.ENEMY_CHARACTER)) return true;
    }

    private getTopRisk(board: FieldValue[][], character: Character, position: Position): number {
        const { x, y } = position;

        let risk: number = 0;
        if (board[x] && board[x][y - 1] && board[x][y - 1] === character) {
            risk += this.INCREASE;
            if (board[x] && board[x][y - 2] && board[x][y - 2] === character) {
                risk += this.INCREASE * 2;
                if (board[x] && board[x][y - 3] && board[x][y - 3] === character) {
                    risk += this.INCREASE * 3;
                    if (board[x] && board[x][y - 4] && board[x][y - 4] === character) risk += this.INCREASE * 4;
                }
            }
        }

        return risk;
    }

    private getTopRightRisk(board: FieldValue[][], character: Character, position: Position): number {
        const { x, y } = position;

        let risk: number = 0;
        if (board[x + 1] && board[x + 1][y - 1] && board[x + 1][y - 1] === character) {
            risk += this.INCREASE;
            if (board[x + 2] && board[x + 2][y - 2] && board[x + 2][y - 2] === character) {
                risk += this.INCREASE * 2;
                if (board[x + 3] && board[x + 3][y - 3] && board[x + 3][y - 3] === character) {
                    risk += this.INCREASE * 3;
                    if (board[x + 4] && board[x + 4][y - 4] && board[x + 4][y - 4] === character) risk += this.INCREASE * 4;
                }
            }
        }

        return risk;
    }

    private getRightRisk(board: FieldValue[][], character: Character, position: Position): number {
        const { x, y } = position;

        let risk: number = 0;
        if (board[x + 1] && board[x + 1][y] && board[x + 1][y] === character) {
            risk += this.INCREASE;
            if (board[x + 2] && board[x + 2][y] && board[x + 2][y] === character) {
                risk += this.INCREASE * 2;
                if (board[x + 3] && board[x + 3][y] && board[x + 3][y] === character) {
                    risk += this.INCREASE * 3;
                    if (board[x + 4] && board[x + 4][y] && board[x + 4][y] === character) risk += this.INCREASE * 4;
                }
            }
        }

        return risk;
    }

    private getBotRightRisk(board: FieldValue[][], character: Character, position: Position): number {
        const { x, y } = position;

        let risk: number = 0;
        if (board[x + 1] && board[x + 1][y + 1] && board[x + 1][y + 1] === character) {
            risk += this.INCREASE;
            if (board[x + 2] && board[x + 2][y + 2] && board[x + 2][y + 2] === character) {
                risk += this.INCREASE * 2;
                if (board[x + 3] && board[x + 3][y + 3] && board[x + 3][y + 3] === character) {
                    risk += this.INCREASE * 3;
                    if (board[x + 4] && board[x + 4][y + 4] && board[x + 4][y + 4] === character) risk += this.INCREASE * 4;
                }
            }
        }

        return risk;
    }

    private getBotRisk(board: FieldValue[][], character: Character, position: Position): number {
        const { x, y } = position;

        let risk: number = 0;
        if (board[x] && board[x][y + 1] && board[x][y + 1] === character) {
            risk += this.INCREASE;
            if (board[x] && board[x][y + 2] && board[x][y + 2] === character) {
                risk += this.INCREASE * 2;
                if (board[x] && board[x][y + 3] && board[x][y + 3] === character) {
                    risk += this.INCREASE * 3;
                    if (board[x] && board[x][y + 4] && board[x][y + 4] === character) risk += this.INCREASE * 4;
                }
            }
        }

        return risk;
    }

    private getBotLeftRisk(board: FieldValue[][], character: Character, position: Position): number {
        const { x, y } = position;

        let risk: number = 0;
        if (board[x - 1] && board[x - 1][y - 1] && board[x - 1][y - 1] === character) {
            risk += this.INCREASE;
            if (board[x - 2] && board[x - 2][y - 2] && board[x - 2][y - 2] === character) {
                risk += this.INCREASE * 2;
                if (board[x - 3] && board[x - 3][y - 3] && board[x - 3][y - 3] === character) {
                    risk += this.INCREASE * 3;
                    if (board[x - 4] && board[x - 4][y - 4] && board[x - 4][y - 4] === character) risk += this.INCREASE * 4;
                }
            }
        }

        return risk;
    }

    private getLeftRisk(board: FieldValue[][], character: Character, position: Position): number {
        const { x, y } = position;

        let risk: number = 0;
        if (board[x - 1] && board[x - 1][y] && board[x - 1][y] === character) {
            risk += this.INCREASE;
            if (board[x - 2] && board[x - 2][y] && board[x - 2][y] === character) {
                risk += this.INCREASE * 2;
                if (board[x - 3] && board[x - 3][y] && board[x - 3][y] === character) {
                    risk += this.INCREASE * 3;
                    if (board[x - 4] && board[x - 4][y] && board[x - 4][y] === character) risk += this.INCREASE * 4;
                }
            }
        }

        return risk;
    }

    private getTopLeftRisk(board: FieldValue[][], character: Character, position: Position): number {
        const { x, y } = position;

        let risk: number = 0;
        if (board[x - 1] && board[x - 1][y + 1] && board[x - 1][y + 1] === character) {
            risk += this.INCREASE;
            if (board[x - 2] && board[x - 2][y + 2] && board[x - 2][y + 2] === character) {
                risk += this.INCREASE * 2;
                if (board[x - 3] && board[x - 3][y + 3] && board[x - 3][y + 3] === character) {
                    risk += this.INCREASE * 3;
                    if (board[x - 4] && board[x - 4][y + 4] && board[x - 4][y + 4] === character) risk += this.INCREASE * 4;
                }
            }
        }

        return risk;
    }
}
