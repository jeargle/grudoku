let score = 0;
let currentLevel = 19;


function trueModulo(x, y) {
  return ((x % y) + y) % y;
}

class BootScene extends Phaser.Scene {
    constructor() {
        super('boot');
    }

    init(config) {
        console.log('[BOOT] init', config);
    }

    preload() {
        console.log('[BOOT] preload');
    }

    create() {
        game.scene.start('load');
        game.scene.remove('boot');
    }

    update() {
        console.log('[BOOT] update');
    }
}

class LoadScene extends Phaser.Scene {
    constructor() {
        super('load');
    }

    init(config) {
        console.log('[LOAD] init', config);
    }

    preload() {
        this.add.text(80, 160, 'loading...',
                      {font: '30px Courier',
                       fill: '#ffffff'});

        // Load levels
        this.load.json('levels', 'assets/levels.json');

        // Load images

        // Load sound effects
    }

    create() {
        game.scene.start('title');
        game.scene.remove('load');
    }

    update() {
        console.log('[LOAD] update');
    }
}

class TitleScene extends Phaser.Scene {
    constructor() {
        super('title');
    }

    init(config) {
        console.log('[TITLE] init', config);
    }

    preload() {
        console.log('[TITLE] preload');
    }

    create() {
        this.add.text(80, 160, 'GRUDOKU',
                      {font: '50px Courier',
                       fill: '#ffffff'});
        this.add.text(80, 240, 'press "W" to start',
                      {font: '30px Courier',
                       fill: '#ffffff'});

        this.input.keyboard.on('keydown-W', this.start, this);
    }

    update() {
        console.log('[TITLE] update');
    }

    start() {
        console.log('[TITLE] start');
        game.scene.switch('title', 'play');
    }
}

class PlayScene extends Phaser.Scene {

    level = null;
    table = null;
    operator = null;
    cages = null;
    cellLength = 80;
    // cellColor = 0x888888;
    cellColor = 0x333333;
    selectedCell = null;
    nextMoveTime = 0;

    constructor() {
        super('play');
    }

    create() {
        let i, j;
        let that = this;

        this.graphics = this.add.graphics();

        /** Level **/
        const levels = this.cache.json.get('levels');
        this.level = levels[currentLevel];

        /** Table **/
        this.table = Array(this.level.order);
        this.cages = {};
        let usedCageIds = new Set();
        for (i=0; i<this.level.order; i++) {
            this.table[i] = Array(this.level.order);
            // Loop backwards to assign clues to top-right cage cells.
            for (j=this.level.order-1; j>=0; j--) {
                const cageId = this.level.cells[i][j];
                let clue = null;
                if (!usedCageIds.has(cageId)) {
                    clue = this.level.clues[cageId];
                    usedCageIds.add(cageId);
                    this.cages[cageId] = {
                        state: 'active',
                        coords: [],
                        clue
                    };
                }
                this.table[i][j] = {cageId, clue};
                this.cages[cageId].coords.push([i, j]);
            }
        }

        /** Cells **/
        const paddedCellLength = this.cellLength + 4;
        this.table.forEach((row, i) => {
            row.forEach((el, j) => {
                const position = new Phaser.Math.Vector2(
                    100 + j*paddedCellLength,
                    100 + i*paddedCellLength
                );
                this.table[i][j].cell = this.createCell(position, i, j);
            });
        });

        /** Cages **/
        this.table.forEach((row, i) => {
            row.forEach((el, j) => {
                this.table[i][j].bars = this.createBars(i, j);
            });
        });

        /** Controls **/
        this.keyControls = this.input.keyboard.addKeys({
            'zero': Phaser.Input.Keyboard.KeyCodes.ZERO,
            'one': Phaser.Input.Keyboard.KeyCodes.ONE,
            'two': Phaser.Input.Keyboard.KeyCodes.TWO,
            'three': Phaser.Input.Keyboard.KeyCodes.THREE,
            'four': Phaser.Input.Keyboard.KeyCodes.FOUR,
            'five': Phaser.Input.Keyboard.KeyCodes.FIVE,
            'six': Phaser.Input.Keyboard.KeyCodes.SIX,
            'seven': Phaser.Input.Keyboard.KeyCodes.SEVEN,
            'eight': Phaser.Input.Keyboard.KeyCodes.EIGHT,
            'nine': Phaser.Input.Keyboard.KeyCodes.NINE,
            'backspace': Phaser.Input.Keyboard.KeyCodes.BACKSPACE,
            'up': Phaser.Input.Keyboard.KeyCodes.UP,
            'down': Phaser.Input.Keyboard.KeyCodes.DOWN,
            'left': Phaser.Input.Keyboard.KeyCodes.LEFT,
            'right': Phaser.Input.Keyboard.KeyCodes.RIGHT,
            'end': Phaser.Input.Keyboard.KeyCodes.E,
        });

        this.input.mouse.disableContextMenu();
    }

