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
    orders: Order[] = [];
    director: GameDirector;

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
        this.centerOriginSprite("bg-water");
        this.centerOriginSprite("top");

        this.player = new Player(this, 6500);
        graphicsService.init(this);

        this.director = new GameDirector(this);

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

        this.anims.create({
            key: 'explode',
            frames: this.anims.generateFrameNumbers('explode', {
                first: 30,
                end: 69
            }),
            frameRate: 60,
            skipMissedFrames: true,
            delay: 0,
            repeat: 0,
            repeatDelay: 0
        });

        this.anims.create({
            key: 'splash',
            frames: this.anims.generateFrameNumbers('splash', {
                first: 38,
                end: 58
            }),
            frameRate: 60,
            skipMissedFrames: true,
            delay: 0,
            repeat: 0,
            repeatDelay: 0,
        });
    }

    update(time: number, delta: number) {

        delta /= 16;
        graphicsService.update(this);
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

        for(let u of this.orders) {
            u.update(time, delta);
        }
        this.orders = this.orders.filter(p => !p.dead);

        this.director.tick();
    }


    preload() {
        this.load.image("bg-conveyor-base", "/assets/export-bg-conveyor-base.png");
        this.load.image("bg-top-1", "/assets/export-bg-top-1.png");
        this.load.image("bg-water", "/assets/export-bg-water.png");
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
        this.load.image("order-ui", "/assets/export-order-ui.png");
        this.load.image("splash-particle-1", "/assets/export-splash-particle-1.png");


        this.load.spritesheet("explode", "/assets/animations/explode.png", {
            frameWidth: 100,
            frameHeight: 100,
            startFrame: 30,
            endFrame: 69
        });

        this.load.spritesheet("splash", "/assets/animations/water-splash.png", {
            frameWidth: 100,
            frameHeight: 100,
            startFrame: 36,
            endFrame: 58
        });
    }
}