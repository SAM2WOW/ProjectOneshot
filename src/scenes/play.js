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

        this.cameraOffsetY = 0;
        this.cameraShake = 20;
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

        //loading images as a group to look good
        this.load.path = 'assets/sprites/';

        this.load.image('camera', 'temp_camera.gif');
        this.load.image('wall', 'hallway_01.png');
        this.load.image('frame', 'temp_frame.png');
        this.load.image('eyeaf', 'focus.png');

        //loading ghost atlas (key, spritesheet, json file)
        // this.load.atlas("some_ghosts", "some_ghosts.png", "some_ghosts.json");
        // this.textures.addSpriteSheetFromAtlas("normal_ghost", {atlas: "some_ghosts", frame: "normal", frameHeight: 240, frameWidth: 240});
        // this.textures.addSpriteSheetFromAtlas("heart_ghost", {atlas: "some_ghosts", frame: "heart", frameHeight: 240, frameWidth: 240});
        this.load.spritesheet("some_ghosts", "some_ghosts.png", {frameWidth: 240, frameHeight: 240, startFrame: 0, endFrame: 10});

        //loading sounds
        this.load.path = 'assets/sounds/';

        this.load.audio('shoot', 'shoot.mp3');
        this.load.audio('focus', 'focus.mp3');
        this.load.audio('hurt', 'hurt.mp3');
        this.load.audio('death', 'death.mp3'); //i cant figure out how to make this one work, leaving it here for now. supposed to play on death.

    }   

    create() {
        //add ghosts animations
        this.anims.create({
            key: 'normal_ghost_normal',
            frames: this.anims.generateFrameNumbers('some_ghosts', {start: 0, end: 1}),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'normal_ghost_perfect',
            frames: this.anims.generateFrameNumbers('some_ghosts', {start: 2, end: 3}),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'normal_ghost_hurt',
            frames: this.anims.generateFrameNumbers('some_ghosts', {start: 4, end: 5}),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'heart_ghost_normal',
            frames: this.anims.generateFrameNumbers('some_ghosts', {start: 6, end: 7}),
            frameRate: 6,
            repeat: -1
        });
        this.anims.create({
            key: 'heart_ghost_perfect',
            frames: this.anims.generateFrameNumbers('some_ghosts', {start: 8, end: 9}),
            frameRate: 6,  
            repeat: -1
        });

        // add multiple scrolling wall
        let wallCount = 14;
        for (let i = 0; i < wallCount; i++) {
            let wall = new Wall(this, game.config.width / 2, game.config.height / 2, 'wall', 1.2/wallCount * i);
            this.walls.push(wall);
        }

        // add camera
        this.cameraSprite = this.add.image(game.config.width / 2, game.config.height, 'camera');
        this.cameraSprite.setScale(3);
        this.cameraSprite.setDepth(100);
        this.cameraSprite.setAlpha(1);

        this.dynamicCamera = this.add.renderTexture(360, game.config.height / 2, game.config.width, game.config.width);
        this.dynamicCamera.setOrigin(0.5, 0.5);
        this.dynamicCamera.setDepth(110);
        this.dynamicCamera.setScale(0.1);

        // add frame
        this.frame = new Frame(this, game.config.width / 2, game.config.height / 2, 'frame');
        this.frame.setDepth(100);

        // add ghost
        this.spawnGhost(normalGhost);
        this.spawnGhost(fastGhost);
        this.spawnGhost(heartGhost);

        // add text
        this.distanceText = this.add.text(game.config.width / 2, 0, Math.round(this.distance) + 'm', {fontFamily: "PixelFont"});
        this.distanceText.setPosition(game.config.width / 2, 30);
        this.distanceText.setDepth(100);
        this.distanceText.setOrigin(0.5, 0);
        this.distanceText.setFontSize(40);
        this.distanceText.setShadow(0, 2, '#000000', 0, false, true);

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
        game.turningOffset = Math.cos(time / 600) * 200;

        // update all walls
        this.walls.forEach(wall => {
            wall.update(time, delta);
        });

        // update camera and dynamic texture
        this.cameraSprite.setPosition(this.cameraSprite.x, game.config.height + this.cameraOffsetY - Math.abs(Math.sin(time / 200) * this.cameraShake));
        this.dynamicCamera.fill(0x000000);
        this.dynamicCamera.draw(this.children, 0, 0);
        this.dynamicCamera.setPosition(this.cameraSprite.x + 10, this.cameraSprite.y + 25);

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

    spawnGhost(type) {
        // let frames = ["normal_ghost", "heart_ghost"];
        let x = Math.random() * 400;
        let y = Math.random() * 400;
        let ghost = new Ghost(this, x - 200, y - 200, "some_ghosts", type);
        this.ghosts.add(ghost);
    }

    damage() {
        this.health--;
        this.healthText.setText("❤️".repeat(this.health));
    

        if (this.health <= 0) {
            this.stopGame();
        }
    }

    heal() {
        this.health = Phaser.Math.Clamp(this.health + 1, 0, 3);
        this.healthText.setText("❤️".repeat(this.health));
    }

    stopGame() {
        this.gameOver = true;
        

        this.scene.remove(this);
        
        this.scene.start("over");
    }
}