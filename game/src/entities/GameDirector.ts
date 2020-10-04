import { matches } from 'lodash';
import * as Phaser from 'phaser';
import helpers from '../helpers';
import { MainScene } from "../scenes/MainScene";
import { Order, Recipe, RECIPES } from './Order';
import { GrabbablePieceType, Piece, PIECES, PieceType } from './Piece';

export class GameDirector {
    availablePiecePool: PieceType[] = [
        PIECES.base1,
        PIECES.tip1
    ];

    recipes: Recipe[] = [
        RECIPES.BASIC,
    ];

    pieceSpawnRate = 750;
    lastSpawnedPieceAt = -1000;
    piecesSpawned = 0;
    conveyorRate = 11000;

    constructor(public scene: MainScene) {
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
        if (pieces.length > 3) return false;

        let isValid = false;

        // Find at least 1 matching order
        for (let order of this.scene.orders) {
            if (order.completed) continue;

            let matchesOrder = true;
            const recipePieces = order.recipe.pieces;

            for (let i = 0; i < pieces.length; i++) {
                if (i >= recipePieces.length) continue;
                if (recipePieces[i] != pieces[i].pieceType) {
                    matchesOrder = false;
                }
            }

            if (matchesOrder) {
                if (recipePieces.length === pieces.length) {
                    this.completeOrder(order);
                }
                isValid = true;
            }
        }

        return isValid;
    }

    completeOrder(order: Order) {
        console.log("Order complete")
        order.complete();
        this.scene.player.takeOff();
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