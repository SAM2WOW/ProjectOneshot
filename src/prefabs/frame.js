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

        // variables
        this.lockedGhosts = [];
        this.charge = 1;
        this.coolDown = 0;  // cooldown in ms
        this.totalCoolDown = 1000;

        // UI
        this.cooldownBar = scene.add.text(this.x, this.y, "Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
        this.cooldownBar.setDepth(100);
        this.chargeBar = scene.add.text(this.x, this.y, "Charge -" + this.charge + "");
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
            this.charge = Math.min(this.charge + delta / 400, 5);
            //this.setScale(this.charge * 3 + 1);
        }

        // cooldown bar
        this.cooldownBar.setPosition(this.x - 50, this.y + 100);
        this.cooldownBar.setText("Cooldown: " + Math.round(this.coolDown / this.totalCoolDown * 100) + "%");
        this.chargeBar.setText("Charge -" + Math.floor(this.charge) + "p");
    }

    shoot() {
        if (this.coolDown > 0) {
            return;
        }
        
        // damage all ghosts
        let ghosts = this.scene.ghosts.getChildren();
        let counts = Math.min(ghosts.length, Math.floor(this.charge));
        console.log(ghosts);
        console.log(ghosts.length);
        while (counts > 0) {
            counts--;
            console.log('shoot');
            ghosts.shift().damage();
        }
        
        this.charge = 1;

        this.totalCoolDown = this.charge * 800;
        this.coolDown = this.totalCoolDown;        
    }
}