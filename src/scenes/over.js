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

        this.score = this.add.text(game.config.width / 2, game.config.height / 4, [scoreString], {fontFamily: "PixelFont"});
        this.score.setOrigin(0.5, 0.5);
        this.score.setFontSize(64);

        this.subtitle = this.add.text((game.config.width / 2), (game.config.height / 4)+ 50, ["May your soul...", "Rest in peace."], {fontFamily: "PixelFont"});
        this.subtitle.setOrigin(0.5, 0.5);
        this.subtitle.setFontSize(12);

        this.subtitle = this.add.text((game.config.width / 2), (game.config.height / 4) - 50, "Click to restart.", {fontFamily: "PixelFont"});
        this.subtitle.setOrigin(0.5, 0.5);
        this.subtitle.setFontSize(32);

        this.input.on("pointerdown", () => {
            this.scene.start("menu");
        });

        this.input.keyboard.on('keyup-' + 'SPACE', () =>{
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