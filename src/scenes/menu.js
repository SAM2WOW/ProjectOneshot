class Menu extends Phaser.Scene {
    constructor() {
        super("menu");
    }

    preload() {
    }

    create() {
        this.scene.start("play");
    }
}