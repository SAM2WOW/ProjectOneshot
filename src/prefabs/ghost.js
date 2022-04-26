class Ghost extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, game.config.width / 2 + x, game.config.height / 2 + y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setDepth(20);
        this.setAlpha(0.9);

        // variables
        this.progress = 0;
        this.health = Math.round(Math.random() * 3);
        this.perfectShot = false;
        this.locked = false;

        this.xOffset = x;
        this.yOffset = y;
    }

    update(time, delta) {
        this.progress += game.scrollingSpeed * delta / 16;
        //console.log(this.progress);

        // ghost attack!
        if (this.progress >= 1.2) {
            this.scene.stopGame();
        }

        
        // scaling and depth sorting
        this.setDepth(10 * this.progress);
        
        let space = this.scene.get3DSpace(this.xOffset, this.yOffset, time, this.progress);
        this.setScale(this.scene.lerp(0.01, 1, space.curvedProgress));
        
        // head bounce
        this.setPosition(space.x, space.y);
        
        // shading
        let colorAmount = Phaser.Math.Clamp(space.curvedProgress * 1000, 0, 255);

        // perfect timeing tint (between 0.82 and 0.95)
        
        if (this.progress >= 0.80 && this.progress <= 0.90) {
            this.setTint(Phaser.Display.Color.GetColor(237, 181, 38));
            this.perfectShot = true;
        } else if (this.locked) {
            this.setTint(Phaser.Display.Color.GetColor(134, 255, 32));
        } else {
            this.setTint(Phaser.Display.Color.GetColor(colorAmount, colorAmount, colorAmount));
            this.perfectShot = false;
        }
    }

    lockOn() {
        // bad shot
        if (this.locked || this.progress < 0.5) {
            return false;
        }
        
        this.locked = true;
        return true;
    }

    damage(frame) {
        console.log("Trying to kill this shit at " + this.progress + "with health" + this.health);

        // bad shot
        if (this.progress < 0.5) {
            return;
        }

        // perfect shot make combos
        if (this.perfectShot) {
        }

        this.health -= 1;
        this.locked = false;
        
        // check for health results
        if (this.health <= 0) {
            console.log("ghost died");
            frame.killedGhosts.push(this);

            this.scene.spawnGhost();
        } else {
            this.angle += 45;
            this.scene.tweens.add({
                targets: this,
                progress: {from: this.progress, to: 0.6},
                duration: 500,
                ease: 'Power1',
            });
        }
    }
}