
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

export class TutorialScene extends BaseScene {
    constructor() {
        super({
            key: 'tutorial'
        })
    }

    create() {
        this.add.graphics().fillStyle(0x444444).fillRect(0, 0, globals.WIDTH, globals.HEIGHT)
        this.add.sprite(globals.WIDTH/2, globals.HEIGHT/2, "tutorial").setOrigin(0.5, 0.5).setInteractive().addListener("pointerdown", () => {
            this.fadeOut("title")
        });

        this.add.text(110, 18, "Use the mouse to grab rocket parts")
            .setColor("white")
            .setStroke("#000", 4)
            .setFontStyle("bold")
            .setFontSize(14)
            .setOrigin(0, 0.5);

        this.add.text(110, 38, "Watch for new orders on the left")
            .setColor("white")
            .setStroke("#000", 4)
            .setFontStyle("bold")
            .setFontSize(14)
            .setOrigin(0, 0.5);

        this.add.text(110, 58, "Get the highest score possible")
            .setColor("white")
            .setStroke("#000", 4)
            .setFontStyle("bold")
            .setFontSize(14)
            .setOrigin(0, 0.5);

        this.add.text(110, 78, "You only have 5 lives (right)")
            .setColor("white")
            .setStroke("#000", 4)
            .setFontStyle("bold")
            .setFontSize(14)
            .setOrigin(0, 0.5);

        this.fadeIn();
    }

    update(time: number, delta: number) {
    }


    preload() {
        this.load.image("tutorial", "/assets/export-tutorial.png");
    }
}