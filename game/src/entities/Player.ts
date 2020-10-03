import debugService from "../debugService";
import globals from "../globals";
import helpers from "../helpers";
import { BaseScene } from "../scenes/BaseScene";
import { MainScene } from "../scenes/MainScene";
import { Piece } from "./Piece";

const N_TUBE_PIECES = 20;

export class Player extends Phaser.GameObjects.Container {
    clawBase: Phaser.GameObjects.Sprite;

    baseRotation: number = 4 * Math.PI;
    baseRotationDelta: number = 0;
    targetBaseRotationDelta: number = 0;

    clawDirection: 'inward' | 'outward' = 'outward';
    clawExtLength: number = 2.5;
    clawContainer: Phaser.GameObjects.Container;
    innertube: Phaser.GameObjects.Sprite;
    eyes: Phaser.GameObjects.Sprite;
    tubePieces: Phaser.GameObjects.Sprite[];
    clawTip: Phaser.GameObjects.Sprite;
    ropeGraphics: Phaser.GameObjects.Graphics;
    base: Phaser.GameObjects.Sprite;
    head: Phaser.GameObjects.Sprite;
    glass: Phaser.GameObjects.Sprite;
    pieces: Piece[];

    clawTheta: number = 0;
    ropeStartX: number = 0;
    ropeStartY: number = 0;
    grabbing: boolean = false;
    grabbingPiece: Piece;
    pauseTime: number = 0;

    constructor(
        scene: MainScene,
        public rotationDuration: number
    ) {
        super(scene, 0, 0);

        scene.add.existing(this);
        this.pieces = scene.pieces;

        this.innertube = scene.centerOriginSprite("player-innertube");
        this.innertube.setOrigin(0.5, 0.5)
        this.innertube.setDepth(1000);

        this.base = scene.centerOriginSprite("player-base");
        this.base.setOrigin(0.5, 0.5)
        this.base.setDepth(1100);

        this.head = scene.centerOriginSprite("player-head", 9, -20);
        this.head.setDepth(1150);
        this.head.setOrigin(0.5, 0.5)
        this.ropeGraphics = scene.add.graphics();
        this.ropeGraphics.setDepth(1100)
        this.eyes = scene.centerOriginSprite("player-eyes", 24, -14);
        this.eyes.setOrigin(0.5, 0.5)
        this.eyes.setDepth(1175)

        this.tubePieces = [];
        for (let i = 0; i < N_TUBE_PIECES; i++) {
            const spr = scene.centerOriginSprite(i % 2 == 0 ? "player-tube1" : "player-tube-2");
            this.tubePieces.push(spr);
        }

        this.glass = scene.centerOriginSprite("player-head-glass");
        this.glass.setBlendMode(Phaser.BlendModes.MULTIPLY);
        this.glass.setPosition(10, -21)
        this.glass.setDepth(1300)
        this.glass.setOrigin(0.5, 0.5)
        this.glass.alpha = 0.75;

        this.baseRotation = 0;

        this.clawBase = scene.add.sprite(28, 15, "claw-base");
        this.clawBase.setOrigin(0.5, 0.5)

        this.clawTip = scene.add.sprite(28, 15, "claw");
        this.clawTip.setOrigin(0.5, 0)
        this.clawTip.setDepth(1800)


        // scene.add.existing(this);
    }

    getClosestPiece() {
        const piecesByDist =
            this.pieces
                .filter(piece => piece.grabbable)
                .map(piece => ({
                    distance: helpers.dist(piece, this),
                    piece
                }));


        if (piecesByDist.length > 0) {
            piecesByDist.sort((a, b) => a.distance - b.distance);
            return piecesByDist[0].piece;
        }

        return null;
    }

    grab() {
        if (this.grabbing) return;

        const cp = this.getClosestPiece();
        if (!cp) return;

        this.grabbing = true;
        this.grabbingPiece = cp;


        this.scene.tweens.add({
            targets: this.clawTip,
            x: cp.x,
            y: cp.y,
            duration: 300,
            ease: 'Power2',
            onComplete: () => {
                this.scene.tweens.add({
                    targets: this.clawTip,
                    x: globals.WIDTH / 2,
                    y: globals.HEIGHT / 2,
                    duration: 300,
                    ease: 'Power2',
                    onComplete: () => {
                        this.grabbing = false;
                    }
                })
            }
        })
    }

    // toggleClawDirection(d: 1 | -1 = -1) {
    //     this.clawDirection = this.clawDirection === 'inward' ? 'outward' : 'inward'
    //     this.targetBaseRotationDelta += Math.PI * d;
    // }

