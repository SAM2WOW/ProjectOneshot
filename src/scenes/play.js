class Play extends Phaser.Scene {
    constructor() {
        super("play");

        // player variables
        this.health = 3;
        this.distance = 0;

        // game states
        this.gameOver = false;

        game.scrollingSpeed = 0.003;
        game.turningOffset = 0;

        this.walls = [];
        this.ghosts = new Phaser.GameObjects.Group(this);
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
        this.load.image('frame', 'assets/sprites/temp_frame.png');
        this.load.image('ghost', 'assets/sprites/temp_ghost.png');

        this.load.audio('shoot', 'assets/sounds/shoot.mp3');
        this.load.audio('focus', 'assets/sounds/focus.mp3');
    }   

    create() {
        // add multiple scrolling wall
        let wallCount = 12;
        for (let i = 0; i < wallCount; i++) {
            let wall = new Wall(this, game.config.width / 2, game.config.height / 2, 'wall', 1/wallCount * i);
            this.walls.push(wall);
        }

        // add camera
        this.cameraSprite = this.add.image(game.config.width / 2, game.config.height - 50, 'camera');
        this.cameraSprite.setScale(3);
        this.cameraSprite.setDepth(100);
        this.cameraSprite.setAlpha(0.5);

        this.dynamicCamera = this.add.renderTexture(360, game.config.height / 2, game.config.width, game.config.width);
        this.dynamicCamera.setOrigin(0.5, 0.5);
        this.dynamicCamera.setDepth(110);
        this.dynamicCamera.setScale(0.1);


        // add frame
        this.frame = new Frame(this, game.config.width / 2, game.config.height / 2, 'frame');
        this.frame.setDepth(100);

        // add ghost
        this.spawnGhost();
        this.spawnGhost();
        this.spawnGhost();

        // add text
        this.distanceText = this.add.text(game.config.width / 2, 0, Math.round(this.distance) + 'm');
        this.distanceText.setDepth(100);
        this.distanceText.setOrigin(0.5, 0);
        this.distanceText.setFontSize(32);

        // add health text
        this.healthText = this.add.text(10, game.config.height - 50, "❤️".repeat(this.health));
        this.healthText.setDepth(100);
        this.healthText.setFontSize(30);
        this.healthText.setOrigin(0, 0);
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

        // update camera and dynamic texture
        this.dynamicCamera.fill(0x000000);
        this.dynamicCamera.draw(this.children, 0, 0);
        this.dynamicCamera.setPosition(this.cameraSprite.x + 10, this.cameraSprite.y + 25);
        //this.cameraSprite.setPosition(this.cameraSprite.x, game.config.height - 50 - Math.abs(Math.sin(time / 200) * 20));

        // update ghosts
        this.ghosts.getChildren().forEach(ghost => {
            ghost.update(time, delta);
        });

        // update frame
        this.frame.update(time, delta);

        // update distance traveled
        this.distance += (delta / 16) * 0.0284;
        this.distanceText.setText(Math.round(this.distance) + 'm');
    }

    spawnGhost() {
        let x = Math.random() * 200;
        let y = Math.random() * 200;
        let ghost = new Ghost(this, x - 200, y - 200, 'ghost');
        //this.ghosts.push(ghost);
        this.ghosts.add(ghost);

    }

    damage() {
        this.health--;
        this.healthText.setText("❤️".repeat(this.health));

        if (this.health <= 0) {
            this.stopGame();
        }
    }

    stopGame() {
        //this.gameOver = true;

        this.scene.start("over");
    }
}