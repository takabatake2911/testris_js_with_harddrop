const $root = document.getElementById("root");
class Game {
    FIELD_HEIGHT = 21;
    FIELD_WIDTH = 12;

    MINO_HEIGHT = 4;
    MINO_WIDTH = 4;
    DEFAULT_MINO_POSITION = {
        X: 4,
        Y: 4,
    };

    STATE = {
        EMPTY: -1,
        FILLED: 0,
    };
    constructor() {
        this.intervalID = null;
        this.mino = MINO.S;
        this.mino_type = "S";
        this.mino_hold = null;
        this.rot_state = 0;
        this.mino_x = this.DEFAULT_MINO_POSITION.X;
        this.mino_y = this.DEFAULT_MINO_POSITION.Y;
        this.field_doms = new Array(this.FIELD_HEIGHT);
        this.field_states = new Array(this.FIELD_HEIGHT);
    }
    main() {
        this.initAll();
        this.drawAll();
    }
    initAll() {
        this.initField();
        this.connectEvents();
        this.startAutoDown();
    }
    initField() {
        this.initEmptyField();
        this.initFieldStates();
    }
    drawAll() {
        this.drawMino();
        this.drawField();
    }
    moveRight() {
        ++this.mino_x;
        if (this.hitCheck()) {
            --this.mino_x;
        }
        this.drawAll();
    }
    moveLeft() {
        --this.mino_x;
        if (this.hitCheck()) {
            ++this.mino_x;
        }
        this.drawAll();
    }
    moveDown() {
        ++this.mino_y;
        if (this.hitCheck()) {
            --this.mino_y;
            this.setMinoToField();
            this.clearFilledLine();
            this.respawnMino();
            return;
        }
        this.drawAll();
    }
    startAutoDown() {
        if (this.intervalID !== null) {
            clearInterval(this.intervalID);
        }
        this.intervalID = setInterval(() => {
            this.moveDown();
        }, 1000);
    }
    respawnMino() {
        this.resetMinoPosition();
        this.changeMinoType();
        this.drawAll();
        if (this.hitCheck()) {
            this.gameOver();
        }
    }
    gameOver() {
        alert("GAME OVER");
        this.initFieldStates();
    }
    rotateMino() {
        this.rot_state = (this.rot_state + 1) % 4;
        if (this.hitCheck()) {
            this.rot_state = (this.rot_state + 3) % 4;
        }
        this.drawAll();
    }
    connectEvents() {
        addEventListener("keydown", (e) => {
            switch (e.key) {
                case "ArrowUp":
                case "w":
                    this.rotateMino();
                    break;
                case "ArrowDown":
                case "s":
                    this.moveDown();
                    break;
                case "ArrowLeft":
                case "a":
                    this.moveLeft();
                    break;
                case "ArrowRight":
                case "d":
                    this.moveRight();
                    break;
                case " ":
                    this.hardDrop();
                    break;
                case "f":
                    this.holdMino();
                    break;
                default:
                    break;
            }
        });
    }

    initEmptyField() {
        for (let yi = 0; yi < this.FIELD_HEIGHT; yi++) {
            this.field_doms[yi] = new Array(this.FIELD_WIDTH);
            const $row = document.createElement("div");
            $row.classList.add("row");
            for (let xi = 0; xi < this.FIELD_WIDTH; xi++) {
                const $cell = document.createElement("div");
                $cell.classList.add("cell");
                this.field_doms[yi][xi] = $cell;
                $row.appendChild($cell);
            }
            $root.appendChild($row);
        }
    }
    initFieldStates() {
        for (let yi = 0; yi < this.FIELD_HEIGHT; yi++) {
            if (this.field_states[yi] === undefined) {
                this.field_states[yi] = new Array(this.FIELD_WIDTH);
            }
            for (let xi = 0; xi < this.FIELD_WIDTH; xi++) {
                this.field_states[yi][xi] = this.STATE.EMPTY;
            }
        }
        this.initFieldWallStates();
    }
    initFieldWallStates() {
        for (let yi = 0; yi < this.FIELD_HEIGHT; yi++) {
            this.field_states[yi][0] = this.STATE.FILLED;
            this.field_states[yi][this.FIELD_WIDTH - 1] = this.STATE.FILLED;
        }
        for (let xi = 0; xi < this.FIELD_WIDTH; xi++) {
            this.field_states[this.FIELD_HEIGHT - 1][xi] = this.STATE.FILLED;
        }
    }

