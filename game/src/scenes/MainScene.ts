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
    gears: any[];
    healthLights: HealthLight[];
    health: number = 5;

    create() {
        //@ts-ignore
        window.scene = this;

        this.input.addPointer();

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

        const conveyorBase = this.centerOriginSprite("bg-conveyor-base").setPosition(globals.WIDTH / 2, globals.HEIGHT / 2).setOrigin(0.5, 0.5);
        conveyorBase.setDepth(-300000000000)
        this.centerOriginSprite("bg-water").setPosition(globals.WIDTH / 2, globals.HEIGHT / 2).setOrigin(0.5, 0.5)
        this.centerOriginSprite("top").setPosition(globals.WIDTH / 2, globals.HEIGHT / 2).setOrigin(0.5, 0.5)
        this.centerOriginSprite("frame").setPosition(globals.WIDTH / 2, globals.HEIGHT / 2).setOrigin(0.5, 0.5).setDepth(1000000000000)

        this.player = new Player(this);
        graphicsService.init(this);

        this.director = new GameDirector(this);

        for (let i = 0; i < 30; i++) {
            const t = BASE_CONVEYOR_SPEED;
            const st = (i / 30) * BASE_CONVEYOR_SPEED;
            this.conveyorPieces.push(new Piece(this, PIECES.conveyor, 'top', t, this.time.now - st, -20000000000 - i));
            this.conveyorPieces.push(new Piece(this, PIECES.conveyor, 'bottom', t, this.time.now - st, -20000000000 - i));
        }

        const ngears = 6;
        this.gears = [];

        this.gears.push(
            this.add.sprite(20, 20, 'gear').setScale(1.1, 1.1).setDepth(1000000000000000),
            this.add.sprite(10, 0, 'gear').setScale(1.4, 1.4).setDepth(1000000000000000),
            this.add.sprite(35, 5, 'gear').setScale(1.2, 1.2).setDepth(1000000000000000),
            this.add.sprite(102, 2 + globals.HEIGHT / 2, 'gear').setScale(2, 2).setDepth(1000000000000000),
            this.add.sprite(globals.WIDTH - 102, 2 + globals.HEIGHT / 2, 'gear').setScale(2, 2).setDepth(1000000000000000),
        );

        for(let g of this.gears) {
                // @ts-ignore
            g.speed = 0.8 + Math.random() * 3;
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


        // this.add
        //     .sprite(410, 210, 'order-tv')
        //     .setDepth(10000000000000000)

        // this.add
        //     .sprite(410, 50, 'order-tv')
        //     .setDepth(10000000000000000)

        this.healthLights = [
            new HealthLight(this, 0),
            new HealthLight(this, 1),
            new HealthLight(this, 2),
            new HealthLight(this, 3),
            new HealthLight(this, 4),
        ]
    }

    update(time: number, delta: number) {

        delta /= 16;
        graphicsService.update(this);
        this.player.update(time, delta);

        const cp = this.player.getClosestPiece();
        for (let p of this.pieces) {
            p.highlighted = p === cp;
            p.update(time, delta)
        }
        this.pieces = this.pieces.filter(p => !p.dead);
        this.player.pieces = this.pieces;

        for (let p of this.conveyorPieces) {
            p.update(time, delta)
        }
        this.conveyorPieces = this.conveyorPieces.filter(p => !p.dead);

        for (let u of this.orders) {
            u.update(time, delta);
        }
        this.orders = this.orders.filter(p => !p.dead);

        this.director.tick();

        for (let g of this.gears) {
            g.angle += delta * g.speed;
        }
    }


    preload() {
        this.load.image("bg-conveyor-base", "/assets/export-bg-conveyor-base.png");
        this.load.image("bg-top-1", "/assets/export-bg-top-1.png");
        this.load.image("bg-water-1", "/assets/export-bg-water-1.png");
        this.load.image("bg-water", "/assets/export-bg-water.png");
        this.load.image("bg", "/assets/export-bg.png");
        this.load.image("center-plate", "/assets/export-center-plate.png");
        this.load.image("claw-base", "/assets/export-claw-base.png");
        this.load.image("claw", "/assets/export-claw.png");
        this.load.image("conveyor-base", "/assets/export-conveyor-base.png");
        this.load.image("conveyor-piece", "/assets/export-conveyor-piece.png");
        this.load.image("frame", "/assets/export-frame.png");
        this.load.image("guide", "/assets/export-guide.png");
        this.load.image("order-progress-bar", "/assets/export-order-progress-bar.png");
        this.load.image("order-tv", "/assets/export-order-tv.png");
        this.load.image("order-ui", "/assets/export-order-ui.png");
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
        this.load.image("preview-full", "/assets/export-preview-full.png");
        this.load.image("progress-bar", "/assets/export-progress-bar.png");
        this.load.image("rocket-base-1", "/assets/export-rocket-base-1.png");
        this.load.image("rocket-mid-1", "/assets/export-rocket-mid-1.png");
        this.load.image("rocket-tip-1", "/assets/export-rocket-tip-1.png");
        this.load.image("single-rocket", "/assets/export-single-rocket.png");
        this.load.image("splash-particle-1", "/assets/export-splash-particle-1.png");
        this.load.image("top", "/assets/export-top.png");
        this.load.image("water", "/assets/export-water.png");
        this.load.image("highlight", "/assets/export-highlight.png");
        this.load.image("rocket-tip-2", "/assets/export-rocket-tip-2.png");


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

        this.load.image("gear", "/assets/export-gear.png");
        this.load.image("health-light-glow", "/assets/export-health-light-glow.png");
        this.load.image("health-light-off", "/assets/export-health-light-off.png");
        this.load.image("health-light", "/assets/export-health-light.png");
    }
}