    createCell(position, row, column) {
        // console.log(`(${position.x}, ${position.y}), ${row}, ${column}`);
        const that = this;
        let cell = this.add.rectangle(
            position.x,
            position.y,
            this.cellLength,
            this.cellLength,
            this.cellColor
        );

        let text = this.add.text(
            position.x,
            position.y,
            '.',
            {font: '30px Courier',
             fill: '#ffffff'}
        ).setOrigin(0.5, 0.5);

        const clue = this.table[row][column].clue;
        let clueText = null;
        if (clue != null) {
            clueText = this.add.text(
                position.x + 40,
                position.y - 30,
                `${clue}`,
                {font: '16px Courier',
                 fill: '#ffffff'}
            ).setOrigin(1.0, 0.5);
        }

        cell.setInteractive();
        cell.setStrokeStyle(4, 0x333333);
        cell.data = {
            state: 'off',
            row,
            column,
            text,
            clue,
            clueText,
        };

        cell.on('pointerdown', function (pointer, localX, localY, event) {
            const cellWasOff = cell.data.state === 'off';
            that.deactivateCell();
            if (cellWasOff) {
                that.activateCell(cell);
            }
        });

        return cell;
    }

    createBars(row, column) {
        // console.log(`(${row}, ${column})`);
        // console.log(this.table[row][column]);
        let bars = {
            north: null,
            east: null,
            south: null,
            west: null
        };

        const element = this.table[row][column];
        const cageId = element.cageId;
        const cell = element.cell;
        const x = cell.x;
        const y = cell.y;
        const lineColor = 0xFFFFFF;
        const lineWidth = 2;

        // North
        if (row === 0) {
            const startX = x - this.cellLength/2 - lineWidth;
            const startY = y - this.cellLength/2 - lineWidth;
            const endX = startX + this.cellLength + lineWidth*2;
            const endY = startY;
            bars.north = this.add.line(0, 0, startX, startY, endX, endY, lineColor).setOrigin(0);
            bars.north.lineWidth = lineWidth;
        } else {
            bars.north = this.table[row-1][column].bars.south;
        }

        // East
        const eastCageId = this.table[row][column+1]?.cageId;
        if (column === this.level.order-1 || cageId !== eastCageId) {
            const startX = x + this.cellLength/2 + lineWidth;
            const startY = y - this.cellLength/2 - lineWidth;
            const endX = startX;
            const endY = startY + this.cellLength + lineWidth*2;
            bars.east = this.add.line(0, 0, startX, startY, endX, endY, lineColor).setOrigin(0);
            bars.east.lineWidth = lineWidth;
        }

        // South
        const southCageId =  this.table[row+1]?.[column].cageId;
        if (row === this.level.order-1 || cageId !== southCageId) {
            const startX = x - this.cellLength/2 - lineWidth;
            const startY = y + this.cellLength/2 + lineWidth;
            const endX = startX + this.cellLength + lineWidth*2;
            const endY = startY;
            bars.south = this.add.line(0, 0, startX, startY, endX, endY, lineColor).setOrigin(0);
            bars.south.lineWidth = lineWidth;
        }

        // West
        if (column === 0) {
            const startX = x - this.cellLength/2 - lineWidth;
            const startY = y - this.cellLength/2 - lineWidth;
            const endX = startX;
            const endY = startY + this.cellLength + lineWidth*2;
            bars.west = this.add.line(0, 0, startX, startY, endX, endY, lineColor).setOrigin(0);
            bars.west.lineWidth = lineWidth;
        } else {
            bars.west = this.table[row][column-1].bars.east;
        }

        return bars;
    }

