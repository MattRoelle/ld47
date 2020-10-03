import debugService from "../debugService";
import globals from "../globals";
import helpers from "../helpers";
import { BaseScene } from "../scenes/BaseScene";
import { Piece } from "./Piece";

const N_TUBE_PIECES = 20;

export class Player extends Phaser.GameObjects.Container {
    clawBase: Phaser.GameObjects.Sprite;

    clawAngle: number = 4 * Math.PI;
    clawAngleDelta: number = 0;
    targetClawAngleDelta: number = 0;

    clawDirection: 'inward' | 'outward' = 'outward';
    clawExtLength: number = 2.5;
    clawContainer: Phaser.GameObjects.Container;
    innertube: Phaser.GameObjects.Sprite;
    eyes: Phaser.GameObjects.Sprite;
    tubePieces: Phaser.GameObjects.Sprite[];
    clawTip: Phaser.GameObjects.Sprite;
    ropeGraphics: Phaser.GameObjects.Graphics;

    constructor(
        scene: BaseScene,
        public rotationDuration: number
    ) {
        super(scene, 0, 0);

        scene.add.existing(this);
        this.setDepth(2000)
        this.innertube = scene.centerOriginSprite("player-innertube");
        this.add(scene.centerOriginSprite("player-base", 9, -10))
        this.add(scene.centerOriginSprite("player-head", 9, -20))
        this.ropeGraphics = scene.add.graphics();
        this.ropeGraphics.setDepth(1100)
        this.add(this.eyes = scene.centerOriginSprite("player-eyes", 24, -14))
        this.tubePieces = [];
        for (let i = 0; i < N_TUBE_PIECES; i++) {
            const spr = scene.centerOriginSprite(i % 2 == 0 ? "player-tube1" : "player-tube-2");
            this.tubePieces.push(spr);
        }

        const glass = scene.centerOriginSprite("player-head-glass");
        glass.setBlendMode(Phaser.BlendModes.MULTIPLY);
        glass.setPosition(10, -21)
        glass.alpha = 0.75;
        this.add(glass);

        this.clawAngle = 0;

        this.clawBase = scene.add.sprite(28, 15, "claw-base");
        this.clawBase.setOrigin(0.5, 0)
        this.add(this.clawBase);

        this.clawTip = scene.add.sprite(28, 15, "claw");
        this.clawTip.setOrigin(0.5, 0)
        this.add(this.clawTip);


        // scene.add.existing(this);
    }

    grab(piece: Piece) {

    }

    toggleClawDirection(d: 1 | -1 = -1) {
        this.clawDirection = this.clawDirection === 'inward' ? 'outward' : 'inward'
        this.targetClawAngleDelta += Math.PI * d;
    }

    setClawRotation() {
        const playerWidth = 20;
        const playerHeight = 11;
        const originX = 29;
        const originY = 5;
        const theta = this.clawAngle || 0;
        const x = Math.cos(theta) * playerWidth;
        const y = Math.sin(theta) * playerHeight;

        this.clawBase.x = x + originX;
        this.clawBase.y = y + originY;
        if (this.clawBase.y > 8) {
            this.bringToTop(this.clawBase);
        } else {
            this.sendToBack(this.clawBase);
        }
        this.clawBase.rotation = this.clawAngle - Math.PI / 2;

        this.clawTip.x = (x * this.clawExtLength) + originX;
        this.clawTip.y = (y * this.clawExtLength) + originY;

        if (this.clawTip.y > 8) {
            this.bringToTop(this.clawTip);
        } else {
            this.sendToBack(this.clawTip);
        }
        this.clawTip.rotation = this.clawAngle - Math.PI / 2;

        this.eyes.x = (Math.cos(theta) * 2) + 24;
        this.eyes.y = (Math.sin(theta) * 2) - 14;

        this.sendToBack(this.innertube);

        for (let i = 0; i < N_TUBE_PIECES; i++) {
            const angle = (i / N_TUBE_PIECES) * Math.PI * 2;
            const piece = this.tubePieces[i];

            this.sendToBack(piece);

            piece.x = this.x + (Math.cos(theta - Math.PI + angle) * playerWidth * 1.17) + 25;
            piece.y = this.y + (Math.sin(theta - Math.PI + angle) * playerHeight * 0.8) + 11;
            piece.setDepth(piece.y);
        }

        this.ropeGraphics.clear();
        this.ropeGraphics.lineStyle(4, 0x000000);
        this.ropeGraphics.beginPath();
        this.ropeGraphics.moveTo(this.x + this.clawBase.x, this. y +this.clawBase.y);
        this.ropeGraphics.lineTo(this.x + this.clawTip.x, this.y + this.clawTip.y);
        this.ropeGraphics.closePath();
        this.ropeGraphics.stroke();
    }


    get clawTipPos() {
        return {
            x: this.x + this.clawBase.x + Math.cos(this.clawAngle) * 37,
            y: this.y + this.clawBase.y + Math.sin(this.clawAngle) * 37
        };
    }

    update(time: number, delta: number) {
        const t = ((time % this.rotationDuration) / this.rotationDuration) * Math.PI * 2;
        const x = Math.cos(t) * globals.ARENA_W * globals.WIDTH / 2;
        const y = 5 + (Math.sin(t) * globals.ARENA_H * globals.HEIGHT / 2);
        const bobY = Math.sin(t * 4) * 0;

        debugService.circle(this.clawTipPos.x, this.clawTipPos.y, 10, 0xFe4545);

        this.x = x + globals.WIDTH / 2.3;
        this.y = y + 50 + bobY + globals.HEIGHT / 4;
        this.innertube.x = this.x;
        this.innertube.y = this.y;
        this.innertube.setDepth(1000)
        this.setClawRotation();

        this.clawAngleDelta = helpers.lerp(this.clawAngleDelta, this.targetClawAngleDelta, delta * 0.075);
        this.clawAngle = t + this.clawAngleDelta;
    }
}