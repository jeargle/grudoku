let score, currentLevel, levels, game;

score = 0;
currentLevel = 0;

levels = [
    {
        order: 4,
        operator: '+',
        cages: [
            {
                cells: [
                ],
                hint: {
                    value: 3,
                    cell: [0, 0],
                }
            },
        ],
    },
    {
        order: 4,
        operator: '+',
        cages: [
            {
                cells: [
                    [0, 0],
                    [],
                ],
                hint: {
                    value: 3,
                    cell: [0, 0],
                }
            },
        ],
    },
    {
        order: 4,
        operator: '*',
        cages: [
            {
                cells: [
                ],
                hint: {
                    value: 3,
                    cell: [0, 0],
                }
            },
        ],
    },
    {
        order: 4,
        operator: '*',
        cages: [
            {
                cells: [
                ],
                hint: {
                    value: 3,
                    cell: [0, 0],
                }
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
                this.table[i].push({
                    cage: null,
                    value: null,
                    hint: null,
                });
            }
        }

        /** Cages **/
        for (const cage of this.level.cages) {
            const hint = cage.hint;
            for (const cell of cage.cells) {
                const tableCell = this.table[cell[0], cell[1]];
                tableCell.cage = cage;
                if (hint != null) {
                    tableCell.hint = hint;
                }
            }
        }

        /** Cells **/
        const paddedCellLength = this.cellLength + 4;
        for (let i in this.table) {
            const row = this.table[i];
            for (let j in row) {
                const position = new Phaser.Math.Vector2(100 + i*paddedCellLength, 100 + j*paddedCellLength);
                this.table[i][j].cell = this.createCell(position, i, j);
            }
        }

        /** Controls **/
        this.keyControls = this.input.keyboard.addKeys({
            'end': Phaser.Input.Keyboard.KeyCodes.E,
        });

        this.input.mouse.disableContextMenu();
    }

    createCell(position, row, column) {
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
        cell.data.text.text = '_';

        console.log(`(${cell.data.row}, ${cell.data.column})`);
        console.log(cell.data.text.text);
    }

    deactivateCell() {
        if (this.selectedCell == null) {
            return;
        }

        this.selectedCell.data.state = 'off';
        this.selectedCell.setFillStyle(this.cellColor);
        this.selectedCell.data.text.text = '.';
        this.selectedCell = null;
    }

    update() {
        // console.log('[PLAY] update');

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
