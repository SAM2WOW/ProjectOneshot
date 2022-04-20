class Play extends Phaser.Scene {
    constructor() {
        super("play");

        // player variables
        this.health = 3;

        // game states
        this.gameOver = false;

        game.scrollingSpeed = 0.003;
        game.turningOffset = 0;

        this.walls = [];
        this.ghosts = [];

    }

    // helpful lerp function
    lerp(start, end, amt) {
        return (1-amt)*start+amt*end
    }

    // global position finder
    get3DSpace(xOffset, yOffset, time, progress) {
        let curvedProgress = progress ** 5;
        let x = game.config.width / 2 + xOffset * curvedProgress + this.lerp(game.turningOffset, 0, progress);
        let y = game.config.height / 2 + yOffset * curvedProgress - Math.abs(Math.sin(time / 200) * 20) * (curvedProgress);
        return {x: x, y: y, curvedProgress: curvedProgress};
    }

    preload() {
        this.load.image('camera', 'assets/sprites/temp_camera.gif');
        this.load.image('wall', 'assets/sprites/temp_wall.png');
    }   

    create() {
        // add multiple scrolling wall
        let wallCount = 12;
        for (let i = 0; i < wallCount; i++) {
            let wall = new Wall(this, game.config.width / 2, game.config.height / 2, 'wall', 1/wallCount * i);
            this.walls.push(wall);
        }

        // add camera sprite
        this.cameraSprite = this.add.image(game.config.width / 2, game.config.height - 50, 'camera');
        this.cameraSprite.setScale(3);
        this.cameraSprite.setDepth(50);
        this.cameraSprite.setAlpha(0.5);

        // add frame
        this.frame = new Frame(this, 0, 0, 'camera');
        this.frame.setDepth(50);



        // add ghost
        this.spawnGhost();
    }

    update(time, delta) {
        // game over
        if (this.gameOver) {
            return;
        }

        // hey make some turns!!
        //game.turningOffset = Math.cos(time / 600) * 200;

        // update all walls
        this.walls.forEach(wall => {
            wall.update(time, delta);
        });

        // update camera
        this.cameraSprite.setPosition(this.cameraSprite.x, game.config.height - 50 - Math.abs(Math.sin(time / 200) * 20));

        // update ghosts
        this.ghosts.forEach(ghost => {
            ghost.update(time, delta);
        });

        // update frame
        this.frame.update(time, delta);
    }

    spawnGhost() {
        let x = Math.random() * 200;
        let y = Math.random() * 200;
        let ghost = new Ghost(this, x - 200, y - 200, 'camera');
        this.ghosts.push(ghost);
    }

    stopGame() {
        this.gameOver = true;
    }
}