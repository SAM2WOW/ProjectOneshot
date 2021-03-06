class Frame extends Phaser.GameObjects.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        
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

        // add a container for all the ui elements
        this.frameUIContainer = new Phaser.GameObjects.Container(scene, 0, 0);

        // add frame UI
        this.frameUI = scene.add.image(this.x, this.y, 'ui_frame');
        this.frameUI.setDepth(150);
        this.frameUI.setAlpha(1);
        // this.frameUIContainer.add(this.frameUI);
        
        // bind mouse events
        //scene.input.mouse.disableContextMenu();
        
        //spacebar support
        scene.input.keyboard.on('keyup-' + 'SPACE', this.buttomUp, this);

        scene.input.keyboard.on('keydown-' + 'SPACE', this.buttomDown, this);

        //mouse support
        scene.input.on('pointerup', function (pointer) {
            if (pointer.leftButtonReleased()) { //
                this.buttomUp();
            }
        }, this);

        scene.input.on('pointerdown', function (pointer) {
            if (pointer.leftButtonDown()) { // //scene.keySPACE.isDown
                this.buttomDown();
            }
        }, this);

        // UI
        // this.cooldownBarBG = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x, this.y, 20, 150, 0x32a852)); 
        // this.cooldownBarBG.setDepth(140);
        // this.cooldownBarBG.setPosition(this.x + 141, this.y - 5);
        // this.cooldownBarBG.setOrigin(0, 0.5);
        this.cooldownBar = scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x + 141, this.y - 5, 20, 150, 0x1e2e67));
        this.cooldownBar.setDepth(140);
        this.cooldownBar.setOrigin(0, -0.5);
        this.cooldownBar.height = -150;
        
        // this.comboBarBG = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x - 157, this.y - 33, 16, 111, 0xd97e00));
        // this.comboBarBG.setDepth(140);
        // this.comboBarBG.setVisible(false);
        this.comboBar = scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x - 157, this.y - 20, 16, 111, 0xfcba03));
        this.comboBar.setDepth(140);
        this.comboBar.setVisible(false);
        this.comboBar.setOrigin(0, -0.5);
        this.comboBar.height = -111;

        this.comboCircle = scene.add.image(this.x, this.y, 'ui_perfect');
        this.comboCircle.setDepth(140);
        this.comboCircle.setVisible(false);

        this.comboText = scene.add.text(this.x - 149, this.y + 48, 23, {fontFamily: "PixelFont", fontSize: "20px", color: "#306082"});
        this.comboText.setDepth(140);
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
        this.sfxperfectPlaying = false;
        this.sfxperfectQueue = [];
        
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

            // cooldown bar
            this.cooldownBar.height = Phaser.Math.Clamp(1 - (this.coolDown / this.totalCoolDown), 0, 1) * -150;

            // effect for when the bar is just filled
            if (this.coolDown <= 0) {
                // this.cooldownBar.fillColor = 0x306082;

                // this.scene.time.delayedCall(50, () => {
                //     this.cooldownBar.fillColor = 0x1e2e67;
                // });

                this.scene.tweens.add({
                    targets: this.cooldownBar,
                    fillColor: {from: 0x1e2e67, to: 0x306082},
                    duration: 50,
                    yoyo: true,
                });
            }
        }

        // lower combo cooldown
        if (this.comboCoolDown > 0) {
            // console.log("cooling down combo" + this.scene.lerp(0.3, 2, Phaser.Math.Clamp(this.combo, 0, 10) / 10));
            this.comboCoolDown -= (delta / 16) * this.scene.lerp(0.3, 2, Phaser.Math.Clamp(this.combo, 0, 10) / 10);

            this.comboBar.height = Phaser.Math.Clamp((this.comboCoolDown / 100), 0, 1) * -111;

        } else {
            if (this.combo > 0) {
                this.combo = 0;

                this.comboText.setVisible(false);
                this.comboBar.setVisible(false);
                this.comboCircle.setVisible(false);
                // this.comboBarBG.setVisible(false);
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

    }

    buttomDown() {
        if (this.coolDown <= 0) {
            this.lock();
    
            this.charging = true;
    
            this.setAlpha(0.8);
    
            this.scene.tweens.add({
                targets: this.scene,
                cameraOffsetY: {from: 0, to: -80},
                cameraShake: {from: 20, to: 5},
                duration: 200,
                ease: 'Cubic.easeOut',
            });
    
            this.scene.tweens.add({
                targets: this,
                scale: {from: 1.5, to: 1},
                duration: 100,
                ease: 'Cubic.easeOut',
            });
        }
    }

    buttomUp() {
        if (this.charging) {
            this.shoot();
    
            this.charging = false;
    
            this.setAlpha(0);
    
            this.scene.tweens.add({
                targets: this.scene,
                cameraOffsetY: {from: -80, to: 0},
                cameraShake: {from: 5, to: 20},
                duration: 300,
                ease: 'Back.easeInOut',
            });
    
            this.scene.cameras.main.shake(100, 0.005);
        }
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
            //     targets: [this.scene.cameraSprite],
            //     duration: 100,
            //     scale: {from: 3, to: 2.8},
            //     ease: 'Circ.easeOut',
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

    playComboSound() {
        if (this.sfxperfectQueue.length > 0) {
            this.sfxperfectPlaying = true;

            // get next sound in queue
            let next = this.sfxperfectQueue.shift();

            console.log("Playing combo sound " + next);

            this.sfxperfect.detune = next * 100;
            this.sfxperfect.volume = this.scene.lerp(0.5, 1, Math.random());
            this.sfxperfect.play();

            this.scene.time.delayedCall(100, () => {
                this.playComboSound();
            });

        } else {
            this.sfxperfectPlaying = false;
        }
    }
}