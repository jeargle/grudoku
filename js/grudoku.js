let score = 0;
// let currentLevel = "2209124b-7858-42b1-be44-5ccb8e9c0dd1";  // 4x4 +
// let currentLevel = "ceb259aa-fdfc-4e71-9cbe-b6459db2684f";  // 6x6 +
// let currentLevel = "13bd0d28-83ff-48f5-8651-6975a43389c2";  // 4x4 x
let currentLevel = "392566c0-7dd2-4595-841e-5571a15fa662";  // Z4


function mod(x, y) {
  return ((x % y) + y) % y;
}

function range(x, y) {
    let start = 1;
    let end = x;

    if (y != null) {
        start = x;
        end = y;
    }

    const size = end - start + 1;

    return [...Array(size).keys()].map(i => i + start);
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
        this.add.text(80, 320, 'press "I" for instructions',
                      {font: '30px Courier',
                       fill: '#ffffff'});

        this.input.keyboard.on('keydown-W', this.start, this);
        this.input.keyboard.on('keydown-I', this.instructions, this);
    }

    update() {
        console.log('[TITLE] update');
    }

    start() {
        console.log('[TITLE] start');
        game.scene.switch('title', 'levelSelect');
    }

    instructions() {
        console.log('[TITLE] instructions');
        game.scene.switch('title', 'instructions');
    }
}

class InstructionsScene extends Phaser.Scene {
    constructor() {
        super('instructions');
    }

    init(config) {
        console.log('[INSTRUCTIONS] init', config);
    }

    preload() {
        console.log('[INSTRUCTIONS] preload');
    }

    create() {
        this.add.text(80, 160, 'GRUDOKU',
                      {font: '50px Courier',
                       fill: '#ffffff'});
        this.add.text(80, 240, 'press "B" to go back',
                      {font: '30px Courier',
                       fill: '#ffffff'});

        this.add.text(80, 320, 'Instructions: blah, blah, blah...',
                      {font: '16px Courier',
                       fill: '#ffffff'});

        this.input.keyboard.on('keydown-B', this.back, this);
    }

    update() {
        console.log('[INSTRUCTIONS] update');
    }

    back() {
        console.log('[INSTRUCTIONS] back');
        this.title();
    }

    title() {
        console.log('[INSTRUCTIONS] title');
        game.scene.switch('instructions', 'title');
    }
}

class LevelSelectScene extends Phaser.Scene {

    boxLength = 40;
    boxColor = 0x663300;
    selectedBox = null;

    constructor() {
        super('levelSelect');
    }

    init(config) {
        console.log('[LEVEL SELECT] init', config);
    }

    preload() {
        console.log('[LEVEL SELECT] preload');
    }

    create() {
        console.log('[LEVEL SELECT] create');
        this.add.text(80, 60, 'GRUDOKU',
                      {font: '50px Courier',
                       fill: '#ffffff'});
        this.add.text(80, 140, 'press "S" to start',
                      {font: '30px Courier',
                       fill: '#ffffff'});

        const levels = this.cache.json.get('levels');

        /** Level Boxes **/
        let row = 0;
        let column = -1;
        let paddedBoxLength = 44;
        levels.forEach(level => {
            // console.log(level.uuid);
            column += 1;
            if (column >= 12) {
                row += 1;
                column = 0;
            }
            const position = new Phaser.Math.Vector2(
                100 + column*paddedBoxLength,
                200 + row*paddedBoxLength
            );

            this.createLevelBox(level.uuid, position);
        });

        this.input.keyboard.on('keydown-S', this.start, this);
    }

    update() {
        console.log('[LEVEL SELECT] update');
    }

