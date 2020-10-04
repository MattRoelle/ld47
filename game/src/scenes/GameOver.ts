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

export class GameOver extends BaseScene {
    constructor() {
        super({
            key: 'game-over'
        })
    }

    create() {
        this.hasClicked = false;

        this.fadeIn();

        this.add.text(globals.WIDTH / 2, 100, "GAME OVER")
            .setColor("white")
            .setStroke("#000", 4)
            .setFontStyle("bold")
            .setFontSize(14)
            .setOrigin(0.5, 0.5);

        this.add.text(globals.WIDTH / 2, 150, "score: " + globals.SCORE)
            .setColor("white")
            .setStroke("#000", 4)
            .setFontStyle("bold")
            .setFontSize(14)
            .setOrigin(0.5, 0.5);

        this.input.addPointer();
    }

    hasClicked = false;
    update(time: number, delta: number) {
        if (!this.hasClicked && this.input.mousePointer.isDown) {
            this.hasClicked = true;
            this.fadeOut('title')
        }
    }


    preload() {
        this.load.image("title", "/assets/export-title.png");
        this.load.image("play-btn", "/assets/export-play-btn.png");
        this.load.image("tutorial-btn", "/assets/export-tutorial-btn.png");
    }
}