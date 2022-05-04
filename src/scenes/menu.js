class Menu extends Phaser.Scene {
    constructor() {
        super("menu");
    }

    preload() {
        //this.load.spritesheet('tutorial', 'assets/Tutorial.png', { frameWidth: 360, frameHeight: 360 });
        this.load.image('title', 'assets/sprites/spookylogo.png');
    }

    create() {       
        this.title = this.add.text(10, game.config.height - game.config.height / 10, ["Sam Feng", "Jose Salas", "Ryoma Marta-Sugawara", "UCSC CMPM 120-01 Spring '22"]);
        this.title.setOrigin(0, 0);
        this.title.setFontSize(8);

        this.input.on("pointerdown", () => {
            this.scene.start("play");
        });

        this.titleSprite = this.add.image(game.config.width /2,  game.config.height / 2, 'title').setOrigin(0.5,0.5);
        this.titleSprite.setScale(1.2 * (game.config.width/game.config.height));


        /*this.anims.create({
            key: 'tutorial',
            frames: this.anims.generateFrameNumbers('tutorial', { start: 0, end: 1, first: 0}),
            frameRate: 1,
            repeat: -1
        });

        this.tutorial = this.add.sprite(game.config.width / 2, game.config.height, 'tutorial').setOrigin(0.5, 1)
        this.tutorial.anims.play('tutorial');*/
    }
}