class Over extends Phaser.Scene {
    constructor() {
        super("over");
    }

    preload() {
        this.load.spritesheet('game_over', 'assets/sprites/deadspritesheet.png', { frameWidth: 320, frameHeight: 250 });
    }

    create() {
        //this.title = this.add.text(game.config.width / 2, game.config.height / 2, ["GAME", "OVER"], {fontFamily: "PixelFont"});
        //this.title.setOrigin(0.5, 0.5);
        //this.title.setFontSize(64);

        this.input.on("pointerdown", () => {
            this.scene.start("menu");
        });

        this.anims.create({
            key: 'game_over',
            frames: this.anims.generateFrameNumbers('game_over', { start: 0, end: 1, first: 0}),
            frameRate: 5,
            repeat: -1
        });

        this.game_over = this.add.sprite(game.config.width / 2, game.config.height, 'game_over').setOrigin(0.5, 1)
        this.game_over.anims.play('game_over');
    }
}