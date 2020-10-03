import debugService from "../debugService";
import globals from "../globals";
import helpers from "../helpers";
import { BaseScene } from "../scenes/BaseScene";

const N_TUBE_PIECES = 20;

export class Player extends Phaser.GameObjects.Container {
    claw: Phaser.GameObjects.Sprite;

    clawAngle: number = 0;
    clawAngleDelta: number = 0;
    targetClawAngleDelta: number = 0;

    clawDirection: 'inward' | 'outward' = 'inward';
    clawContainer: Phaser.GameObjects.Container;
    innertube: Phaser.GameObjects.Sprite;
    eyes: Phaser.GameObjects.Sprite;
    tubePieces: Phaser.GameObjects.Sprite[];

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
        this.claw = scene.add.sprite(28, 15, "claw");
        this.claw.setOrigin(0.5, 0)
        this.add(this.claw);


        // scene.add.existing(this);
    }

    toggleClawDirection() {
        this.clawDirection = this.clawDirection === 'inward' ? 'outward' : 'inward'
        this.targetClawAngleDelta -= Math.PI;
    }

    setClawRotation() {
        const playerWidth = 20;
        const playerHeight = 11;
        const originX = 29;
        const originY = 5;
        const theta = this.clawAngle || 0;
        const x = Math.cos(theta) * playerWidth;
        const y = Math.sin(theta) * playerHeight;
        this.claw.x = x + originX;
        this.claw.y = y + originY;
        if (this.claw.y > 8) {
            this.bringToTop(this.claw);
        } else {
            this.sendToBack(this.claw);
        }
        this.claw.rotation = this.clawAngle - Math.PI / 2;

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
    }


    get clawTipPos() {
        return {
            x: this.x + this.claw.x + Math.cos(this.clawAngle) * 37,
            y: this.y + this.claw.y + Math.sin(this.clawAngle) * 37
        };
    }

    update(time: number, delta: number) {
        const t = ((time % this.rotationDuration) / this.rotationDuration) * Math.PI * 2;
        const x = Math.cos(t) * globals.ARENA_W * globals.WIDTH / 2;
        const y = 5 + (Math.sin(t) * globals.ARENA_H * globals.HEIGHT / 2);
        const bobY = Math.sin(t * 4) * 0;

        // debugService.circle(this.clawTipPos.x, this.clawTipPos.y, 10, 0xFe4545);

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