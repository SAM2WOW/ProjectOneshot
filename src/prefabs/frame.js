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

        this.setAlpha(0);

        // bind mouse events
        //scene.input.mouse.disableContextMenu();
        scene.input.on('pointerup', function (pointer) {
            if (pointer.leftButtonReleased() && this.charging) {
                this.shoot();

                this.charging = false;

                this.setAlpha(0);

                scene.tweens.add({
                    targets: scene.cameraSprite,
                    y: game.config.height - 50,
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

                this.setAlpha(0.3);

                scene.tweens.add({
                    targets: scene.cameraSprite,
                    y: game.config.height - 150,
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
        //this.cooldownBar = scene.add.text(this.x, this.y, "Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
        this.cooldownBarBG = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x - 50, this.y + 100, 100, 20, 0x32a852)); 
        this.cooldownBarBG.setDepth(100);
        this.cooldownBarBG.setPosition(this.x, this.y + 100);
        this.cooldownBar = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x, this.y, 100, 20, 0xffffff));
        this.cooldownBar.setDepth(100);
        this.cooldownBar.setPosition(this.x, this.y + 100);
        
        this.chargeBar = scene.add.text(this.x, this.y, "Charge " + this.charge + "");
        this.chargeBar.setDepth(100);
        
        // add invisible flash
        this.flash = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, 0, 0, game.config.width, game.config.height, 0xffffff));
        this.flash.setDepth(90);
        this.flash.setAlpha(0);
        this.flash.setOrigin(0, 0);
        
        this.setPosition(x, y);
    }

    update(time, delta) {
        let pointer = this.scene.input.activePointer;

        //this.setPosition(pointer.worldX, pointer.worldY);

        // lower cooldown
        if (this.coolDown > 0) {
            this.coolDown -= delta;

            this.cooldownBarBG.setFillStyle(0x32a852);
        } else {
            this.cooldownBarBG.setFillStyle(0xffffff);
        }

        if (this.charging) {
            //this.charge = Math.min(this.charge + delta / 400, 5);
            this.charge = this.charge + delta / 400;
            if (this.charge >= 1) {
                this.charge = 0;
                this.lock();
            }
        }

        // cooldown bar
        //this.cooldownBar.setText("Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
        this.cooldownBar.width = Phaser.Math.Clamp((this.coolDown / this.totalCoolDown), 0, 1) * 100;
        this.chargeBar.setText("👻".repeat(this.lockedGhosts.length));
    }

    lock() {
        // find all ghosts in range
        let ghosts = this.scene.ghosts.getChildren();
        let cloestDistance = 0;
        let cloest = null;
        for (let i = 0; i < ghosts.length; i++) {
            if (ghosts[i].progress > cloestDistance && ghosts[i].checkLock()) {
                cloestDistance = ghosts[i].progress;
                cloest = ghosts[i];
            }
        }
        
        if (cloest != null) {
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
            this.sfxfocus.volume = this.scene.lerp(0.5, 1, Math.random());
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

        // remove locked ghosts (reversely so the array doesn't break duh)
        for (let i = this.killedGhosts.length - 1; i >= 0; i--) {
            this.scene.ghosts.remove(this.killedGhosts[i], true);
        }
        this.killedGhosts = [];
        
        this.charge = 0;

        // this.scene.tweens.add({
        //     targets: this.scene.cameraSprite,
        //     duration: 300,
        //     scaleY: {from: 3, to: 10},
        //     ease: 'Power2',
        //     yoyo: true,
        // });

        this.scene.tweens.add({
            targets: this.flash,
            duration: 200,
            alpha: {from: 0.8, to: 0},
            ease: 'Sine.easeIn',
        });

        this.sfxshoot = this.scene.sound.add('shoot');
        this.sfxshoot.detune = this.scene.lerp(-300, 300, Math.random());
        this.sfxshoot.volume = this.scene.lerp(0.5, 1, Math.random());
        this.sfxshoot.play();
    }
}