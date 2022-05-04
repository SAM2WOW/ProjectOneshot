class Over extends Phaser.Scene {
    constructor() {
        super("over");
    }

    preload() {
        this.load.spritesheet('game_over', 'assets/sprites/deadspritesheet.png', { frameWidth: 320, frameHeight: 250 });
    }

    create() {
        
        //play dead noise
        this.sfxdeath = this.sound.add('death');
        this.sfxdeath.play();

        this.title = this.add.text(game.config.width / 2, game.config.height / 4, ["YOU'RE", "DEAD!!!"], {fontFamily: "PixelFont"});
        this.title.setOrigin(0.5, 0.5);
        this.title.setFontSize(64);

        this.input.on("pointerdown", () => {
            this.scene.start("menu");
        });

        this.anims.create({
            key: 'game_over',
            frames: this.anims.generateFrameNumbers('game_over', { start: 0, end: 1, first: 0}),
            frameRate: 5,
            repeat: -1
        });

        this.game_over = this.add.sprite(game.config.width / 2, game.config.height - game.config.height / 8, 'game_over').setOrigin(0.5, 1)
        this.game_over.anims.play('game_over');

        // score text
        this.scoreText = this.add.text(game.config.width / 2 - 50, this.title.y + 130, Math.round(distance) + 'm!!', {fontFamily: "PixelFont"});
        this.scoreText.setOrigin(0.5, 0.5);
        this.scoreText.setFontSize(50);
        this.scoreText.setAngle(20);
        this.scoreText.setShadow(0, 2, '#1e2e67', 0, false, true);

    }
}