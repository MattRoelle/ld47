import * as Phaser from 'phaser';
import * as _ from 'lodash';
import globals from '../globals';
import graphicsService from '../graphicsService';
import { Player } from '../entities/Player';
import { BaseScene } from './BaseScene';
import { Piece, PIECES, PieceType } from '../entities/Piece';
import helpers from '../helpers';
import { GameDirector } from '../entities/GameDirector';
import { Order } from '../entities/Order';
import { HealthLight } from '../entities/HealthLight';

export class TitleScene extends BaseScene {
    constructor() {
        super({
            key: 'title'
        })
    }

    create() {
        this.add.graphics().fillStyle(0x444444).fillRect(0, 0, globals.WIDTH, globals.HEIGHT)
        this.add.sprite(globals.WIDTH/2, globals.HEIGHT/2, "title").setOrigin(0.5, 0.5);

        this.add.sprite(globals.WIDTH / 2, 120, "play-btn").setOrigin(0.5, 0).setInteractive().addListener("pointerdown", () => {
            this.fadeOut('main')
        });

        this.add.sprite(globals.WIDTH  / 2, 160, "tutorial-btn").setOrigin(0.5, 0).setInteractive().addListener("pointerdown", () => {
            this.fadeOut('tutorial')
        });

        this.fadeIn();

        this.sound.play("theme", {
            loop: true,
            name: 'bgm',
        });
    }

    update(time: number, delta: number) {
    }


    preload() {
        this.load.image("title", "/assets/export-title.png");
        this.load.image("play-btn", "/assets/export-play-btn.png");
        this.load.audio("theme", "/assets/theme.wav")
        this.load.image("tutorial-btn", "/assets/export-tutorial-btn.png");
    }
}