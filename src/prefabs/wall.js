class Wall extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, progress) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.progress = progress;

        this.setScale(0.05);
        this.tint = 0x000000;

        this.setRotation((Math.random() * 0.05) - 0.025);
    }

    update(time, delta) { 
        this.progress += game.scrollingSpeed * delta / 16;

        if (this.progress >= 1) {
            this.progress = 0.01;
        }

        //console.log(this.progress);

        this.setDepth(5 * this.progress);
        this.setScale(this.scene.lerp(0.05, 2, this.progress * this.progress));
        //this.tint = Phaser.Display.Color.Interpolate.ColorWithColor(Phaser.Display.Color.HexStringToColor('#ffffff'), Phaser.Display.Color.HexStringToColor('#000000'), 100, this.progress * 100);

        // head bounce
        //console.log(Math.abs(Math.sin(this.progress * 20)));
        this.setPosition(this.x, game.config.height / 2 - Math.abs(Math.sin(time / 200) * 20) * this.progress);

        this.tint = 0xffffff;
    }
}