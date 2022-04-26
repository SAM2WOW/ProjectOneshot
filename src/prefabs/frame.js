class Frame extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // bind mouse events
        //scene.input.mouse.disableContextMenu();
        scene.input.on('pointerup', function (pointer) {
            if (pointer.leftButtonReleased()) {
                this.shoot();
            }
        }, this);

        scene.input.on('pointerdown', function (pointer) {
            if (pointer.leftButtonDown() && this.coolDown <= 0) {
                this.lock();
            }
        }, this);

        // variables
        this.lockedGhosts = [];
        this.killedGhosts = [];
        this.charge = 0;
        this.coolDown = 0;  // cooldown in ms
        this.totalCoolDown = 1000;

        // UI
        this.cooldownBar = scene.add.text(this.x, this.y, "Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
        this.cooldownBar.setDepth(100);
        this.chargeBar = scene.add.text(this.x, this.y, "Charge " + this.charge + "");
        this.chargeBar.setDepth(100);

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
            //this.charge = Math.min(this.charge + delta / 400, 5);
            this.charge = this.charge + delta / 400;
            if (this.charge >= 1) {
                this.charge = 0;
                this.lock();
            }
        }

        // cooldown bar
        this.cooldownBar.setPosition(this.x - 50, this.y + 100);
        this.cooldownBar.setText("Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
        this.chargeBar.setText("Charge " + Math.floor(this.charge) + "p");
    }

    lock() {
        console.log('lock');
        // find all ghosts in range
        let ghosts = this.scene.ghosts.getChildren();
        for (let i = 0; i < ghosts.length; i++) {
            let result = ghosts[i].lockOn();
            if (result) {
                this.lockedGhosts.push(ghosts[i]);
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
    }
}