class Play extends Phaser.Scene {
    constructor() {
        super("play");

        // game states
        this.gameOver = false;

        game.scrollingSpeed = 0.003;

        this.walls = [];
    }

    lerp(start, end, amt) {
        return (1-amt)*start+amt*end
    }

    preload() {
        this.load.image('camera', 'assets/sprites/temp_camera.gif');
        this.load.image('wall', 'assets/sprites/temp_wall.png');
    }   

    create() {
        // add camera sprite
        this.cameraSprite = this.add.image(game.config.width / 2, game.config.height - 50, 'camera');
        this.cameraSprite.setScale(3);
        this.cameraSprite.setDepth(20);
        this.cameraSprite.setAlpha(1);

        // add multiple scrolling wall
        let wallCount = 12;
        for (let i = 0; i < wallCount; i++) {
            let wall = new Wall(this, game.config.width / 2, game.config.height / 2, 'wall', 1/wallCount * i);
            this.walls.push(wall);
        }
    }

    update(time, delta) {
        // update all walls
        this.walls.forEach(wall => {
            wall.update(time, delta);
        });

        // update camera
        this.cameraSprite.setPosition(this.cameraSprite.x, game.config.height - 50 - Math.abs(Math.sin(time / 200) * 20));
    }

    stopGame() {
        this.gameOver = true;
    }
}