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
        this.cameraSprite.setAlpha(0.5);

        // add multiple scrolling wall
        for (let i = 1; i <= 8; i++) {
            let wall = new Wall(this, game.config.width / 2, game.config.height / 2, 'wall', i * 1500);
            this.walls.push(wall);
        }
    }

    update(time, delta) {
        // update all walls
        this.walls.forEach(wall => {
            wall.update(time, delta);
        });
    }

    stopGame() {
        this.gameOver = true;
    }
}