import * as Phaser from 'phaser';
import globals from './globals';
import ScaleManager from './scaleManager';
import { MainScene } from './scenes/MainScene';

const game = new Phaser.Game({
    type: Phaser.WEBGL,
    width: globals.WIDTH,
    height: globals.HEIGHT,
    scale: {
        mode: Phaser.Scale.FIT
    },
    scene: MainScene,
    render: {
        pixelArt: true,
        roundPixels: true,
    },
    callbacks: {
        postBoot: () => {
            // new ScaleManager(game.canvas, !game.device.os.desktop);
        }
    },

    physics: {
        default: 'arcade',
        arcade: {
            debug: true,
            gravity: { y: 1000 },
        }
    },
});
