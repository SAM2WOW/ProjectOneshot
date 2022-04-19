class Ghost extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // variables
        this.progress = 0;
    }

    update(time, delta) {
        this.progress *= game.scrollingSpeed;

        if (this.ghostScale >= 1.0) {
            this.scene.stopGame();
        }

        this.ghost.setScale(this.lerp(0.01, 0.3, this.ghostScale));

        this.shadow.setScale(this.lerp(0, 40, this.ghostScale));
        this.shadow.y = this.lerp(game.config.height / 2, game.config.height, this.ghostScale);
    }
}