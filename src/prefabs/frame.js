class Frame extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        //scene.physics.add.existing(this);
        
        // variables
        this.lockedGhosts = [];
        this.killedGhosts = [];
        this.charge = 0;
        this.charging = false;
        this.coolDown = 0;  // cooldown in ms
        this.totalCoolDown = 1000;
        this.combo = 0;
        this.comboCoolDown = 0;

        this.setAlpha(0);

        // add frame UI
        this.frameUI = scene.add.image(game.config.width / 2, game.config.height / 2, 'ui_frame');
        this.frameUI.setDepth(100);
        this.frameUI.setAlpha(0.8);
        
        // bind mouse events
        //scene.input.mouse.disableContextMenu();
        scene.input.on('pointerup', function (pointer) {
            if (pointer.leftButtonReleased() && this.charging) {
                this.shoot();

                this.charging = false;

                this.setAlpha(0);

                scene.tweens.add({
                    targets: scene,
                    cameraOffsetY: {from: -80, to: 0},
                    cameraShake: {from: 5, to: 20},
                    duration: 300,
                    ease: 'Back.easeInOut',
                });

                this.scene.cameras.main.shake(100, 0.005);
            }
        }, this);

        scene.input.on('pointerdown', function (pointer) {
            if (pointer.leftButtonDown() && this.coolDown <= 0) {
                this.lock();

                this.charging = true;

                this.setAlpha(0.8);

                scene.tweens.add({
                    targets: scene,
                    cameraOffsetY: {from: 0, to: -80},
                    cameraShake: {from: 20, to: 5},
                    duration: 200,
                    ease: 'Cubic.easeOut',
                });

                scene.tweens.add({
                    targets: this,
                    scale: {from: 1.5, to: 1},
                    duration: 100,
                    ease: 'Cubic.easeOut',
                });
            }
        }, this);


        // UI
        this.cooldownBarBG = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x - 50, this.y + 100, 100, 20, 0x32a852)); 
        this.cooldownBarBG.setDepth(150);
        this.cooldownBarBG.setPosition(this.x, this.y + 100);
        this.cooldownBar = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x, this.y, 100, 20, 0xffffff));
        this.cooldownBar.setDepth(150);
        this.cooldownBar.setPosition(this.x, this.y + 100);
        
        this.comboBarBG = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x, 100, 100, 20, 0xd97e00));
        this.comboBarBG.setDepth(150);
        this.comboBarBG.setVisible(false);
        this.comboBar = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x, 100, 100, 20, 0xfcba03));
        this.comboBar.setDepth(150);
        this.comboBar.width = 0;
        this.comboBar.setVisible(false);

        this.comboText = scene.add.text(this.x, 100, this.combo, {fontFamily: "PixelFont"});
        this.comboText.setDepth(150);
        this.comboText.setOrigin(0.5, 0.5);
        this.comboText.setVisible(false);

        // this.chargeBar = scene.add.text(this.x, this.y, "Charge " + this.charge + "");
        // this.chargeBar.setDepth(100);
        
        // add invisible flash
        this.flash = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, 0, 0, game.config.width, game.config.height, 0xffffff));
        this.flash.setDepth(90);
        this.flash.setAlpha(0);
        this.flash.setOrigin(0, 0);

        // here a combo sound that's waiting for triggers
        // I put it here so it only trigger ones when perfect time
        this.sfxperfect = this.scene.sound.add('perfect');
        
        this.setPosition(x, y);
    }

    update(time, delta) {
        let pointer = this.scene.input.activePointer;

        //this.setPosition(pointer.worldX, pointer.worldY);

        // lower cooldown
        if (this.coolDown > 0) {
            if (this.combo > 0) {
                this.coolDown -= delta * this.combo;
            } else {
                this.coolDown -= delta;
            }

            this.cooldownBarBG.setFillStyle(0x32a852);
        } else {
            this.cooldownBarBG.setFillStyle(0xffffff);
        }

        // lower combo cooldown
        if (this.comboCoolDown > 0) {
            // console.log("cooling down combo" + this.scene.lerp(0.3, 2, Phaser.Math.Clamp(this.combo, 0, 10) / 10));
            this.comboCoolDown -= (delta / 16) * this.scene.lerp(0.3, 2, Phaser.Math.Clamp(this.combo, 0, 10) / 10);

            this.comboBar.width = Phaser.Math.Clamp((this.comboCoolDown / 100), 0, 1) * 100;
        } else {
            if (this.combo > 0) {
                this.combo = 0;

                this.comboText.setVisible(false);
                this.comboBar.setVisible(false);
                this.comboBarBG.setVisible(false);
            }
        }

        if (this.charging) {
            //this.charge = Math.min(this.charge + delta / 400, 5);
            this.charge = this.charge + (delta / 400) * (this.combo + 1);
            if (this.charge >= 1) {
                this.charge = 0;
                this.lock();
            }
        }

        // cooldown bar
        //this.cooldownBar.setText("Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
        this.cooldownBar.width = Phaser.Math.Clamp((this.coolDown / this.totalCoolDown), 0, 1) * 100;
        //this.chargeBar.setText("👻".repeat(this.lockedGhosts.length));
    }

    lock() {
        // only charge 5 ghost max
        if (this.lockedGhosts.length >= 5) {
            return;
        }

        // find all ghosts in range
        let ghosts = this.scene.ghosts.getChildren();
        let cloestDistance = 0;
        let cloest = null;
        console.log(ghosts);
        for (let i = 0; i < ghosts.length; i++) {
            console.log("~~ Checking ghosts at " + i);
            if (ghosts[i].progress > cloestDistance && ghosts[i].checkLock()) {
                cloestDistance = ghosts[i].progress;
                cloest = ghosts[i];
            }
        }
        
        if (cloest != null) {
            cloest.lock();
            this.lockedGhosts.push(cloest);

            // this.scene.tweens.add({
            //     targets: this.scene.cameraSprite,
            //     duration: 100,
            //     scaleY: {from: 3, to: 1},
            //     ease: 'Power2',
            //     yoyo: true,
            // });

            // play explosion sound
            this.sfxfocus = this.scene.sound.add('focus');
            this.sfxfocus.detune = this.lockedGhosts.length * 200;
            this.sfxfocus.volume = this.scene.lerp(1, 2, Math.random());
            this.sfxfocus.play();
        }
    }

    shoot() {
        this.totalCoolDown = 800;
        this.coolDown = this.totalCoolDown;

        // damage all ghosts
        for (let i = 0; i < this.lockedGhosts.length; i++) {
            this.lockedGhosts[i].damage(this);
        }
        this.lockedGhosts = [];

        // wait for animation then DELETE
        this.scene.time.delayedCall(500, () => {
            // remove locked ghosts (reversely so the array doesn't break duh)
            for (let i = this.killedGhosts.length - 1; i >= 0; i--) {
                this.scene.ghosts.remove(this.killedGhosts[i], true);
            }
            this.killedGhosts = [];
        }, null, this);

        this.charge = 0;

        this.scene.tweens.add({
            targets: this.flash,
            duration: 200,
            alpha: {from: 0.8, to: 0},
            ease: 'Sine.easeIn',
        });

        this.sfxshoot = this.scene.sound.add('shoot');
        this.sfxshoot.detune = this.scene.lerp(-300, 300, Math.random());
        this.sfxshoot.volume = this.scene.lerp(1, 2, Math.random());
        this.sfxshoot.play();
    }
}