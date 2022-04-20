class Ghost extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, game.config.width / 2 + x, game.config.height / 2 + y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setDepth(20);

        // variables
        this.progress = 0;

        this.xOffset = x;
        this.yOffset = y;
    }

    update(time, delta) {
        this.progress += game.scrollingSpeed * delta / 16;
        //console.log(this.progress);

        if (this.progress >= 1.2) {
            this.progress = 0;
        }

        // scaling
        let space = this.scene.get3DSpace(this.xOffset, this.yOffset, time, this.progress);
        this.setScale(this.scene.lerp(0.05, 3, space.curvedProgress));

        // head bounce
        this.setPosition(space.x, space.y);
    }
}