import * as Phaser from 'phaser';
import globals from '../globals';
import helpers from '../helpers';
import { BaseScene } from "../scenes/BaseScene";

export type ConveyorLayout = 'top' | 'bottom';

export interface GrabbablePieceType {
    conveyor: false;
    spriteKey: string;
    height: number;
}

interface ConveyorPieceType {
    conveyor: true;
    spriteKey: 'conveyor-piece'
}

export type PieceType = ConveyorPieceType | GrabbablePieceType;

export const PIECES = {
    conveyor: {
        conveyor: true,
        spriteKey: 'conveyor-piece'
    } as PieceType,
    tip1: {
        conveyor: false,
        spriteKey: 'rocket-tip-1',
        height: 33
    } as PieceType,
    mid1: {
        conveyor: false,
        spriteKey: 'rocket-mid-1',
        height: 20
    } as PieceType,
    base1: {
        conveyor: false,
        spriteKey: 'rocket-base-1',
        height: 21
    } as PieceType,
    single: {
        conveyor: false,
        spriteKey: 'single-rocket',
        height: 21
    } as PieceType,
}

const SEMI_CIRCLE_CONVEYOR: [number, number][] = [
    [-0.25, 0.56],
    [0, 0.56],
    [0.18, 0.55],
    [0.27, 0.79],
    [0.42, 0.94],
    [0.58, 0.94],
    [0.73, 0.79],
    [0.82, 0.55],
    [1, 0.56],
    [1.25, 0.56],
]

const CONVEYOR_NODES: { [k in ConveyorLayout]: [number, number][] } = {
    bottom: SEMI_CIRCLE_CONVEYOR.map(node => [node[0], node[1] + 0.025]),
    top: SEMI_CIRCLE_CONVEYOR.map(node => [1 - node[0], 1.02 - node[1]])
}

export class Piece extends Phaser.GameObjects.Sprite {
    pieceType: PieceType;
    dead: boolean = false;
    currentNodeIdx: number = 0;
    hasSetInitialDirection: boolean;
    t: number = 0;
    grabbed: boolean = false;

    exploding: boolean = false;
    flyOffAngle: number;
    flyOffSpeed: number;
    particles: Phaser.GameObjects.Particles.ParticleEmitterManager;
    highlighted: boolean;
    highlight: Phaser.GameObjects.Sprite;

    get grabbable() {
        return !this.pieceType.conveyor && this.t > 0.05 && this.t < 0.95 && !this.grabbed;
    }

    get conveyor() {
        return CONVEYOR_NODES[this.conveyorType];
    }

    gotoNextNode() {
        this.currentNodeIdx++;
        this.currentNodeIdx %= this.conveyor.length;
    }

    startThruster() {
        this.particles = this.scene.add.particles("splash-particle-1");
        this.particles.createEmitter({
            follow: this,
            frequency: 50,
            speed: 100,
            blendMode: Phaser.BlendModes.ADD,
            alpha: 1,
            lifespan: 400,
            angle: {
                min: 70,
                max: 110
            },
            scale: {
                min: 2,
                max: 5
            },
        });
        this.particles.createEmitter({
            follow: this,
            frequency: 50,
            speed: 100,
            blendMode: Phaser.BlendModes.ADD,
            alpha: 1,
            lifespan: 400,
            angle: {
                min: 70,
                max: 110
            },
            scale: {
                min: 2,
                max: 5
            },
            tint: 0xFF4444,
        });
    }

    constructor(
        scene: BaseScene,
        pieceType: PieceType,
        public conveyorType: ConveyorLayout,
        public conveyorSpeed: number,
        public spawnTime: number,
        public depth: number = 0
    ) {
        super(scene, -100, -100, pieceType.spriteKey);
        scene.add.existing(this);
        this.pieceType = pieceType;
        this.setOrigin(0.5, 0.5)

        if (this.pieceType.conveyor) {
            this.setOrigin(1, 0.5)
            // this.setBlendMode(Phaser.BlendModes.MULTIPLY)
            // this.setAlpha(0.4)
            this.scene.children.sendToBack(this);
        } else {
            this.setDepth(5000)
            // this.highlight = scene.add.sprite(0, 0, "highlight").setDepth(5001)
            // this.highlight.setBlendMode(Phaser.BlendModes.ADD)
            // this.highlight.setAlpha(0.6);
            // this.highlight.setMask(new Phaser.Display.Masks.BitmapMask(scene, this))
        }

        this.hasSetInitialDirection = false;
    }

    update(time: number, delta: number) {
        if (this.dead) return;

        if (this.exploding) {
            this.x += Math.cos(this.flyOffAngle) * this.flyOffSpeed * delta;
            this.y += Math.sin(this.flyOffAngle) * this.flyOffSpeed * delta;
            this.rotation += delta * 0.05;
            return;
        }

        if (this.grabbed) return;



        const t = (time - this.spawnTime) / this.conveyorSpeed;
        this.t = t;

        const ct = (t * this.conveyor.length) % 1;

        const node = this.conveyor[Math.floor(t * this.conveyor.length)];
        const nextNode = this.conveyor[Math.floor(t * this.conveyor.length) + 1];

        if (!nextNode) {
            this.die();
        } else {
            this.x = helpers.lerp(node[0], nextNode[0], ct) * globals.WIDTH;
            this.y = helpers.lerp(node[1], nextNode[1], ct) * globals.HEIGHT;

            const dx = nextNode[0] - node[0];
            const dy = nextNode[1] - node[1];

            const directionAngle = Math.atan2(dy, dx);
            if (!this.hasSetInitialDirection) {
                this.rotation = directionAngle;
                this.hasSetInitialDirection = true;
            } else {
                this.rotation = helpers.lerpRadians(this.rotation, directionAngle, delta * 0.1);
            }

            if (ct > 1) {
                this.gotoNextNode();
            }
        }

        // if (this.highlight) {
        //     this.highlight.setAlpha(this.highlighted && !this.grabbed ? 1 : 0)
        //     this.highlight.x = this.x;
        //     this.highlight.y = this.y;
        // }
    }

    die() {
        this.dead = true;
        this.destroy();
    }
}