    activateCell(cell) {
        cell.data.state = 'on';
        cell.setFillStyle(0xbbbbbb);
        this.selectedCell = cell;
        if (cell.data.text.text === '.') {
            cell.data.text.text = '_';
        }

        console.log(`(${cell.data.row}, ${cell.data.column})`);
        console.log(`${cell.data.text.text} - ${cell.data.clue}`);
    }

    deactivateCell() {
        if (this.selectedCell == null) {
            return;
        }

        this.selectedCell.data.state = 'off';
        this.selectedCell.setFillStyle(this.cellColor);
        if (this.selectedCell.data.text.text === '_') {
            this.selectedCell.data.text.text = '.';
        }
        this.selectedCell = null;
    }

    update() {
        // console.log('[PLAY] update');
        let row, col, nextRow, nextCol, cageId, cage, moveAccepted, changeCell;

        const now = this.time.now;

        if (this.selectedCell != null) {
            row = this.selectedCell.data.row;
            col = this.selectedCell.data.column;
            nextRow = row;
            nextCol = col;
            cageId = this.table[row][col].cageId;
            moveAccepted = false;
            changeCell = false

            // if (this.keyControls.zero.isDown && this.level.order >= 0) {
            //     this.selectedCell.data.text.text = '0';
            // }

            if (this.keyControls.one.isDown && this.level.order >= 1) {
                this.selectedCell.data.text.text = '1';
                moveAccepted = true;
            }

            if (this.keyControls.two.isDown && this.level.order >= 2) {
                this.selectedCell.data.text.text = '2';
                moveAccepted = true;
            }

            if (this.keyControls.three.isDown && this.level.order >= 3) {
                this.selectedCell.data.text.text = '3';
                moveAccepted = true;
            }

            if (this.keyControls.four.isDown && this.level.order >= 4) {
                this.selectedCell.data.text.text = '4';
                moveAccepted = true;
            }

            if (this.keyControls.five.isDown && this.level.order >= 5) {
                this.selectedCell.data.text.text = '5';
                moveAccepted = true;
            }

            if (this.keyControls.six.isDown && this.level.order >= 6) {
                this.selectedCell.data.text.text = '6';
                moveAccepted = true;
            }

            if (this.keyControls.seven.isDown && this.level.order >= 7) {
                this.selectedCell.data.text.text = '7';
                moveAccepted = true;
            }

            if (this.keyControls.eight.isDown && this.level.order >= 8) {
                this.selectedCell.data.text.text = '8';
                moveAccepted = true;
            }

            if (this.keyControls.nine.isDown && this.level.order >= 9) {
                this.selectedCell.data.text.text = '9';
                moveAccepted = true;
            }

            if (this.keyControls.backspace.isDown) {
                this.selectedCell.data.text.text = '';
                moveAccepted = true;
            }

            if (moveAccepted) {
                const cageState = this.verifyCage(cageId);
                const levelState = this.verifySolution();
                console.log(`  cageState: ${cageState}`);
                console.log(`  levelState: ${levelState}`);
            }

            if (now > this.nextMoveTime) {
                if (this.keyControls.up.isDown) {
                    changeCell = true;
                    nextRow = trueModulo(nextRow - 1, this.level.order);
                }

                if (this.keyControls.down.isDown) {
                    changeCell = true;
                    nextRow = trueModulo(nextRow + 1, this.level.order);
                }

                if (this.keyControls.left.isDown) {
                    changeCell = true;
                    nextCol = trueModulo(nextCol - 1, this.level.order);
                }

                if (this.keyControls.right.isDown) {
                    changeCell = true;
                    nextCol = trueModulo(nextCol + 1, this.level.order);
                }

                if (changeCell) {
                    const nextCell = this.table[nextRow][nextCol].cell;
                    this.deactivateCell();
                    this.activateCell(nextCell);
                    this.nextMoveTime = now + 100;
                }
            }
        }

        if (this.keyControls.end.isDown) {
            this.end();
        }
    }

