class Ghost extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture, type) {
        super(scene, game.config.width / 2 + x, game.config.height / 2 + y, texture);
        scene.add.existing(this);
        
        this.setDepth(20);
        this.setAlpha(0.9);
        this.setScale(0.01);
        this.setTint(0x000000);

        // locking visual
        this.lockHint = scene.add.image(0, 0, 'eyeaf');
        this.lockHint.setScale(0.8);
        this.lockHint.setVisible(false);
        this.lockHint.setAlpha(0.5);
        this.lockHint.setDepth(100);
        this.lockHint.setTint(0x306082);

        // this.perfectHint = scene.add.image(0, 0, 'eyeaf');
        // this.perfectHint.setScale(0.1);
        // this.perfectHint.setVisible(false);
        // this.perfectHint.setAlpha(0.5);
        // this.perfectHint.setDepth(100);

        // shadow
        // this.shadow = scene.add.ellipse(game.config.width / 2, game.config.height / 2, 3, 1, 0x000000);
        // this.shadow.setDepth(12);
        // this.shadow.setAlpha(0.3);
        
        // variables
        this.progress = 0;
        this.health = Math.ceil(Math.random() * 3);
        this.perfectShot = false;
        this.locked = false;
        this.dead = false;
        
        this.xOffset = x;
        this.yOffset = y;
        
        this.speedMultiplier = 1;

        
        // ghost type
        this.type = type;
        this.animName = ['normal_ghost', 'heart_ghost', 'normal_ghost', 'normal_ghost'][this.type];
        
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

        // rotate the ghost base on their health
        this.angle = -90 * (this.health - 1);
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

            // screen shake
            this.scene.cameras.main.shake(200, 0.008);

            // kill the visual 
            this.lockHint.destroy();

            console.log("ghost killed you haha");
            this.scene.ghosts.remove(this, true);
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
        //this.lockHint.setRotation(this.scene.lerp(0, Math.PI / 2, space.curvedProgress));

        // perfect hint visual
        // this.perfectHint.setPosition(this.x, this.y);
        // this.perfectHint.setScale(this.progress);
        // this.perfectHint.setAlpha(this.scene.lerp(0, 0.8, this.progress));
        
        // update shadow
        // this.shadow.setScale(this.scene.lerp(0, 40, space.curvedProgress));
        // this.shadow.x = this.x;
        // this.shadow.y = space.y + this.scene.lerp(0, 300, space.curvedProgress);

        // shading
        let colorAmount = Phaser.Math.Clamp(space.curvedProgress * 1000, 0, 255);
        this.setTint(Phaser.Display.Color.GetColor(colorAmount, colorAmount, colorAmount));
        
        // perfect timeing (between 0.80 and 0.90)
        if (this.progress >= 0.80 && this.progress <= 0.90) {
            // this.setTint(Phaser.Display.Color.GetColor(237, 181, 38));
            
            if (!this.perfectShot) {
                this.lockHint.setTint(Phaser.Display.Color.GetColor(237, 181, 38));

                this.play(this.animName + '_perfect');

                this.sfxattack = this.scene.sound.add('ghost_attack' + Math.ceil(Math.random() * 5));
                this.sfxattack.detune = this.scene.lerp(-800, 800, Math.random());
                this.sfxattack.volume = this.scene.lerp(0.5, 1, Math.random());
                this.sfxattack.play();

                this.scene.tweens.add({
                    targets: this.lockHint,
                    angle: {from: 10, to: 0},
                    duration: 100,
                    ease: 'Cubic.easeOut',
                });
            }

            this.perfectShot = true;

        } else {

            if (this.perfectShot) {
                this.lockHint.setTint(0x306082);

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
            // console.log("-- bad locking for this boy");
            // console.log("Locking State: " + this.locked);
            // console.log("Progress State: " + this.progress);
            // console.log("Health state: " + this.health);
            // console.log("-----------------------------------------------------");
            return false;
        }

        return true;
    }

    lock() {
        this.locked = true;
        this.lockHint.setVisible(true);
        // this.perfectHint.setVisible(true);
    }

    damage(frame) {
        console.log("Trying to kill this shit at " + this.progress + "with health" + this.health);

        // perfect shot make combos
        if (this.perfectShot) {
            // frame.coolDown -= 400;
            frame.combo++;
            frame.comboCoolDown = 100;

            // combo visual
            frame.comboText.setText(frame.combo);
            frame.comboText.setVisible(true);
            frame.comboCircle.setVisible(true);
            frame.comboBar.setVisible(true);
            frame.comboBar.fillColor = 0xffffff;
            this.scene.time.delayedCall(100, function () {
                frame.comboBar.fillColor = 0xfcba03;
            });

            // frame.comboBarBG.setVisible(true);
            
            // combo sounds (sequential playing cool stuff)
            frame.sfxperfectQueue.push(frame.combo);
            if (!frame.sfxperfectPlaying) {
                frame.playComboSound();
            }
        }

        this.health -= 1;
        
        this.play(this.animName + '_hurt');
        
        this.sfxhurt = this.scene.sound.add('ghost_hurt' + Math.ceil(Math.random() * 5));
        this.sfxhurt.detune = this.scene.lerp(-800, 800, Math.random());
        this.sfxhurt.volume = this.scene.lerp(0.5, 1, Math.random());
        this.sfxhurt.play();

        // check if ghost is killed
        if (this.health <= 0) {
            console.log("ghost died");
            this.dead = true;
            
            // kill the visual 
            this.lockHint.destroy();
            // this.perfectHint.destroy();
            
            this.sfxkill = this.scene.sound.add('ghost_kill');
            this.sfxkill.detune = this.scene.lerp(0, 500, Math.random());
            this.sfxkill.volume = this.scene.lerp(0.5, 1, Math.random());
            this.sfxkill.play();

            switch (this.type) {
                case normalGhost:
                    break;
                case heartGhost:
                    // if ghost is a heart, add a heart
                    this.scene.heal();
                    break;
                case splitGhost:
                    break;
                case fastGhost:
                    break;
                default:
            }


            // (delay) kill the ghost
            frame.killedGhosts.push(this);

            //ghost particle effects play on death
            this.particles = this.scene.add.particles('wisps');
            this.particles.setDepth(this.depth);
            this.particles.setAlpha(this.alpha);

            //particle emitter
            this.emitter = this.particles.createEmitter({
                x: {min: 0, max: 100},
                y: {min:0, max: 100},
                angle: {min: 0, max: 360},
                speed: {min: 15, max: 60},
                lifespan: {min: 800, max: 1500},
                //blendMode: 'LUMINOSITY',
                frequency: 5,
                alpha: {start: 1, end: 0},
                scale: {min: 0.5, max: 1.5, start: 1, end: 0},
                tint: this.tint,
                on: false
            });

            this.particles.emitParticleAt(this.x, this.y, 5)

            // play a little tweens
            this.scene.tweens.add({
                targets: this,
                scale: { from: this.scale, to: 0.01 },
                alpha: { from: 0.6, to: 0.01 },
                y: { from: this.y, to: this.y - 100 },
                duration: 500,
                ease: 'Sine.easeInOut',
            });

        } else {
            this.angle += 90;
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
        // this.perfectHint.setVisible(false);
    }
}