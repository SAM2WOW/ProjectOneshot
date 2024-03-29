class Play extends Phaser.Scene {
    constructor() {
        super("play");
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
        
        this.load.image('camera', 'camera.png');
        this.load.image('wall1', 'hallway_01.png');
        this.load.image('wall2', 'hallway_02.png');
        this.load.image('wall3', 'hallway_03.png');
        this.load.image('wall_shadow_1', 'hallway_shadow_01.png');
        this.load.image('wall_shadow_2', 'hallway_shadow_02.png');
        this.load.image('wall_shadow_3', 'hallway_shadow_03.png');
        this.load.image('frame', 'focus_frame.png');
        this.load.image('ui_frame', 'frame_UI.png');
        this.load.image('ui_perfect', 'combo_bottom.png');
        this.load.image('eyeaf', 'focus.png');
        this.load.image('wisps', 'ghost_particles.png');
        
        //scrapped atlas implmenetation
        //loading ghost atlas (key, spritesheet, json file)
        // this.load.atlas("some_ghosts", "some_ghosts.png", "some_ghosts.json");
        // this.textures.addSpriteSheetFromAtlas("normal_ghost", {atlas: "some_ghosts", frame: "normal", frameHeight: 240, frameWidth: 240});
        // this.textures.addSpriteSheetFromAtlas("heart_ghost", {atlas: "some_ghosts", frame: "heart", frameHeight: 240, frameWidth: 240});
        this.load.spritesheet("some_ghosts", "some_ghosts.png", {frameWidth: 240, frameHeight: 240, startFrame: 0, endFrame: 10});
        
        this.load.spritesheet('health', 'heart_UI.png', {frameWidth: 117, frameHeight: 35, startFrame: 0, endFrame: 6});
        
        //loading sounds
        this.load.path = 'assets/sounds/';
        
        this.load.audio('bgm', 'bgm.ogg');
        this.load.audio('shoot', 'shoot.mp3');
        this.load.audio('focus', 'focus.mp3');
        this.load.audio('heart', 'heart.mp3');
        this.load.audio('hurt', 'hurt.mp3');
        this.load.audio('ghost_kill', 'ghost_kill.mp3');
        this.load.audio('perfect', 'perfect.mp3');
        this.load.audio('death', 'death.mp3'); //i cant figure out how to make this one work, leaving it here for now. supposed to play on death.
        
        this.load.audio('ghost_hurt1', 'ghost_hurt1.mp3');
        this.load.audio('ghost_hurt2', 'ghost_hurt2.mp3');
        this.load.audio('ghost_hurt3', 'ghost_hurt3.mp3');
        this.load.audio('ghost_hurt4', 'ghost_hurt4.mp3');
        this.load.audio('ghost_hurt5', 'ghost_hurt5.mp3');
        this.load.audio('ghost_attack1', 'ghost_attack1.mp3');
        this.load.audio('ghost_attack2', 'ghost_attack2.mp3');
        this.load.audio('ghost_attack3', 'ghost_attack3.mp3');
        this.load.audio('ghost_attack4', 'ghost_attack4.mp3');
        this.load.audio('ghost_attack5', 'ghost_attack5.mp3');
    }   
    
    create() {
        // player variables
        this.health = 3;
        distance = 0;
    
        // game states
        this.gameOver = false;
    
        game.scrollingSpeed = 0.003;
        game.turningOffset = 0;
    
        this.walls = new Phaser.GameObjects.Group(this);
        this.ghosts = new Phaser.GameObjects.Group(this);
    
        this.cameraOffsetY = 0;
        this.cameraShake = 20;

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
        this.anims.create({
            key: 'heart_ghost_hurt',
            frames: this.anims.generateFrameNumbers('some_ghosts', {start: 10, end: 11}),
            frameRate: 6,
            repeat: -1
        });

        // add multiple scrolling wall
        let wallCount = 14;
        for (let i = 0; i < wallCount; i++) {
            let type = 1;
            if (i % 4 == 0) {
                type = Math.random() > 0.5 ? 2 : 3;
            }

            let wall = new Wall(this, game.config.width / 2, game.config.height / 2, 'wall' + type, 1.2/wallCount * i, false);
            this.walls.add(wall);

            let wallShadow = new Wall(this, game.config.width / 2, game.config.height / 2, 'wall_shadow_' + type, 1.2/wallCount * i - 0.01);
            this.walls.add(wallShadow);

            // add a slick spawning effect
            wall.alpha = 0;
            wallShadow.alpha = 0;
            this.tweens.add({
                targets: [wall, wallShadow],
                duration: 1000,
                delay: i * 100,
                angle: {from: -90 + 12.8 * i, to: 0},
                alpha: {from: 0, to: 1},
                ease: 'Cubic.easeOut',
                onComplete: () => {
                }
            });
        }

        this.cameras.main.fadeIn(500);

        // add camera
        this.cameraSprite = this.add.image(game.config.width / 2, game.config.height, 'camera');
        this.cameraSprite.setScale(3);
        this.cameraSprite.setDepth(100);
        this.cameraSprite.setAlpha(1);

        this.dynamicCamera = this.add.renderTexture(360, game.config.height / 2, game.config.width, game.config.width);
        this.dynamicCamera.setOrigin(0.5, 0.5);
        this.dynamicCamera.setDepth(110);
        this.dynamicCamera.setDisplaySize(84, 66);

        // add frame
        this.frame = new Frame(this, game.config.width / 2, game.config.height / 2, 'frame');
        this.frame.setDepth(150);
        
        // add text
        this.distanceText = this.add.text(game.config.width / 2, 0, Math.round(distance) + 'm', {fontFamily: "PixelFont"});
        this.distanceText.setPosition(game.config.width / 2, 30);
        this.distanceText.setDepth(100);
        this.distanceText.setOrigin(0.5, 0);
        this.distanceText.setFontSize(40);
        this.distanceText.setShadow(0, 2, '#1e2e67', 0, false, true);
        this.tweens.add({
            targets: this.distanceText,
            duration: 500,
            y: {from: 0, to: this.distanceText.y},
            ease: 'Cubic.easeOut',
        });

        // add health        
        this.healthBar = this.add.image(game.config.width / 2, + 100, 'health', 0);
        this.healthBar.setDepth(140);
        this.healthBar.setOrigin(0.5, 0.5);
        this.tweens.add({
            targets: this.healthBar,
            duration: 500,
            y: {from: 0, to: this.healthBar.y},
            ease: 'Cubic.easeOut',
        });
        
        // add background music
        this.bgm = this.sound.add('bgm');
        this.bgm.loop = true;
        this.bgm.volume = 0.3;
        this.bgm.play();

        // initial delay call for random add ghost
        this.time.delayedCall(500, () => {
            this.spawnGhost();
        });

        // initial delay call for turning
        this.time.delayedCall(3000, () => {
            this.makeTurn();
        });

        //particles researched from https://rexrainbow.github.io/phaser3-rex-notes/docs/site/particles/
        //particle manager
        this.particles = this.add.particles('wisps');
        //particle emitter
        this.emitter = this.particles.createEmitter({
            x: {min: 0, max: 100},
            y: {min:0, max: 100},
            speed: 50,
            lifespan: 1500,
            blendMode: 'LUMINOSITY',
            frequency: 5,
            //alpha: {start: 1, end: 0},
            scale: {start: 1, end: 0},
            on: false
        });

        //keys!
        this.keySPACE = this.input.keyboard.addKey('SPACE');

    }

    update(time, delta) {
        // game over
        if (this.gameOver) {
            return;
        }

        // hey make some turns!!
        // game.turningOffset = Math.cos(time / 600) * 200;

        // update all walls
        this.walls.getChildren().forEach(wall => {
            wall.update(time, delta);
        });

        // update camera and dynamic texture
        this.cameraSprite.setPosition(this.cameraSprite.x, game.config.height + this.cameraOffsetY - Math.abs(Math.sin(time / 200) * this.cameraShake));
        this.dynamicCamera.fill(0x000000);
        // this.dynamicCamera.draw(this.children, 0, 0);
        this.dynamicCamera.draw(this.walls, 0, 0);
        this.dynamicCamera.draw(this.ghosts, 0, 0);
        this.dynamicCamera.setPosition(this.cameraSprite.x + 9, this.cameraSprite.y + 24);

        // update ghosts
        this.ghosts.getChildren().forEach(ghost => {
            ghost.update(time, delta);
        });

        // update frame
        this.frame.update(time, delta);

        // update distance traveled
        distance += (delta / 16) * 0.0284;
        this.distanceText.setText(Math.round(distance) + 'm');
    }
    
    makeTurn() {
        let duration = Math.random() * 4000 + 2000;
        let offset = Math.random() * 600 - 300;
        this.tweens.add({
            targets: game,
            duration: duration,
            turningOffset: {from: 0, to: offset},
            ease: 'Sine.easeInOut',
            yoyo: true,
        });

        this.time.delayedCall(duration * 2 + this.lerp(500, 5000, Math.random()), () => {
            this.makeTurn();
        });
    }

    spawnGhost() {
        let spawnAmount = Math.round(Math.random() * 3);
        let spawnSlot = [-200, -100, 0, 100, 200];
        let xPos = [];
        let yPos = [];

        // spawnSlot[Math.floor(Math.random() * spawnSlot.length)]

        // find random non overlapping numbers
        while (xPos.length < spawnAmount) {
            let randomNum = Math.floor(Math.random() * spawnSlot.length);
            if (!xPos.includes(randomNum)) {
                xPos.push(randomNum);
            }
        }

        while (yPos.length < spawnAmount) {
            let randomNum = Math.floor(Math.random() * spawnSlot.length);
            if (!yPos.includes(randomNum)) {
                yPos.push(randomNum);
            }
        }

        // spawn ghosts
        xPos.forEach((x, i) => {
            let y = yPos[i];
            let isSpecial = Math.random() > 0.7;
            let type = isSpecial ? [heartGhost, fastGhost][Math.round(Math.random())] : normalGhost;
            let ghost = new Ghost(this, spawnSlot[x] + this.lerp(-50, 50, Math.random()), spawnSlot[y] + this.lerp(-50, 50, Math.random()), "some_ghosts", type);
            this.ghosts.add(ghost);
        });

        // spawn next ghost
        let maxTime = this.lerp(5000, 1200, Phaser.Math.Clamp(distance / 100, 0, 1));
        let minTime = this.lerp(2000, 800, Phaser.Math.Clamp(distance / 100, 0, 1));
        this.time.delayedCall(this.lerp(minTime, maxTime, Math.random()), () => {
            this.spawnGhost();
        });
    }

    damage() {
        this.health--;
        // this.healthText.setText("❤️".repeat(this.health));
        
        this.healthBar.setFrame(5 - (this.health * 2));   
        this.healthBar.setTintFill(0xd77bba);       
        this.time.delayedCall(150, () => {
            this.healthBar.setFrame(6 - (this.health * 2));  
            this.healthBar.clearTint();  
        });

        //play hurt noise
        this.sfxhurt = this.sound.add('hurt');
        this.sfxhurt.play();

        if (this.health <= 0) {
            this.stopGame();
        }
    }

    heal() {
        if (this.health >= 3) {
            return;
        }

        this.health++;
        // this.healthText.setText("❤️".repeat(this.health));

        this.healthBar.setFrame(7 - (this.health * 2));     
        this.healthBar.setTintFill(0xfcba03);   
        this.time.delayedCall(150, () => {
            this.healthBar.setFrame(6 - (this.health * 2));
            this.healthBar.clearTint();  
        });

        //play heal noise
        this.sfxheal = this.sound.add('heart');
        this.sfxheal.detune = this.lerp(0, 500, Math.random());
        this.sfxheal.volume = this.lerp(0.5, 1, Math.random());
        this.sfxheal.play();
    }

    stopGame() {
        previousScore = Math.round(distance);
        scoreString = previousScore + 'm!!';
        this.gameOver = true;
        
        this.bgm.stop();

        this.time.delayedCall(700, () => {
            this.cameras.main.fadeOut(300);
        });

        this.time.delayedCall(1000, () => {
            this.scene.start("over");
        });
    }
}