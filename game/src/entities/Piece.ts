import * as Phaser from 'phaser';
import globals from '../globals';
import helpers from '../helpers';
import { BaseScene } from "../scenes/BaseScene";

export type ConveyorLayout = 'top' | 'bottom';

export interface GrabbablePieceType {
    conveyor: false;
    spriteKey: string;
    category: 'tip' | 'middle' | 'base';
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
        category: 'tip',
    } as PieceType,
    mid1: {
        conveyor: false,
        spriteKey: 'rocket-mid-1',
        category: 'tip',
    } as PieceType,
    base1: {
        conveyor: false,
        spriteKey: 'rocket-base-1',
        category: 'tip',
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

    constructor(
        scene: BaseScene,
        pieceType: PieceType,
        public conveyorType: ConveyorLayout,
        public conveyorSpeed: number,
        public spawnTime: number,
        public depth: number = 0
    ) {
        super(scene, 0, 0, pieceType.spriteKey);
        scene.add.existing(this);
        this.pieceType = pieceType;
        this.setOrigin(0.5, 0.5)

        if (this.pieceType.conveyor) {
            this.setOrigin(1, 0.5)
            this.scene.children.sendToBack(this);
        } else {
            this.setDepth(5000)
        }

        this.hasSetInitialDirection = false;
    }

    update(time: number, delta: number) {
        if (this.dead) return;

        if (this.grabbed) return;


        const t = (time - this.spawnTime) / this.conveyorSpeed;
        this.t = t;

        const ct = (t * this.conveyor.length) % 1;

        const node = this.conveyor[Math.floor(t * this.conveyor.length)];
        const nextNode = this.conveyor[Math.floor(t * this.conveyor.length) + 1];

        if (!nextNode) {
            this.destroy();
            this.dead = true;
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
    }
}