    draw3dObjs() {
        const playerWidth = 20;
        const playerHeight = 11;
        const originX = 29;
        const originY = 5;
        const theta = this.baseRotation || 0;
        const x = Math.cos(theta) * playerWidth;
        const y = Math.sin(theta) * playerHeight;

        this.eyes.x = (Math.cos(theta) * 3) + 0;
        this.eyes.y = (Math.sin(theta) * 3) - 2;
        // this.eyes.x = (Math.cos(theta) * 12) + 15;
        // this.eyes.y = (Math.sin(theta) * 5) + 5;

        // if (this.eyes.y < 5) {
        //     this.eyes.setDepth(1125)
        // } else {
        //     this.eyes.setDepth(1175)
        // }

        this.eyes.x += this.head.x;
        this.eyes.y += this.head.y;

        this.sendToBack(this.innertube);

        for (let i = 0; i < N_TUBE_PIECES; i++) {
            const angle = (i / N_TUBE_PIECES) * Math.PI * 2;
            const tubePiece = this.tubePieces[i];

            this.sendToBack(tubePiece);

            tubePiece.x = this.x + (Math.cos(theta - Math.PI + angle) * playerWidth * 1.17) - 5;
            tubePiece.y = this.y + (Math.sin(theta - Math.PI + angle) * playerHeight * 0.8) - 4;
            tubePiece.setDepth(tubePiece.y);
        }
    }

    drawClaw(delta: number) {
        const cp = this.getClosestPiece();

        let theta: number;
        let magnitude: number;

        if (cp) {
            const dx = this.x - cp.x;
            const dy = this.y - cp.y;
            theta = Math.atan2(dy, dx) + Math.PI;
            // magnitude = helpers.dist(this, cp);
            magnitude = 100;
            debugService.circle(cp.x, cp.y, 10, 0x00FFaa)
        } else {
            theta = 3 * Math.PI / 2;
            magnitude = 25;
        }

        this.clawTheta = helpers.lerpRadians(this.clawTheta, theta, delta * 0.1)

        // theta = (((Date.now()) % 2000) / 2000) * Math.PI * 2;

        if (!this.grabbing) {
            this.clawTip.x = helpers.lerp(this.clawTip.x, this.x + Math.cos(this.clawTheta) * 30, delta * 0.2);
            this.clawTip.y = helpers.lerp(this.clawTip.y, this.y - 10 + Math.sin(this.clawTheta) * 30, delta * 0.2);
        }
        this.clawTip.rotation = helpers.lerpRadians(this.clawTip.rotation, this.clawTheta + Math.PI / -2, delta * 0.5);

        this.ropeStartX = this.x + Math.cos(this.clawTheta) * 26;
        this.ropeStartY = -10 + this.y + Math.sin(this.clawTheta) * 12;

        this.clawBase.x = this.ropeStartX;
        this.clawBase.y = this.ropeStartY;

        if (this.ropeStartY > this.y - 10) {
            this.ropeGraphics.setDepth(1150)
            this.clawBase.setDepth(1160)
        } else {
            this.clawBase.setDepth(1010)
            this.ropeGraphics.setDepth(1000)
        }

        this.ropeGraphics.clear();
        this.ropeGraphics.lineStyle(6, 0x000000);
        this.ropeGraphics.beginPath();
        this.ropeGraphics.moveTo(this.ropeStartX, this.ropeStartY);
        this.ropeGraphics.lineTo(this.clawTip.x, this.clawTip.y);
        this.ropeGraphics.closePath();
        this.ropeGraphics.stroke();
    }


    update(time: number, delta: number) {
        const t = (((time - this.pauseTime) % this.rotationDuration) / this.rotationDuration) * Math.PI * 2;
        const x = 26 + Math.cos(t) * globals.ARENA_W * (globals.WIDTH / 2);
        const y = 20 + Math.sin(t) * globals.ARENA_H * (globals.HEIGHT / 2);
        const bobY = Math.sin(t * 4) * 0;

        // if (!this.grabbing) {
            this.x = x + globals.WIDTH / 2.3;
            this.y = y + 50 + bobY + globals.HEIGHT / 4;
        // }

        this.innertube.x = this.x;
        this.innertube.y = this.y;
        this.base.x = this.x;
        this.base.y = this.y - 10;
        this.head.x = this.x;
        this.head.y = this.y - 20;
        this.glass.x = this.x;
        this.glass.y = this.y - 20;

        this.drawClaw(delta);
        this.draw3dObjs();

        this.baseRotationDelta = helpers.lerp(this.baseRotationDelta, this.targetBaseRotationDelta, delta * 0.075);
        this.baseRotation = t + this.baseRotationDelta;
    }
}