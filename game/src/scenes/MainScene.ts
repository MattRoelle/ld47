import * as Phaser from 'phaser';
import * as _ from 'lodash';
import globals from '../globals';
import debugService from '../debugService';
import { Player } from '../entities/Player';
import { BaseScene } from './BaseScene';
import { Piece, PIECES, PieceType } from '../entities/Piece';
import helpers from '../helpers';

const SCREEN_TRANSITION_TIME = 200;
const BASE_CONVEYOR_SPEED = 12000;

export class MainScene extends BaseScene {
    f: Phaser.Input.Keyboard.Key;
    player: Player;
    waterSpin1: Phaser.GameObjects.Sprite;
    a: Phaser.Input.Keyboard.Key;
    d: Phaser.Input.Keyboard.Key;
    space: Phaser.Input.Keyboard.Key;
    conveyorPieces: Piece[] = [];
    pieces: Piece[] = [];

    create() {
        //@ts-ignore
        window.scene = this;

        this.f = this.input.keyboard.addKey('f');
        this.f.onDown = (ev) => {
            // @ts-ignore
            this.game.canvas[this.game.device.fullscreen.request]();
        };

        this.a = this.input.keyboard.addKey('a');
        this.a.onDown = (ev) => {
        };

        this.d = this.input.keyboard.addKey('d');
        this.d.onDown = (ev) => {
        };

        this.space = this.input.keyboard.addKey('space');
        this.space.onDown = (ev) => {
            this.player.grab();
        };

        this.a = this.input.keyboard.addKey('a');
        this.d = this.input.keyboard.addKey('d');

        const conveyorBase = this.centerOriginSprite("bg-conveyor-base");
        conveyorBase.setDepth(-300000000000)
        this.centerOriginSprite("bg-water-1");
        this.centerOriginSprite("top");
        // this.waterSpin1 = this.centerOriginSprite("bg-water-spin-1", globals.WIDTH * 0.3, 0)
        this.centerOriginSprite("bg-outer-1");
        // this.centerSprite("center-plate");

        this.player = new Player(this, 6500);
        debugService.init(this);

        let piecesSpawned = 0;
        this.time.addEvent({
            callback: () => {
                let pieceType: PieceType = ([
                    PIECES.tip1,
                    PIECES.mid1,
                    PIECES.base1,
                ] as PieceType[])[piecesSpawned % 3];
                this.pieces.push(new Piece(this, pieceType, piecesSpawned % 2 === 0 ? 'top' : 'bottom', BASE_CONVEYOR_SPEED, this.time.now));
                piecesSpawned++;
            },
            repeat: -1,
            delay: 500
        });

        for (let i = 0; i < 30; i++) {
            const t = BASE_CONVEYOR_SPEED;
            const st = (i / 35) * BASE_CONVEYOR_SPEED;
            this.conveyorPieces.push(new Piece(this, PIECES.conveyor, 'top', t, this.time.now - st, -20000000000 - i));
            this.conveyorPieces.push(new Piece(this, PIECES.conveyor, 'bottom', t, this.time.now - st, -20000000000 - i));
        }

        this.time.addEvent({
            callback: () => {
                this.conveyorPieces.push(new Piece(this, PIECES.conveyor, 'top', BASE_CONVEYOR_SPEED, this.time.now, -10000000000 + this.time.now));
                this.conveyorPieces.push(new Piece(this, PIECES.conveyor, 'bottom', BASE_CONVEYOR_SPEED, this.time.now, -10000000000 + this.time.now));
            },
            repeat: -1,
            delay: 250
        });
    }

    update(time: number, delta: number) {

        delta /= 16;
        debugService.update(this);
        this.player.update(time, delta);

        for (let p of this.pieces) {
            p.update(time, delta)
        }
        this.pieces = this.pieces.filter(p => !p.dead);
        this.player.pieces = this.pieces;

        for (let p of this.conveyorPieces) {
            p.update(time, delta)
        }
        this.conveyorPieces = this.conveyorPieces.filter(p => !p.dead);
    }


    preload() {
        this.load.image("bg-conveyor-base", "/assets/export-bg-conveyor-base.png");
        this.load.image("bg-top-1", "/assets/export-bg-top-1.png");
        this.load.image("bg-water-1", "/assets/export-bg-water-1.png");
        this.load.image("bg", "/assets/export-bg.png");
        this.load.image("center-plate", "/assets/export-center-plate.png");
        this.load.image("claw-base", "/assets/export-claw-base.png");
        this.load.image("claw", "/assets/export-claw.png");
        this.load.image("conveyor-base", "/assets/export-conveyor-base.png");
        this.load.image("conveyor-piece", "/assets/export-conveyor-piece.png");
        this.load.image("guide", "/assets/export-guide.png");
        this.load.image("piece-circle", "/assets/export-piece-circle.png");
        this.load.image("piece-square", "/assets/export-piece-square.png");
        this.load.image("piece-triangle", "/assets/export-piece-triangle.png");
        this.load.image("player-base", "/assets/export-player-base.png");
        this.load.image("player-eyes", "/assets/export-player-eyes.png");
        this.load.image("player-head-glass", "/assets/export-player-head-glass.png");
        this.load.image("player-head", "/assets/export-player-head.png");
        this.load.image("player-innertube", "/assets/export-player-innertube.png");
        this.load.image("player-tube-2", "/assets/export-player-tube-2.png");
        this.load.image("player-tube1", "/assets/export-player-tube1.png");
        this.load.image("rocket-base-1", "/assets/export-rocket-base-1.png");
        this.load.image("rocket-mid-1", "/assets/export-rocket-mid-1.png");
        this.load.image("rocket-tip-1", "/assets/export-rocket-tip-1.png");
        this.load.image("top", "/assets/export-top.png");
        this.load.image("water", "/assets/export-water.png");
    }
}