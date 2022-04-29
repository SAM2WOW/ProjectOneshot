class Over extends Phaser.Scene {
    constructor() {
        super("over");
    }

    preload() {
    }

    create() {
        this.title = this.add.text(game.config.width / 2, game.config.height / 2, ["GAME", "OVER"]);
        this.title.setOrigin(0.5, 0.5);
        this.title.setFontSize(64);

        this.input.on("pointerdown", () => {
            this.scene.start("menu");
        });
    }
}