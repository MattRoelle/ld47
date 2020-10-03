import { matches } from 'lodash';
import * as Phaser from 'phaser';
import helpers from '../helpers';
import { MainScene } from "../scenes/MainScene";
import { Order, Recipe, RECIPES } from './Order';
import { GrabbablePieceType, Piece, PIECES, PieceType } from './Piece';

export class GameDirector {
    availablePiecePool: PieceType[] = [
        PIECES.base1,
        PIECES.mid1,
        PIECES.tip1
    ];

    recipes: Recipe[] = [
        RECIPES.BASIC,
        RECIPES.BASIC_FULL
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

        if (pieces.length === 0) return true;

        // Find at least 1 matching order
        for (let order of this.scene.orders) {
            let matchesOrder = true;

            for (let i = 0; i < pieces.length; i++) {
                const recipePieces = order.recipe.pieces;
                if (i >= recipePieces.length) continue;
                if (recipePieces[i] != pieces[i].pieceType) {
                    matchesOrder = false;
                }
            }

            if (matchesOrder) {
                this.completeOrder(order);
                return true;
            }
        }

        return false;
    }

    completeOrder(order: Order) {
        console.log("Order complete")
    }

    newOrder() {
        const order = new Order(this.scene, helpers.sample(this.recipes), 15000);
        this.scene.orders.push(order);
    }

    spawnPiece() {
        this.scene.pieces.push(new Piece(this.scene, helpers.sample(this.availablePiecePool), Math.random() > 0.5 ? 'top' : 'bottom', this.conveyorRate, this.scene.time.now));

        if (!this.validateCenter()) {
            this.scene.player.explode();
        }

        if (this.scene.orders.length < 1) {
            this.newOrder();
        }
    }
}