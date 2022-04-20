class Wall extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, progress) {
        super(scene, x, y, texture);
        scene.add.existing(this);

        this.progress = progress;

        this.setScale(0.05);
        this.setTint(0x000000);

        this.setRotation((Math.random() * 0.05) - 0.025);
    }

    update(time, delta) { 
        this.progress += game.scrollingSpeed * delta / 16;

        if (this.progress >= 1) {
            this.progress = 0;
        }

        // scaling and depth sorting
        this.setDepth(10 * this.progress);

        let space = this.scene.get3DSpace(0, 0, time, this.progress);
        this.setScale(this.scene.lerp(0.05, 1.8, space.curvedProgress));
        //this.setDisplaySize(this.scene.lerp(0, 592, this.progress), this.scene.lerp(0, 640, this.progress));

        // head bounce
        this.setPosition(space.x, space.y);
        
        // shading
        let colorAmount = Phaser.Math.Clamp(space.curvedProgress * 1000, 0, 255);
        this.setTint(Phaser.Display.Color.GetColor(colorAmount, colorAmount, colorAmount));
    }
}