import * as Phaser from 'phaser';
import helpers from '../helpers';
import { MainScene } from "../scenes/MainScene";
import { GrabbablePieceType, Piece, PIECES, PieceType } from './Piece';

interface Recipe {
    base: PieceType;
    mid: PieceType;
    tip: PieceType;
}

export const RECIPES = {
    BASIC: { base: PIECES.base1, mid: PIECES.mid1, tip: PIECES.tip1 } as Recipe
}

export class GameDirector {
    availablePiecePool: PieceType[] = [
        PIECES.base1,
        PIECES.mid1,
        PIECES.tip1
    ];

    recipes: Recipe[] = [
        RECIPES.BASIC
    ];

    pieceSpawnRate = 750;
    lastSpawnedPieceAt = -1000;
    piecesSpawned = 0;
    conveyorRate = 11000;

    constructor(public scene: MainScene) {
        scene.time.addEvent({
            callback: this.tick.bind(this),
            repeat: -1,
            delay: 16,
        })
    }
    
    tick() {
        const t = this.scene.time.now;
        if (t - this.lastSpawnedPieceAt > this.pieceSpawnRate) {
            this.lastSpawnedPieceAt = t;
            this.spawnPiece();
        }
    }
    
    validateCenter() {
        const pieces = this.scene.player.piecesInCenter;

        if (pieces.length > 3) {
            return false;
        }

        console.log('pieces[0]?.pieceType.category', pieces[0]?.pieceType.category);
        

        if (pieces.length > 0 && pieces[0].pieceType.category !== 'base') return false;
        if (pieces.length > 1 && pieces[1].pieceType.category !== 'middle') return false;
        if (pieces.length > 2 && pieces[2].pieceType.category !== 'tip') return false;

        return true;
    }

    spawnPiece() {
        this.scene.pieces.push(new Piece(this.scene, helpers.sample(this.availablePiecePool), Math.random() > 0.5 ? 'top' : 'bottom', this.conveyorRate, this.scene.time.now));

        if (!this.validateCenter()) {
            this.scene.player.explode();
        }
    }
}