class Ghost extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, type) {
        super(scene, game.config.width / 2 + x, game.config.height / 2 + y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        this.setDepth(20);
        this.setAlpha(0.9);

        // locking visual
        this.lockHint = scene.add.image(0, 0, 'eyeaf');
        this.lockHint.setScale(0.5);
        this.lockHint.setVisible(false);
        this.lockHint.setAlpha(0.8);
        this.lockHint.setDepth(100);

        // shadow
        // this.shadow = scene.add.ellipse(game.config.width / 2, game.config.height / 2, 3, 1, 0x000000);
        // this.shadow.setDepth(12);
        // this.shadow.setAlpha(0.3);
        
        // variables
        this.progress = 0;
        this.health = Math.round(Math.random() * 3);
        this.perfectShot = false;
        this.locked = false;
        this.dead = false;
        
        this.xOffset = x;
        this.yOffset = y;
        
        this.speedMultiplier = 1;
        
        // ghost type
        this.type = type;
        this.animName = ['normal_ghost', 'heart_ghost'][this.type];

        switch (this.type) {
            case normalGhost:
                this.play(this.animName + '_normal');
                break;
            case heartGhost:
                this.play(this.animName + '_normal');
                this.health = 1;
                break;
            case splitGhost:

                break;
            case fastGhost:
                this.play({ key: 'normal_ghost_normal', frameRate: 12 });
                this.speedMultiplier = 1.5;
                break;
            default:
        }
    }

    update(time, delta) {
        // don't update if dead
        if (this.dead) {
            return;
        }

        this.progress += game.scrollingSpeed * this.speedMultiplier * (delta / 16);
        //console.log(this.progress);

        // ghost attack!
        if (this.progress >= 1) {
            this.scene.damage();
            
            //play hurt noise
            this.sfxhurt = this.scene.sound.add('hurt');
            this.sfxhurt.play();

            console.log("ghost killed you haha");
            this.scene.ghosts.remove(this, true);

            // screen shake
            this.scene.cameras.main.shake(200, 0.008);
        }

        
        // scaling and depth sorting
        this.setDepth(10 * this.progress);
        
        let space = this.scene.get3DSpace(this.xOffset, this.yOffset, time, this.progress);
        this.setScale(this.scene.lerp(0.01, 1, space.curvedProgress));
        
        // head bounce
        this.setPosition(space.x, space.y);
        
        // lock hint visual
        this.lockHint.setPosition(this.x, this.y);
        this.lockHint.setScale(this.scene.lerp(0.1, 2, space.curvedProgress));
        
        // update shadow
        // this.shadow.setScale(this.scene.lerp(0, 40, space.curvedProgress));
        // this.shadow.x = this.x;
        // this.shadow.y = space.y + this.scene.lerp(0, 300, space.curvedProgress);

        // perfect timeing tint (between 0.82 and 0.95)
        if (this.progress >= 0.80 && this.progress <= 0.90) {
            this.setTint(Phaser.Display.Color.GetColor(237, 181, 38));
            
            if (!this.perfectShot) {
                this.play(this.animName + '_perfect');
            }

            this.perfectShot = true;

        } else {
            // shading
            let colorAmount = Phaser.Math.Clamp(space.curvedProgress * 1000, 0, 255);
            this.setTint(Phaser.Display.Color.GetColor(colorAmount, colorAmount, colorAmount));

            if (this.perfectShot) {
                this.play(this.animName + '_normal');
            }

            this.perfectShot = false;
        }
    }

    checkLock() {
        if (this.dead) {
            return false;
        }

        // bad shot
        if (this.locked || this.progress < 0.5) {
            console.log("-- bad locking for this boy");
            console.log("Locking State: " + this.locked);
            console.log("Progress State: " + this.progress);
            console.log("Health state: " + this.health);
            console.log("-----------------------------------------------------");
            return false;
        }

        return true;
    }

    lock() {
        this.locked = true;
        this.lockHint.setVisible(true);
    }

    damage(frame) {
        console.log("Trying to kill this shit at " + this.progress + "with health" + this.health);

        // perfect shot make combos
        if (this.perfectShot) {
            // frame.coolDown -= 400;
            frame.combo++;
            frame.comboCoolDown = 100;

            // combo visual
            frame.comboText.setText("COMBO " + frame.combo);
            frame.comboText.setVisible(true);
            frame.comboBar.setVisible(true);
            frame.comboBarBG.setVisible(true);
        
        }

        this.health -= 1;

        this.play(this.animName + '_hurt');
        
        // check for health results
        if (this.health <= 0) {
            console.log("ghost died");
            this.dead = true;

            // if ghost is a heart, add a heart
            if (this.type === heartGhost) {
                this.scene.heal();
            }

            // kill the visual 
            this.lockHint.destroy();

            // (delay) kill the ghost
            frame.killedGhosts.push(this);

            // play a little tweens
            this.scene.tweens.add({
                targets: this,
                scale: { from: this.scale, to: 0.01 },
                alpha: { from: 1, to: 0.01 },
                // y: { from: this.y, to: this.y - 1000 },
                duration: 500,
                ease: 'Sine.easeInOut',
            });

        } else {
            this.angle += 45;
            this.scene.tweens.add({
                targets: this,
                progress: {from: this.progress, to: 0.6},
                duration: 500,
                ease: 'Circ.easeOut',
            });

            this.scene.time.delayedCall(500, () => {
                this.play(this.animName + '_normal');
            }, null, this);
        }
        
        this.locked = false;
        this.lockHint.setVisible(false);
    }
}