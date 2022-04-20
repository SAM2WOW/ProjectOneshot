class Ghost extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, game.config.width / 2 + x, game.config.height / 2 + y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setDepth(20);

        // variables
        this.progress = 0;
        this.health = 1;

        this.xOffset = x;
        this.yOffset = y;
    }

    update(time, delta) {
        this.progress += game.scrollingSpeed * delta / 16;
        console.log(this.progress);

        if (this.progress >= 1.2) {
            this.scene.stopGame();
        }

        // scaling and depth sorting
        this.setDepth(10 * this.progress);

        let space = this.scene.get3DSpace(this.xOffset, this.yOffset, time, this.progress);
        this.setScale(this.scene.lerp(0.05, 3, space.curvedProgress));

        // head bounce
        this.setPosition(space.x, space.y);

        // shading
        let colorAmount = Phaser.Math.Clamp(space.curvedProgress * 1000, 0, 255);
        this.setTint(Phaser.Display.Color.GetColor(colorAmount, colorAmount, colorAmount));
    }

    damage() {
        // bad shot
        if (this.progress < 0.5) {
            return;
        }

        // perfect shot (between 0.85 and 0.95)
        if (this.progress >= 0.85 && this.progress <= 0.95) {
        }

        this.health -= 1;
        if (this.health <= 0) {
            this.scene.ghosts.splice(this.scene.ghosts.indexOf(this), 1);
            
            this.scene.spawnGhost();
            this.scene.spawnGhost();

            this.destroy();
        }
    }
}