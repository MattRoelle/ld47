import * as Phaser from 'phaser';
import * as _ from 'lodash';
import globals from '../globals';
import debugService from '../debugService';
import { Player } from '../entities/Player';
import { BaseScene } from './BaseScene';

const SCREEN_TRANSITION_TIME = 200;

export class MainScene extends BaseScene {
    f: Phaser.Input.Keyboard.Key;
    player: Player;
    waterSpin1: Phaser.GameObjects.Sprite;

    create() {
        this.f = this.input.keyboard.addKey('f');
        this.f.onDown = (ev) => {
            // @ts-ignore
            this.game.canvas[this.game.device.fullscreen.request]();
        };

        this.centerOriginSprite("bg-water-1");
        // this.waterSpin1 = this.centerOriginSprite("bg-water-spin-1", globals.WIDTH * 0.3, 0)
        this.centerOriginSprite("bg-wall-1");
        this.centerOriginSprite("bg-outer-1");
        this.centerSprite("center-plate");

        this.player = new Player(this, 4500);
        debugService.init(this);
    }

    update(time: number, delta: number) {
        delta /= 16;
        debugService.update(this);
        this.player.update(time, delta);
        // this.waterSpin1.rotation += delta * 0.01;
    }


    preload() {
        this.load.image("bg-outer-1", "/assets/export-bg-outer-1.png");
        this.load.image("bg-wall-1", "/assets/export-bg-wall-1.png");
        this.load.image("bg-water-1", "/assets/export-bg-water-1.png");
        this.load.image("bg-water-spin-1", "/assets/export-bg-water-spin-1.png");
        this.load.image("center-plate", "/assets/export-center-plate.png");
        this.load.image("claw", "/assets/export-claw.png");
        this.load.image("player-base", "/assets/export-player-base.png");
        this.load.image("player-eyes", "/assets/export-player-eyes.png");
        this.load.image("player-head-glass", "/assets/export-player-head-glass.png");
        this.load.image("player-head", "/assets/export-player-head.png");
        this.load.image("player-innertube", "/assets/export-player-innertube.png");
    }
}