    verifyCage(cageId) {
        // console.log(`verifyCage(${cageId})`);
        let baseVal, opFunc;
        const cage = this.cages[cageId];

        if (this.level.operator === '+') {
            baseVal = 0;
            opFunc = (a, b) => parseInt(a) + parseInt(b);
        } else if (this.level.operator === '*') {
            baseVal = 1;
            opFunc = (a, b) => parseInt(a) * parseInt(b);
        }

        const values = cage.coords.map(coord => {
            return this.table[coord[0]][coord[1]].cell.data.text.text;
        });

        if (values.includes('.')) {
            cage.state = 'active';
            return cage.state;
        }

        const total = values.reduce((accumulator, currVal) => {
            return opFunc(accumulator, currVal);
        }, baseVal);

        if (total === cage.clue) {
            cage.state = 'done';
        } else {
            cage.state = 'error';
        }

        return cage.state;
    }

    verifySolution() {
        console.log('verifySolution()');
        let i, j, cage;
        let state = 'done';

        for (let cageId in this.cages) {
            cage = this.cages[cageId];
            if (cage.state === 'error') {
                state = 'error';
            } else if (cage.state === 'active') {
                this.state = 'active';
                return this.state;
            }
        }

        let usedRowElements = new Set();
        let usedColumnElements = new Set();
        let rowElement, columnElement;
        for (i=0; i<this.level.order; i++) {
            usedRowElements.clear();
            usedColumnElements.clear();
            for (j=0; j<this.level.order; j++) {
                rowElement = this.table[i][j].cell.data.text.text;
                if (usedRowElements.has(rowElement)) {
                    this.state = 'error';
                    return this.state;
                } else {
                    usedRowElements.add(rowElement);
                }

                columnElement = this.table[j][i].cell.data.text.text;
                if (usedColumnElements.has(columnElement)) {
                    this.state = 'error';
                    return this.state;
                } else {
                    usedColumnElements.add(columnElement);
                }
            }
        }

        this.state = state;
        return this.state;
    }

    end() {
        console.log('[PLAY] end');
        game.scene.switch('play', 'end');
    }
}

class EndScene extends Phaser.Scene {
    constructor() {
        super('end');
    }

    create() {
        this.add.text(600, 10, 'Score: ' + score,
                      {font: '30px Courier',
                       fill: '#ffffff'});
        this.add.text(80, 160, 'YOU WIN',
                      {font: '50px Courier',
                       fill: '#ffffff'});
        this.add.text(80, 240, 'press "W" to restart',
                      {font: '30px Courier',
                       fill: '#ffffff'});

        this.input.keyboard.on('keydown-W', this.restart, this);
    }

    update() {
        console.log('[END] update');
    }

    restart() {
        console.log('[END] restart');
        game.scene.switch('end', 'title');
    }
}


const gameConfig = {
    type: Phaser.CANVAS,
    parent: 'game-div',
    width: 800,
    height: 600,
    scene: [
        BootScene,
        LoadScene,
        TitleScene,
        PlayScene,
        EndScene
    ]
};

let game = new Phaser.Game(gameConfig);
game.scene.start('boot', { someData: '...arbitrary data' });
