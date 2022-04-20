class Frame extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture) {
        super(scene, x, y, texture);
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // bind mouse events
        scene.input.mouse.disableContextMenu();
        scene.input.on('pointerdown', function (pointer) {
            if (pointer.leftButtonReleased()) {
                this.shoot();
            }
        }, this);

        // variables
        this.charge = 0;
        this.coolDown = 0;  // cooldown in ms
    }

    update(time, delta) {
        let pointer = this.scene.input.activePointer;

        this.setPosition(pointer.worldX, pointer.worldY);

        // lower cooldown
        if (this.coolDown > 0) {
            this.coolDown -= delta;
        }

        if (pointer.leftButtonDown() && this.coolDown <= 0) {
            this.charge = Phaser.Math.Clamp(pointer.getDuration() / 1500, 0, 1);
            this.setScale(this.charge * 3 + 1);
        }
    }

    shoot() {
        console.log('shoot');
        this.charge = 0;
        this.setScale(1);

        this.coolDown = 1000;
    }
}