class Wall extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, delay) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.progress = 0.01;

        this.setScale(0.05);
        this.tint = 0x000000;

        this.setRotation((Math.random() * 0.05) - 0.025);

        this.delay = delay;
    }

    update(time, delta) {
        if (time < this.delay) {
            return;
        }
        
        this.progress += this.progress * 2 * game.scrollingSpeed * delta / 16;
        if (this.progress >= 1) {
            this.progress = 0.01;
        }

        //console.log(this.progress);

        this.setDepth(5 * this.progress);
        this.setScale(this.scene.lerp(0.05, 2, this.progress));
        this.tint = 0xffffff;
    }
}