    createLevelBox(levelUuid, position) {
        console.log(`${levelUuid}, (${position.x}, ${position.y})`);

        const that = this;
        let box = this.add.rectangle(
            position.x,
            position.y,
            this.boxLength,
            this.boxLength,
            this.boxColor
        );

        let text = this.add.text(
            position.x,
            position.y,
            this.boxEmptyText,
            {font: '30px Courier',
             fill: '#ffffff'}
        ).setOrigin(0.5, 0.5);

        box.setInteractive();
        // box.setStrokeStyle(4, 0x333333);
        box.data = {
            state: 'off',
            uuid: levelUuid,
            text,
        };

        box.on('pointerdown', function (pointer, localX, localY, event) {
            const boxWasOff = box.data.state === 'off';
            that.deactivateBox();
            if (boxWasOff) {
                that.activateBox(box);
            }
        });

        return box;
    }

    activateBox(box) {
        box.data.state = 'on';
        box.setFillStyle(0xbbbbbb);
        this.selectedBox = box;
        if (box.data.text.text === this.boxEmptyText) {
            box.data.text.text = this.boxActiveText;
        }

        // console.log(`(${box.data.row}, ${box.data.column})`);
        // console.log(`${box.data.text.text} - ${box.data.clue}`);
        console.log(`${box.data.uuid}`);
        currentLevel = box.data.uuid;
    }

    deactivateBox() {
        if (this.selectedBox == null) {
            return;
        }

        this.selectedBox.data.state = 'off';
        this.selectedBox.setFillStyle(this.boxColor);
        if (this.selectedBox.data.text.text === this.boxActiveText) {
            this.selectedBox.data.text.text = this.boxEmptyText;
        }
        this.selectedBox = null;
    }

    start() {
        console.log('[LEVEL SELECT] start');
        game.scene.switch('levelSelect', 'play');
    }
}

const operatorSymbol = {
    '+': '+',
    'x': '\u00d7',
    '*': '*',
};

const groupSymbol = {
    'Z4': 'Z\u2084',
    'Z5': 'Z\u2085',
    'Z6': 'Z\u2086',
    'Z7': 'Z\u2087',
    'Z8': 'Z\u2088',
    'U(5)': 'U(5)',
    'U(10)': 'U(10)',
    'U(7)': 'U(7)',
    'U(9)': 'U(9)',
};

class PlayScene extends Phaser.Scene {

    uuidToLevel = {};
    level = null;
    table = null;
    tableOffset = null; // position of table's top-left corner
    elements = [];
    operatorText = null;
    groupText = null;
    cages = null;
    barColor = 0xFFFFFF;
    barErrorColor = 0xEE0000;
    barWidth = 2;
    textErrorColor = '0xEE0000';
    cellLength = 80;
    // cellColor = 0x888888;
    cellColor = 0x333333;
    cellEmptyText = '.';
    cellActiveText = '_';
    selectedCell = null;
    nextMoveTime = 0;

    constructor() {
        super('play');

    }