    drawField() {
        for (let yi = 0; yi < this.FIELD_HEIGHT; yi++) {
            for (let xi = 0; xi < this.FIELD_WIDTH; xi++) {
                this.field_doms[yi][xi].classList.remove("filled");
                if (this.field_states[yi][xi] === this.STATE.FILLED) {
                    this.field_doms[yi][xi].classList.add("filled");
                }
            }
        }
    }
    drawMino() {
        this.clearFieldMino();
        for (let yi = 0; yi < this.MINO_HEIGHT; yi++) {
            for (let xi = 0; xi < this.MINO_WIDTH; xi++) {
                if (this.mino[this.rot_state][yi][xi] === 0) {
                    continue;
                }
                const y = yi + this.mino_y;
                const x = xi + this.mino_x;
                this.field_doms[y][x].classList.add("mino");
                this.field_doms[y][x].classList.add(`mino-${this.mino_type}`);
            }
        }
    }
    clearFieldMino() {
        for (let yi = 0; yi < this.FIELD_HEIGHT; yi++) {
            for (let xi = 0; xi < this.FIELD_WIDTH; xi++) {
                for (let t of MINO_TYPES) {
                    this.field_doms[yi][xi].classList.remove(`mino-${t}`);
                }
                this.field_doms[yi][xi].classList.remove("mino");
            }
        }
    }
    hitCheck() {
        for (let yi = 0; yi < this.MINO_HEIGHT; yi++) {
            for (let xi = 0; xi < this.MINO_WIDTH; xi++) {
                if (this.mino[this.rot_state][yi][xi] === 0) {
                    continue;
                }
                const y = yi + this.mino_y;
                const x = xi + this.mino_x;

                if (this.field_states[y][x] === this.STATE.FILLED) {
                    return true;
                }
            }
        }
        return false;
    }
    setMinoToField() {
        for (let yi = 0; yi < this.MINO_HEIGHT; yi++) {
            for (let xi = 0; xi < this.MINO_WIDTH; xi++) {
                if (this.mino[this.rot_state][yi][xi] === 0) {
                    continue;
                }
                const y = yi + this.mino_y;
                const x = xi + this.mino_x;

                this.field_states[y][x] = this.STATE.FILLED;
            }
        }
    }
    resetMinoPosition() {
        this.mino_x = this.DEFAULT_MINO_POSITION.X;
        this.mino_y = this.DEFAULT_MINO_POSITION.Y;
    }
    changeMinoType() {
        const _idx = Math.floor(Math.random() * MINO_TYPES_LENGTH);
        this.mino_type = MINO_TYPES[_idx];
        const _next_mino = MINO[this.mino_type];
        this.mino = _next_mino;
    }
    clearFilledLine() {
        for (let yi = 0; yi < this.FIELD_HEIGHT - 1; yi++) {
            let is_filled = true;
            for (let xi = 0; xi < this.FIELD_WIDTH; xi++) {
                if (this.field_states[yi][xi] == this.STATE.EMPTY) {
                    is_filled = false;
                }
            }
            if (is_filled) {
                this.removeSingleLine(yi);
            }
        }
    }
    removeSingleLine(n) {
        for (let yi = n; yi > 0; yi--) {
            for (let xi = 0; xi < this.FIELD_WIDTH; xi++) {
                this.field_states[yi][xi] = this.field_states[yi - 1][xi];
            }
        }
    }
    hardDrop() {
        while (!this.hitCheck()) {
            ++this.mino_y;
        }
        --this.mino_y;
        this.setMinoToField();
        this.clearFilledLine();
        this.respawnMino();
    }
    holdMino() {
        if (this.mino_hold === null) {
            this.mino_hold = this.mino;
            return;
        }
        this.swapHoldedMino();
        this.drawAll();
    }
    swapHoldedMino() {
        [this.mino_hold, this.mino] = [this.mino, this.mino_hold];
        // 交換した結果ぶつかるなら交換しない
        if (this.hitCheck()) {
            [this.mino_hold, this.mino] = [this.mino, this.mino_hold];
        }
    }
}

const MINO = {
    S: [
        // 0deg
        [
            [0, 0, 0, 0],
            [0, 1, 1, 0],
            [1, 1, 0, 0],
            [0, 0, 0, 0],
        ],
        // 90deg
        [
            [0, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
        ],
        // 180deg
        [
            [0, 0, 0, 0],
            [0, 0, 1, 1],
            [0, 1, 1, 0],
            [0, 0, 0, 0],
        ],
        // 270deg
        [
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 0],
        ],
    ],
    T: [
        // 0deg
        [
            [0, 1, 0, 0],
            [1, 1, 1, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        // 90deg
        [
            [0, 1, 0, 0],
            [1, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
        // 180deg
        [
            [0, 0, 0, 0],
            [1, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
        // 270deg
        [
            [0, 1, 0, 0],
            [0, 1, 1, 0],
            [0, 1, 0, 0],
            [0, 0, 0, 0],
        ],
    ],
    I: [
        // 0deg
        [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ],
        // 90deg
        [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
        ],
        // 180deg
        [
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
            [0, 0, 1, 0],
        ],
        // 270deg
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
    ],
};
const MINO_TYPES = Object.keys(MINO);
const MINO_TYPES_LENGTH = MINO_TYPES.length;
const game = new Game();
game.main();
