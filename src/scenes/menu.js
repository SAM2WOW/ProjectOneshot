class Menu extends Phaser.Scene {
    constructor() {
        super("menu");
    }

    preload() {
        this.load.spritesheet('tutorial', 'assets/Tutorial.png', { frameWidth: 360, frameHeight: 360 });
    }

    create() {       
        this.title = this.add.text(game.config.width / 2, 0 + 30, ["SPOOKY", "PICTURE", "GAME"]);
        this.title.setOrigin(0.5, 0);
        this.title.setFontSize(64);

        this.input.on("pointerdown", () => {
            this.scene.start("play");
        });

        this.anims.create({
            key: 'tutorial',
            frames: this.anims.generateFrameNumbers('tutorial', { start: 0, end: 1, first: 0}),
            frameRate: 1,
            repeat: -1
        });

        this.tutorial = this.add.sprite(game.config.width / 2, game.config.height, 'tutorial').setOrigin(0.5, 1)
        this.tutorial.anims.play('tutorial');
    }
}