import * as Phaser from 'phaser';
import globals from './globals';
import ScaleManager from './scaleManager';
import { GameOver } from './scenes/GameOver';
import { MainScene } from './scenes/MainScene';
import { TitleScene } from './scenes/TitleScene';
import { TutorialScene } from './scenes/TutorialScene';

const game = new Phaser.Game({
    type: Phaser.WEBGL,
    width: globals.WIDTH,
    height: globals.HEIGHT,
    scale: {
        mode: Phaser.Scale.FIT
    },
    scene: [
        TitleScene,
        TutorialScene,
        MainScene,
        GameOver
    ],
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
