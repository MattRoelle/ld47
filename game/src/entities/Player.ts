import graphicsService from "../graphicsService";
import globals from "../globals";
import helpers from "../helpers";
import { BaseScene } from "../scenes/BaseScene";
import { MainScene } from "../scenes/MainScene";
import { GrabbablePieceType, Piece } from "./Piece";

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
    hasPickedUpPiece: boolean = false;
    grabbingPiece: Piece;
    pauseTime: number = 0;
    clawBase2: Phaser.GameObjects.Sprite;

    piecesInCenter: Piece[] = [];
    exploding: boolean;
    lastSplashAt: number = -100;
    rotationDuration: number = 6500;
    targetRotationDuration: number = 6500;

    constructor(
        scene: MainScene,
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

        this.clawBase2 = scene.add.sprite(28, 15, "claw-base");
        this.clawBase2.setDepth(1900)
        this.clawBase2.setScale(0.75, 0.75)
        this.clawBase2.setOrigin(0.5, 0.5)

        this.clawTip = scene.add.sprite(28, 15, "claw");
        this.clawTip.setOrigin(0.5, 1)
        this.clawTip.setDepth(1800)

        this.setDepth(600);

        const particles = this.scene.add.particles('splash-particle-1')

        particles.createEmitter({
            follow: this,
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Ellipse(0, 0, 50, 40),
                quantity: 40
            },
            frequency: 20,
            speed: 30,
            blendMode: Phaser.BlendModes.ADD,
            alpha: 0.1,
            lifespan: 400,
            scale: {
                min: 0.3,
                max: 2
            }
        });

        particles.createEmitter({
            follow: this,
            emitZone: {
                type: 'edge',
                source: new Phaser.Geom.Ellipse(0, 0, 50, 40),
                quantity: 40
            },
            frequency: 25,
            speed: 30,
            blendMode: Phaser.BlendModes.ADD,
            alpha: 0.1,
            lifespan: 400,
            scale: {
                min: 0.4,
                max: 2
            }
        });
    }

    takeOff() {
        if (this.piecesInCenter.length === 0) return;

        const pcs = [...this.piecesInCenter];
        this.piecesInCenter = [];

        pcs[0].startThruster();

        this.scene.cameras.main.shake(1300, 0.004);

        this.scene.time.delayedCall(300, () => {
            for (let p of pcs) {
                p.setTint(0xFFFFFF);
                this.scene.tweens.add({
                    targets: p,
                    y: p.y - 300,
                    delay: 0,
                    duration: 1700,
                    ease: Phaser.Math.Easing.Quadratic.In,
                });
            }
            this.scene.time.delayedCall(1700, () => {
                this.scene.cameras.main.shake(200, 0.02);
            });
        })

    }

    explode() {
        // if (this.exploding) return;
        // this.exploding = true;


        const pcs = [...this.piecesInCenter];
        this.piecesInCenter = [];

        for (let p of pcs) {
            p.tintFill = true;
            p.setTintFill(0xFF0000)
        }

        const blinkTime = 125;

        this.scene.time.delayedCall(blinkTime, () => {
            for (let p of pcs) {
                p.tintFill = false;
            }
            this.scene.time.delayedCall(blinkTime, () => {
                for (let p of pcs) {
                    p.tintFill = true;
                }
                this.scene.time.delayedCall(blinkTime, () => {
                    for (let p of pcs) {
                        p.tintFill = false;
                    }
                    this.scene.time.delayedCall(blinkTime, () => {
                        for (let p of pcs) {
                            p.tintFill = true;
                        }
                        this.scene.time.delayedCall(blinkTime, () => {
                            helpers.explosion(globals.WIDTH / 2, globals.HEIGHT / 2, this.scene)
                            this.scene.cameras.main.shake(200, 0.025)
                            for (let p of pcs) {
                                p.tintFill = true;
                                p.setTint(0)
                                p.exploding = true;
                                p.flyOffAngle = Math.random() * 2 * Math.PI;
                                p.flyOffSpeed = 5 + (Math.random() * 3);
                            }
                        });
                    });
                });
            });
        });
    }

    getClosestPiece() {
        const piecesByDist =
            this.pieces
                .filter(piece => piece.grabbable)
                .map(piece => ({
                    distance: helpers.dist(piece, this),
                    piece
                }))
                .filter(piece => piece.distance < 100);


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

        this.scene.time.delayedCall(240, () => {
            this.hasPickedUpPiece = true;
            this.grabbingPiece.grabbed = true;
            this.grabbingPiece.rotation = 0;
            this.grabbingPiece.setDepth(100000 + this.piecesInCenter.length * 10);
        })

        const pieceType = this.grabbingPiece.pieceType as GrabbablePieceType;

        this.scene.tweens.add({
            targets: this.clawTip,
            x: cp.x,
            y: cp.y,
            duration: 300,
            ease: Phaser.Math.Easing.Quadratic.Out,
            onComplete: () => {
                // @ts-ignore
                const centerHeight = this.piecesInCenter.map(p => p.pieceType.height).reduce((a, b) => a + b, 0)
                this.piecesInCenter.push(this.grabbingPiece);
                this.scene.tweens.add({
                    targets: this.clawTip,
                    x: (globals.WIDTH / 2),
                    y: (globals.HEIGHT / 2) - centerHeight + 10,
                    duration: 300,
                    ease: Phaser.Math.Easing.Quadratic.Out,
                    completeDelay: 100,
                    onComplete: () => {
                        this.grabbing = false;
                        this.hasPickedUpPiece = false;
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

    calculateClawPosition(delta: number) {
        const cp = this.getClosestPiece();

        let theta: number;
        let magnitude: number;

        if (this.grabbing) {
            const tdx = this.clawTip.x - this.x;
            const tdy = this.clawTip.y - this.y;
            const tTheta = Math.atan2(tdy, tdx);
            theta = tTheta;
        } else {
            if (cp) {
                const dx = this.x - cp.x;
                const dy = this.y - cp.y;
                theta = Math.atan2(dy, dx) + Math.PI;
                // magnitude = helpers.dist(this, cp);
                magnitude = 100;
                graphicsService.circle(cp.x, cp.y, 30, 0xFFaa00)
            } else {
                theta = 3 * Math.PI / 2;
                magnitude = 25;
            }
        }

        this.clawTheta = helpers.lerpRadians(this.clawTheta, theta, delta * 0.075)

        // theta = (((Date.now()) % 2000) / 2000) * Math.PI * 2;
        if (!this.grabbing) {
            this.clawTip.x = helpers.lerp(this.clawTip.x, this.x + Math.cos(this.clawTheta) * 45, delta * 0.2);
            this.clawTip.y = helpers.lerp(this.clawTip.y, this.y - 10 + Math.sin(this.clawTheta) * 45, delta * 0.2);
        } else {
        }

        this.clawTip.rotation = helpers.lerpRadians(this.clawTip.rotation, this.clawTheta + Math.PI / -2, delta);
        this.ropeStartX = this.x + Math.cos(this.clawTheta) * 26;
        this.ropeStartY = -10 + this.y + Math.sin(this.clawTheta) * 12;

        this.clawBase.x = this.ropeStartX;
        this.clawBase.y = this.ropeStartY;

        const clawDist = helpers.dist(this, this.clawTip);
        const clawTheta = Math.atan2(this.clawTip.y - this.y, this.clawTip.x - this.x)
        this.clawBase2.x = this.x + Math.cos(clawTheta) * (clawDist - 15);
        this.clawBase2.y = this.y + Math.sin(clawTheta) * (clawDist - 15);

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
        this.ropeGraphics.lineTo(this.clawBase2.x, this.clawBase2.y);
        this.ropeGraphics.closePath();
        this.ropeGraphics.stroke();
    }


    update(time: number, delta: number) {
        this.rotationDuration = helpers.lerp(this.rotationDuration, this.targetRotationDuration, delta * 0.1);

        const t = (((time - this.pauseTime) % this.rotationDuration) / this.rotationDuration) * Math.PI * 2;
        const x = 26 + Math.cos(t) * globals.ARENA_W * (globals.WIDTH / 2);
        const y = 20 + Math.sin(t) * globals.ARENA_H * (globals.HEIGHT / 2);
        const bobY = Math.sin(t * 4) * 0;

        // if (!this.grabbing) {
        this.x = x + globals.WIDTH / 2.3;
        this.y = y + 50 + bobY + globals.HEIGHT / 4;
        // }

        if (this.grabbing && this.hasPickedUpPiece) {
            this.grabbingPiece.x = this.clawTip.x;
            this.grabbingPiece.y = this.clawTip.y;
        }

        this.innertube.x = this.x;
        this.innertube.y = this.y;
        this.base.x = this.x;
        this.base.y = this.y - 10;
        this.head.x = this.x;
        this.head.y = this.y - 20;
        this.glass.x = this.x;
        this.glass.y = this.y - 20;

        this.calculateClawPosition(delta);
        this.draw3dObjs();

        this.baseRotationDelta = helpers.lerp(this.baseRotationDelta, this.targetBaseRotationDelta, delta * 0.075);
        this.baseRotation = t + this.baseRotationDelta;

        if (time - this.lastSplashAt > 250) {
            this.lastSplashAt = time;
            for (let tp of this.tubePieces) {
                if (Math.random() > 0.5) {
                }
            }
        }
    }
}