class Frame extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // bind mouse events
        //scene.input.mouse.disableContextMenu();
        scene.input.on('pointerup', function (pointer) {
            if (pointer.leftButtonReleased() && this.charge > 0) {
                this.shoot();
            }
        }, this);

        // variables
        this.lockedGhosts = [];
        this.charge = 0;
        this.coolDown = 0;  // cooldown in ms
        this.totalCoolDown = 1000;

        // UI
        this.cooldownBar = scene.add.text(this.x, this.y, "Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
        this.cooldownBar.setDepth(100);

        this.setPosition(x, y);
    }

    update(time, delta) {
        let pointer = this.scene.input.activePointer;

        //this.setPosition(pointer.worldX, pointer.worldY);

        // lower cooldown
        if (this.coolDown > 0) {
            this.coolDown -= delta;
        }

        if (pointer.leftButtonDown() && this.coolDown <= 0) {
            this.charge = Phaser.Math.Clamp((this.charge + delta / 1500), 0, 1);
            //this.setScale(this.charge * 3 + 1);
        }

        // cooldown bar
        this.cooldownBar.setPosition(this.x - 50, this.y + 100);
        this.cooldownBar.setText("Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
    }

    shoot() {
        console.log('shoot');

        this.totalCoolDown = this.scene.lerp(2000, 1000, this.charge);

        this.charge = 0;
        //this.setScale(1);
        
        this.coolDown = this.totalCoolDown;

        // damage all ghosts
        this.scene.ghosts.forEach(ghost => {
            ghost.damage();
        });
    }
}