    create() {
        console.log('[PLAY] create');
        let i, j;
        let that = this;

        // this.events.on('start', this.start, this);
        // this.events.on('ready', this.ready, this);
        // this.events.on('pause', this.pause, this);
        // this.events.on('resume', this.resume, this);
        this.events.on('sleep', this.sleep, this);
        this.events.on('wake', this.wake, this);

        this.graphics = this.add.graphics();

        this.createLevel();

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
            'tentative': Phaser.Input.Keyboard.KeyCodes.T,
            'end': Phaser.Input.Keyboard.KeyCodes.E,
        });

        this.input.mouse.disableContextMenu();
    }

    start() {
        console.log('[PLAY] start');
    }

    ready() {
        console.log('[PLAY] ready');
    }

    pause() {
        console.log('[PLAY] pause');
    }

    resume() {
        console.log('[PLAY] resume');
    }

    sleep() {
        console.log('[PLAY] sleep');
    }

    wake() {
        console.log('[PLAY] wake');

        this.createLevel();
    }

    createLevel() {
        let i, j;
        let that = this;

        /** Level **/
        const levels = this.cache.json.get('levels');
        levels.forEach(level => {
            this.uuidToLevel[level.uuid] = level;
        });
        this.level = this.uuidToLevel[currentLevel];
        // console.log(`this.level.uuid = ${this.level.uuid}`);

        /** Table **/
        this.table = Array(this.level.order);
        this.tableOffset = new Phaser.Math.Vector2(100, 100);
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

        this.operatorText = this.add.text(
            40,
            40,
            operatorSymbol[this.level.operator],
            {font: '30px Courier',
             fill: '#ffffff'}
        ).setOrigin(0.5, 0.5);

        this.groupText = this.add.text(
            440,
            40,
            groupSymbol[this.level.group],
            {font: '30px Courier',
             fill: '#ffffff'}
        ).setOrigin(0.5, 0.5);

        console.log(`this.level.operator = ${this.level.operator}`);
        console.log(operatorSymbol[this.level.operator]);
        console.log(`this.level.group = ${this.level.group}`);

        /** Elements **/
        const group = this.level.group;
        if (group == null) {
            this.elements = range(this.level.order);
        } else {
            if (group[0] === 'Z') {
                // Cyclic group
                const modBase = parseInt(group.slice(1));
                this.elements = range(0, modBase-1);
            }
        }

        /** Cells **/
        const paddedCellLength = this.cellLength + 4;
        this.table.forEach((row, i) => {
            row.forEach((el, j) => {
                const position = new Phaser.Math.Vector2(j, i)
                      .scale(paddedCellLength)
                      .add(this.tableOffset);
                this.table[i][j].cell = this.createCell(position, i, j);
            });
        });

        /** Cages **/
        this.table.forEach((row, i) => {
            row.forEach((el, j) => {
                this.table[i][j].bars = this.createBars(i, j);
            });
        });
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
            this.cellEmptyText,
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
        cell.data2 = {
            state: 'off',
            tentative: false,
            row,
            column,
            text,
            clue,
            clueText,
        };

        cell.on('pointerdown', function (pointer, localX, localY, event) {
            const cellWasOff = cell.data2.state === 'off';
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
        // const lineColor = 0xFFFFFF;
        // const lineWidth = 2;

        // North
        if (row === 0) {
            const startX = x - this.cellLength/2 - this.barWidth;
            const startY = y - this.cellLength/2 - this.barWidth;
            const endX = startX + this.cellLength + this.barWidth*2;
            const endY = startY;
            bars.north = this.add.line(0, 0, startX, startY, endX, endY, this.barColor).setOrigin(0);
            bars.north.lineWidth = this.barWidth;
            bars.north.setData({errorCount: 0});
        } else {
            bars.north = this.table[row-1][column].bars.south;
        }

        // East
        const eastCageId = this.table[row][column+1]?.cageId;
        if (column === this.level.order-1 || cageId !== eastCageId) {
            const startX = x + this.cellLength/2 + this.barWidth;
            const startY = y - this.cellLength/2 - this.barWidth;
            const endX = startX;
            const endY = startY + this.cellLength + this.barWidth*2;
            bars.east = this.add.line(0, 0, startX, startY, endX, endY, this.barColor).setOrigin(0);
            bars.east.lineWidth = this.barWidth;
            bars.east.setData({errorCount: 0});
        }

        // South
        const southCageId =  this.table[row+1]?.[column].cageId;
        if (row === this.level.order-1 || cageId !== southCageId) {
            const startX = x - this.cellLength/2 - this.barWidth;
            const startY = y + this.cellLength/2 + this.barWidth;
            const endX = startX + this.cellLength + this.barWidth*2;
            const endY = startY;
            bars.south = this.add.line(0, 0, startX, startY, endX, endY, this.barColor).setOrigin(0);
            bars.south.lineWidth = this.barWidth;
            bars.south.setData({errorCount: 0});
        }

        // West
        if (column === 0) {
            const startX = x - this.cellLength/2 - this.barWidth;
            const startY = y - this.cellLength/2 - this.barWidth;
            const endX = startX;
            const endY = startY + this.cellLength + this.barWidth*2;
            bars.west = this.add.line(0, 0, startX, startY, endX, endY, this.barColor).setOrigin(0);
            bars.west.lineWidth = this.barWidth;
            bars.west.setData({errorCount: 0});
        } else {
            bars.west = this.table[row][column-1].bars.east;
        }

        return bars;
    }

    activateCell(cell) {
        cell.data2.state = 'on';
        cell.setFillStyle(0xbbbbbb);
        this.selectedCell = cell;
        if (cell.data2.text.text === this.cellEmptyText) {
            cell.data2.text.text = this.cellActiveText;
        }

        console.log(`(${cell.data2.row}, ${cell.data2.column})`);
        console.log(`${cell.data2.text.text} - ${cell.data2.clue}`);
    }

    destroyLevel() {
        this.operatorText.destroy();
        this.groupText.destroy();

        // Destroy cells and bars.
        this.table.forEach((row, i) => {
            row.forEach((el, j) => {
                // Destroy cell.
                el.cell.data2.clueText?.destroy();
                el.cell.data2.text?.destroy();
                el.cell.destroy();

                // Destroy bars.
                for (const [direction, bar] of Object.entries(el.bars)) {
                    if (bar != null) {
                        bar.destroy();
                    }
                }
            });
        });

        this.table = null;
    }

    deactivateCell() {
        if (this.selectedCell == null) {
            return;
        }

        this.selectedCell.data2.state = 'off';
        this.selectedCell.setFillStyle(this.cellColor);
        if (this.selectedCell.data2.text.text === this.cellActiveText) {
            this.selectedCell.data2.text.text = this.cellEmptyText;
        }
        this.selectedCell = null;
    }

    update() {
        console.log('[PLAY] update');
        let row, col, nextRow, nextCol, cageId, cage, moveAccepted, changeCell;

        const now = this.time.now;

        if (this.selectedCell != null) {
            row = this.selectedCell.data2.row;
            col = this.selectedCell.data2.column;
            nextRow = row;
            nextCol = col;
            cageId = this.table[row][col].cageId;
            moveAccepted = false;
            changeCell = false

            if (this.keyControls.zero.isDown && this.elements.includes(0)) {
                this.selectedCell.data2.text.text = '0';
                moveAccepted = true;
            }

            if (this.keyControls.one.isDown && this.elements.includes(1)) {
                this.selectedCell.data2.text.text = '1';
                moveAccepted = true;
            }

            if (this.keyControls.two.isDown && this.elements.includes(2)) {
                this.selectedCell.data2.text.text = '2';
                moveAccepted = true;
            }

            if (this.keyControls.three.isDown && this.elements.includes(3)) {
                this.selectedCell.data2.text.text = '3';
                moveAccepted = true;
            }

            if (this.keyControls.four.isDown && this.elements.includes(4)) {
                this.selectedCell.data2.text.text = '4';
                moveAccepted = true;
            }

            if (this.keyControls.five.isDown && this.elements.includes(5)) {
                this.selectedCell.data2.text.text = '5';
                moveAccepted = true;
            }

            if (this.keyControls.six.isDown && this.elements.includes(6)) {
                this.selectedCell.data2.text.text = '6';
                moveAccepted = true;
            }

            if (this.keyControls.seven.isDown && this.elements.includes(7)) {
                this.selectedCell.data2.text.text = '7';
                moveAccepted = true;
            }

            if (this.keyControls.eight.isDown && this.elements.includes(8)) {
                this.selectedCell.data2.text.text = '8';
                moveAccepted = true;
            }

            if (this.keyControls.nine.isDown && this.elements.includes(9)) {
                this.selectedCell.data2.text.text = '9';
                moveAccepted = true;
            }

            if (this.keyControls.backspace.isDown) {
                this.selectedCell.data2.text.text = this.cellActiveText;
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
                    nextRow = mod(nextRow - 1, this.level.order);
                }

                if (this.keyControls.down.isDown) {
                    changeCell = true;
                    nextRow = mod(nextRow + 1, this.level.order);
                }

                if (this.keyControls.left.isDown) {
                    changeCell = true;
                    nextCol = mod(nextCol - 1, this.level.order);
                }

                if (this.keyControls.right.isDown) {
                    changeCell = true;
                    nextCol = mod(nextCol + 1, this.level.order);
                }

                if (this.keyControls.tentative.isDown) {
                    console.log('tentative');
                    changeCell = true;
                    if (this.selectedCell.data2.text.tentative) {
                        this.selectedCell.data2.text.tentative = false;
                        this.selectedCell.data2.text.setFontStyle('');
                    } else {
                        this.selectedCell.data2.text.tentative = true;
                        this.selectedCell.data2.text.setFontStyle('italic');
                    }
                }

                if (changeCell) {
                    const nextCell = this.table[nextRow][nextCol].cell;
                    this.deactivateCell();
                    this.activateCell(nextCell);
                    this.nextMoveTime = now + 200;
                }
            }
        }

        if (this.keyControls.end.isDown) {
            this.end();
        }
    }

    setErrorBar(bar, error) {
        console.log('setErrorBar()');
        console.log('errorCount: ' + bar.data.values.errorCount);
        console.log(error);
        const oldErrorCount = bar.data.values.errorCount;

        if (error) {
            bar.setData({errorCount: oldErrorCount + 1})
            if (oldErrorCount === 0) {
                bar.setStrokeStyle(this.barWidth, this.barErrorColor);
            }
        } else {
            bar.setData({errorCount: oldErrorCount - 1})
            if (bar.data.values.errorCount === 0) {
                bar.setStrokeStyle(this.barWidth, this.barColor);
            }
        }
    }

    setErrorBars(cageId, error = true) {
        const cageCoordsList = this.cages[cageId].coords;
        const i = cageCoordsList[0][0];
        const j = cageCoordsList[0][1];
        const clueText = this.table[i][j].cell.data2.clueText;

        if (error) {
            // Cannot use variables for color, here!!!
            clueText.setFill('#ee0000');
        } else {
            // Cannot use variables for color, here!!!
            clueText.setFill('#ffffff');
        }

        cageCoordsList.forEach(coords => {
            const row = coords[0];
            const column = coords[1];
            ['north', 'south', 'east', 'west'].forEach(barDir => {
                const bar = this.table[row][column].bars[barDir];
                if (bar != null) {
                    this.setErrorBar(bar, error);
                }
            });
        });
    }

    verifyCage(cageId) {
        // console.log(`verifyCage(${cageId})`);
        let baseVal, opFunc;
        const group = this.level.group;
        const cage = this.cages[cageId];
        const oldCageState = cage.state;

        if (group == null) {
            if (this.level.operator === '+') {
                baseVal = 0;
                opFunc = (a, b) => parseInt(a) + parseInt(b);
            } else if (this.level.operator === 'x') {
                baseVal = 1;
                opFunc = (a, b) => parseInt(a) * parseInt(b);
            }
        } else {
            if (group[0] === 'Z') {
                // Cyclic group
                baseVal = 0;
                const modBase = parseInt(group.slice(1));
                opFunc = (a, b) => mod(parseInt(a) + parseInt(b), modBase);
            }
        }

        const values = cage.coords.map(coord => {
            return this.table[coord[0]][coord[1]].cell.data2.text.text;
        });

        if (values.includes(this.cellEmptyText) ||
            values.includes(this.cellActiveText)) {
            cage.state = 'active';
            if (oldCageState === 'error') {
                this.setErrorBars(cageId, false);
            }
            return cage.state;
        }

        const total = values.reduce((accumulator, currVal) => {
            return opFunc(accumulator, currVal);
        }, baseVal);

        if (total === cage.clue) {
            cage.state = 'done';
            if (oldCageState === 'error') {
                this.setErrorBars(cageId, false);
            }
        } else {
            cage.state = 'error';
            if (oldCageState !== 'error') {
                this.setErrorBars(cageId);
            }
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
                rowElement = this.table[i][j].cell.data2.text.text;
                if (usedRowElements.has(rowElement)) {
                    this.state = 'error';
                    return this.state;
                } else {
                    usedRowElements.add(rowElement);
                }

                columnElement = this.table[j][i].cell.data2.text.text;
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

        this.destroyLevel();
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
        InstructionsScene,
        LevelSelectScene,
        PlayScene,
        EndScene
    ]
};

let game = new Phaser.Game(gameConfig);
game.scene.start('boot', { someData: '...arbitrary data' });
