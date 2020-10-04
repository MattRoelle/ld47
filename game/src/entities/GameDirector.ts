import { matches } from 'lodash';
import * as Phaser from 'phaser';
import helpers from '../helpers';
import { MainScene } from "../scenes/MainScene";
import { Order, Recipe, RECIPES } from './Order';
import { GrabbablePieceType, Piece, PIECES, PieceType } from './Piece';

interface Stage {
    availablePiecePool: PieceType[];
    recipes: Recipe[];
    nOrders: number;
    baseOrderDuration: number;
    conveyorSpeed: number;
    playerSpeed: number;
    maxOrders: number;
    orderRate: number;
    pieceSpawnRate: number;
}

const STAGES: Stage[] = [
    {
        availablePiecePool: [
            PIECES.single,
            PIECES.base1,
            PIECES.tip1
        ],
        recipes: [
            RECIPES.SINGLE,
            RECIPES.BASIC
        ],
        nOrders: 1,
        baseOrderDuration: 18000,
        conveyorSpeed: 16000,
        playerSpeed: 7500,
        maxOrders: 2,
        orderRate: 5000,
        pieceSpawnRate: 1250,
    },
    {
        availablePiecePool: [
            PIECES.single,
            PIECES.mid1,
            PIECES.base1,
            PIECES.tip1
        ],
        recipes: [
            RECIPES.SINGLE,
            RECIPES.BASIC_FULL,
            RECIPES.BASIC
        ],
        nOrders: 6,
        baseOrderDuration: 15000,
        conveyorSpeed: 14000,
        playerSpeed: 3000,
        maxOrders: 2,
        orderRate: 5000,
        pieceSpawnRate: 600,
    },
];

export class GameDirector {
    currentStageIdx: number = 0;
    lastSpawnedPieceAt = -1000;
    piecesSpawned = 0;
    nOrdersComplete = 0;
    lastOrderSpawnedAt = -1000;

    get stage() {
        return STAGES[this.currentStageIdx];
    }

    constructor(public scene: MainScene) {
        this.currentStageIdx = -1;
        this.nextStage();
    }

    tick() {
        const t = this.scene.time.now;
        if (t - this.lastSpawnedPieceAt > this.stage.pieceSpawnRate) {
            this.lastSpawnedPieceAt = t;
            this.spawnPiece();
        }

        if (!this.validateCenter()) {
            this.scene.player.explode();
        }

        if (this.scene.orders.length < 1) {
            this.lastOrderSpawnedAt = t;
            this.newOrder();
        }

        if (t - this.lastOrderSpawnedAt > this.stage.orderRate && this.scene.orders.length < this.stage.maxOrders) {
            this.lastOrderSpawnedAt = t;
            this.newOrder();
        }
    }

    validateCenter() {
        const pieces = this.scene.player.piecesInCenter;

        if (pieces.length === 0 || this.scene.orders.length === 0) return true;
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
                    return true;
                }
                isValid = true;
            }
        }

        return isValid;
    }

    nextStage() {
        this.nOrdersComplete = 0;
        if (this.currentStageIdx < STAGES.length - 1) {
            this.currentStageIdx++;
        }

        this.scene.player.targetRotationDuration = this.stage.playerSpeed;
    }

    completeOrder(order: Order) {
        order.complete();
        this.nOrdersComplete++;
        this.scene.player.takeOff();
        if (this.nOrdersComplete >= this.stage.nOrders) {
            this.nextStage();
        }
    }

    newOrder() {
        const order = new Order(this.scene, helpers.sample(this.stage.recipes), this.stage.baseOrderDuration);
        this.scene.orders.push(order);
    }

    spawnPiece() {
        this.scene.pieces.push(new Piece(this.scene, helpers.sample(this.stage.availablePiecePool), Math.random() > 0.5 ? 'top' : 'bottom', this.stage.conveyorSpeed, this.scene.time.now));
    }
}