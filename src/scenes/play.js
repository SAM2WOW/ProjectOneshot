class Play extends Phaser.Scene {
    constructor() {
        super("play");
    }

    lerp(start, end, amt) {
        return (1-amt)*start+amt*end
    }

    preload() {

    }

    create() {
    }

    update(time, delta) {
        this.ghostScale *= 1.003;
        console.log(delta);

        if (this.ghostScale >= 1.0) {
            this.ghostScale = 0.01;
        }

        this.ghost.setScale(this.lerp(0.01, 0.3, this.ghostScale));

        this.shadow.setScale(this.lerp(0, 40, this.ghostScale));
        this.shadow.y = this.lerp(game.config.height / 2, game.config.height, this.ghostScale);
    }
}