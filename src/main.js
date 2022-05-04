// Collaborator names:
// - Sam Feng
// - Jose Salas
// - Ryoma Marta-Sugawara 

// Game title:
// - Spooky Picture Game Deluxe

// Date completed:
// - 5/2/2022

// Creative tilt:
// - Beautiful Pixel Art
// - Spooky Music
// - Dynamic Sound Effects
// - Pseudo 3D
// 

var config = {
    type: Phaser.AUTO,
    scale: {
        mode: Phaser.Scale.FIT,
        parent: 'phaser-example',
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: window.innerWidth / 1.6875,
        height: window.innerHeight / 1.6875, //what does this constant do? -ryoma
        scale: {
            mode: Phaser.Scale.FIT,
            autoCenter: Phaser.Scale.CENTER_BOTH
        },
        banner: false,
    },
    pixelArt: true,
    scene: [Menu, Play, Over],
    callbacks: {
        postBoot: function (game) {
          // In v3.15, you have to override Phaser's default styles
          game.canvas.style.width = '100%';
          game.canvas.style.height = '100%';
        }
    }
};

let game = new Phaser.Game(config);

// code adapted from http://ex-artist.com/CMPM120/Tutorials/Phaser%203%20Rocket%20Patrol%20Tutorial.html
// set UI sizes
let borderUISize = game.config.height / 15;
let borderPadding = borderUISize / 3;

// reserve keyboard vars
let keyESC, keySPACE;

// all the ghosts type
const normalGhost = 0;
const heartGhost = 1;
const splitGhost = 2;
const fastGhost = 3;

// all the level infos
const easyLevel = [
    "",
];

//scoring variables
let distance = 0;
let previousScore = 0;
let scoreString = "";

// const resize = ()=>{
//     game.scale.resize(window.innerWidth / 1.6875, window.innerHeight / 1.6875)
// }

// window.addEventListener('resize', resize);
// resize();

console.log(window.innerWidth);
console.log(window.innerHeight);