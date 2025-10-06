let score, currentLevel, levels, game;

score = 0;
currentLevel = 0;

levels = [
    {
        order: 4,
        operator: '+',
        cages: [
        ],
    },
    {
        order: 4,
        operator: '+',
        cages: [
        ],
    },
    {
        order: 4,
        operator: '*',
        cages: [
        ],
    },
    {
        order: 4,
        operator: '*',
        cages: [
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

    group = null;

    constructor() {
        super('play');
    }

    create() {
        let that = this;

        this.graphics = this.add.graphics();

        /** Level **/
        const level = levels[currentLevel];

        /** Controls **/
        this.keyControls = this.input.keyboard.addKeys({
            'end': Phaser.Input.Keyboard.KeyCodes.E,
        });

        this.input.mouse.disableContextMenu();
    }

    update() {
        console.log('[PLAY] update');

        if (this.keyControls.end.isDown) {
            this.end();
        }
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
