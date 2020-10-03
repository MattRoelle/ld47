import * as Phaser from 'phaser';
import globals from '../globals';
import { BaseScene } from "../scenes/BaseScene";

export type PieceShape = 'circle' | 'square' | 'triangle'
export type ConveyorType = 'top' | 'bottom';

const PIECE_TYPE_SPRITE_KEYS: { [k in PieceShape]: string } = {
    circle: 'piece-circle',
    square: 'piece-square',
    triangle: 'piece-triangle'
}

const CONVEYOR_POS_FNS: { [k in ConveyorType]: (t: number) => [number,number] } = {
    bottom: t => {
        return [
            t * globals.WIDTH,
            globals.HEIGHT * 0.8
        ];
    },
    top: t => {
        return [
            (1 - t) * globals.WIDTH,
            globals.HEIGHT * 0.2
        ];
    }
}

export class Piece extends Phaser.GameObjects.Sprite {
    pieceType: PieceShape;
    dead: boolean = false;

    constructor(
        scene: BaseScene,
        pieceType: PieceShape,
        public conveyorType: ConveyorType,
        public conveyorSpeed: number,
        public spawnTime: number
    ) {
        super(scene, 0, 0, PIECE_TYPE_SPRITE_KEYS[pieceType]);
        scene.add.existing(this);
        this.pieceType = pieceType;
        this.setOrigin(0.5, 0.5)
    }

    update(time: number, delta: number) {
        const t = (time - this.spawnTime) / this.conveyorSpeed;
        
        const [x, y] = CONVEYOR_POS_FNS[this.conveyorType](t);
        this.x = x;
        this.y = y;
        if (t > 1.1) {
            this.destroy();
            this.dead = true;
        }
    }
}