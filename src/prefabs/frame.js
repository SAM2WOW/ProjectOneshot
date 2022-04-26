class Frame extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);
        
        // variables
        this.lockedGhosts = [];
        this.killedGhosts = [];
        this.charge = 0;
        this.charging = false;
        this.coolDown = 0;  // cooldown in ms
        this.totalCoolDown = 1000;

        // bind mouse events
        //scene.input.mouse.disableContextMenu();
        scene.input.on('pointerup', function (pointer) {
            if (pointer.leftButtonReleased() && this.charging) {
                this.shoot();

                this.charging = false;

                scene.tweens.add({
                    targets: scene.cameraSprite,
                    y: game.config.height - 50,
                    duration: 200,
                });
            }
        }, this);

        scene.input.on('pointerdown', function (pointer) {
            if (pointer.leftButtonDown() && this.coolDown <= 0) {
                this.lock();

                this.charging = true;

                scene.tweens.add({
                    targets: scene.cameraSprite,
                    y: game.config.height - 150,
                    duration: 200,
                });
            }
        }, this);

        // UI
        //this.cooldownBar = scene.add.text(this.x, this.y, "Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
        this.cooldownBarBG = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x - 50, this.y + 100, 100, 20, 0x32a852)); 
        this.cooldownBarBG.setDepth(100);
        this.cooldownBar = this.scene.add.existing(new Phaser.GameObjects.Rectangle(scene, this.x, this.y, 100, 20, 0xffffff));
        this.cooldownBar.setDepth(100);
        
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
        this.cooldownBar.setPosition(this.x - 50, this.y + 100);
        //this.cooldownBar.setText("Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
        this.cooldownBar.width = (this.coolDown / this.totalCoolDown) * 100;
        this.chargeBar.setText("👻".repeat(this.lockedGhosts.length));
    }

    lock() {
        console.log('lock');
        // find all ghosts in range
        let ghosts = this.scene.ghosts.getChildren();
        for (let i = 0; i < ghosts.length; i++) {
            let result = ghosts[i].lockOn();
            if (result) {
                this.lockedGhosts.push(ghosts[i]);

                // this.scene.tweens.add({
                //     targets: this.scene.cameraSprite,
                //     duration: 100,
                //     scaleY: {from: 3, to: 1},
                //     ease: 'Power2',
                //     yoyo: true,
                // });

                break;
            }
        }
    }

    shoot() {
        if (this.coolDown > 0) {
            return;
        }
        
        this.totalCoolDown = this.lockedGhosts.length * 400;
        this.coolDown = this.totalCoolDown;   

        // damage all ghosts
        for (let i = 0; i < this.lockedGhosts.length; i++) {
            console.log('shoot');
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
            duration: 100,
            alpha: {from: 0, to: 1},
            ease: 'Power2',
            yoyo: true,
        });
    }
}