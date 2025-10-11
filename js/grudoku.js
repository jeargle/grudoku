let score, currentLevel, levels, game;

score = 0;
currentLevel = 0;

levels = [
    {
        order: 4,
        operator: '+',
        cells: [
            [0, 0, 1, 1],
            [2, 3, 4, 5],
            [2, 6, 7, 5],
            [8, 8, 9, 9],
        ],
        cages: [
            {
                clue: 4
            },
            {
                clue: 6
            },
            {
                clue: 6
            },
            {
                clue: 1
            },
            {
                clue: 2
            },
            {
                clue: 4
            },
            {
                clue: 4
            },
            {
                clue: 3
            },
            {
                clue: 5
            },
            {
                clue: 5
            },
        ],
    },
    {
        order: 4,
        operator: '+',
        cells: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        cages: [
            {
                clue: 3
            },
        ],
    },
    {
        order: 4,
        operator: '*',
        cells: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        cages: [
            {
                clue: 3
            },
        ],
    },
    {
        order: 4,
        operator: '*',
        cells: [
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
            [0, 0, 0, 0],
        ],
        cages: [
            {
                clue: 3
            },
        ],
    },
];


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
    cellColor = 0x888888;
    selectedCell = null;

    constructor() {
        super('play');
    }

    create() {
        let that = this;

        this.graphics = this.add.graphics();

        /** Level **/
        this.level = levels[currentLevel];

        /** Table **/
        this.table = [];
        for (let i=0; i<this.level.order; i++) {
            this.table[i] = [];
            for (let j=0; j<this.level.order; j++) {
                const cageId = this.level.cells[i][j];
                this.table[i].push({
                    cageId,
                    cage: this.level.cages[cageId],
                    clue: this.level.cages[cageId].clue
                });
            }
        }

        /** Cells **/
        const paddedCellLength = this.cellLength + 4;
        for (let i in this.table) {
            const row = this.table[i];
            for (let j in row) {
                const position = new Phaser.Math.Vector2(
                    100 + i*paddedCellLength,
                    100 + j*paddedCellLength
                );
                this.table[i][j].cell = this.createCell(position, i, j);
            }
        }

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

        cell.setInteractive();
        // cell.setStrokeStyle(1, 0xFFFFFF);
        cell.data = {
            state: 'off',
            row,
            column,
            text,
        };

        cell.on('pointerdown', function (pointer, localX, localY, event) {
            that.deactivateCell();
            if (cell.data.state === 'off') {
                that.activateCell(cell);
            }
        });

        return cell;
    }

    activateCell(cell) {
        cell.data.state = 'on';
        cell.setFillStyle(0xdddddd);
        this.selectedCell = cell;
        if (cell.data.text.text === '.') {
            cell.data.text.text = '_';
        }

        console.log(`(${cell.data.row}, ${cell.data.column})`);
        console.log(cell.data.text.text);
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

        if (this.selectedCell != null) {
            // if (this.keyControls.zero.isDown && this.level.order >= 0) {
            //     this.selectedCell.data.text.text = '0';
            // }

            if (this.keyControls.one.isDown && this.level.order >= 1) {
                this.selectedCell.data.text.text = '1';
            }

            if (this.keyControls.two.isDown && this.level.order >= 2) {
                this.selectedCell.data.text.text = '2';
            }

            if (this.keyControls.three.isDown && this.level.order >= 3) {
                this.selectedCell.data.text.text = '3';
            }

            if (this.keyControls.four.isDown && this.level.order >= 4) {
                this.selectedCell.data.text.text = '4';
            }

            if (this.keyControls.five.isDown && this.level.order >= 5) {
                this.selectedCell.data.text.text = '5';
            }

            if (this.keyControls.six.isDown && this.level.order >= 6) {
                this.selectedCell.data.text.text = '6';
            }

            if (this.keyControls.seven.isDown && this.level.order >= 7) {
                this.selectedCell.data.text.text = '7';
            }

            if (this.keyControls.eight.isDown && this.level.order >= 8) {
                this.selectedCell.data.text.text = '8';
            }

            if (this.keyControls.nine.isDown && this.level.order >= 9) {
                this.selectedCell.data.text.text = '9';
            }
        }

        if (this.keyControls.end.isDown) {
            this.end();
        }
    }

    verifyCage(cage) {

    }

    verifySolution() {

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

game = new Phaser.Game(gameConfig);
game.scene.start('boot', { someData: '...arbitrary data' });
