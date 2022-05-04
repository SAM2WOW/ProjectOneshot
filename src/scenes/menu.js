class Menu extends Phaser.Scene {
    constructor() {
        super("menu");
    }

    preload() {
        //this.load.spritesheet('tutorial', 'assets/Tutorial.png', { frameWidth: 360, frameHeight: 360 });
        this.load.image('title', 'assets/sprites/spookylogo.png');
        
        //load audio
        this.load.path = 'assets/sounds/';
        this.load.audio('shoot', 'shoot.mp3');
        this.load.audio('focus', 'focus.mp3');
        this.load.audio('heart', 'heart.mp3');
        this.load.audio('hurt', 'hurt.mp3');
        this.load.audio('ghost_kill_perfect', 'ghost_kill_perfect.mp3');
        this.load.audio('perfect', 'perfect.mp3');
        
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
        this.credits = this.add.text(10, game.config.height - game.config.height / 10, ["Sam Feng", "Jose Salas", "Ryoma Marta-Sugawara", "UCSC CMPM 120-01 Spring '22"]);
        this.credits.setOrigin(0, 0);
        this.credits.setFontSize(8);


        this.input.on("pointerdown", () => {
            this.sfx2 = this.sound.add('ghost_attack5');
            this.sfx2.setDetune(-1500);
            this.sfx2.play();
            this.sfx1 = this.sound.add('ghost_kill_perfect');
            this.sfx1.play();
            this.scene.start("play");
        });

        this.titleSprite = this.add.image(game.config.width /2,  (game.config.height / 2) - 60, 'title').setOrigin(0.5,0.5);
        this.titleSprite.setScale(1.2 * (game.config.width/game.config.height));
        
        this.instruction1 = this.add.text((game.config.width / 2), (game.config.height / 2)+ 125, ["Tap/Click/Spacebar to Play", "'X' to show/hide tutorial"], {fontFamily: "PixelFont", align: "center"});
        this.instruction1.setOrigin(0.5, 0.5);
        this.instruction1.setFontSize(24);

        
        // add a slick spawning effect
        this.titleSprite.alpha = 0;
        this.tweens.add({
            targets: this.titleSprite,
            duration: 500,
            delay: 0,
            angle: {from: -90, to: 0},
            alpha: {from: 0, to: 1},
            ease: 'Cubic.easeInOut',
            onComplete: () => {
                //this.floatTitleUp();
            }
        });

        /*this.anims.create({
            key: 'tutorial',
            frames: this.anims.generateFrameNumbers('tutorial', { start: 0, end: 1, first: 0}),
            frameRate: 1,
            repeat: -1
        });

        this.tutorial = this.add.sprite(game.config.width / 2, game.config.height, 'tutorial').setOrigin(0.5, 1)
        this.tutorial.anims.play('tutorial');*/
    }
    //TODO: fix this later so title floats up and down
    /*floatTitleUp() {
        this.tweens.add({
            targets: this.titleSprite,
            duration: 500,
            delay: 0,
            y: {from: game.config.height / 2, to: (game.config.height / 2) + 20},
            ease: 'Cubic.easeIn',
            onComplete: () => {
                this.floatTitleDown();
            }
        });

    }
    floatTitleDown() {
        this.tweens.add({
            targets: this.titleSprite,
            duration: 500,
            delay: 0,
            y: {from: (game.config.height / 2) + 20, to: game.config.height / 2},
            ease: 'Cubic.easeIn',
            onComplete: () => {
                floatTitleDown();
            }
        });

    }*/ 
}