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
    playerRotSpeed: number;
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
        nOrders: 2,
        baseOrderDuration: 20000,
        conveyorSpeed: 16000,
        playerRotSpeed: 15,
        maxOrders: 2,
        orderRate: 5000,
        pieceSpawnRate: 1250,
    },
    {
        availablePiecePool: [
            PIECES.mid1,
            PIECES.base1,
            PIECES.tip1,
            PIECES.single,
        ],
        recipes: [
            RECIPES.BASIC_FULL,
            RECIPES.BASIC
        ],
        nOrders: 4,
        baseOrderDuration: 20000,
        conveyorSpeed: 16000,
        playerRotSpeed: 20,
        maxOrders: 3,
        orderRate: 5000,
        pieceSpawnRate: 1000,
    },
    {
        availablePiecePool: [
            PIECES.mid1,
            PIECES.base1,
            PIECES.tip1,
            PIECES.single
        ],
        recipes: [
            RECIPES.BASIC_FULL,
            RECIPES.BASIC,
            RECIPES.SINGLE
        ],
        nOrders: 7,
        baseOrderDuration: 18000,
        conveyorSpeed: 15000,
        playerRotSpeed: -22,
        maxOrders: 4,
        orderRate: 5000,
        pieceSpawnRate: 800,
    },
    {
        availablePiecePool: [
            PIECES.mid1,
            PIECES.base1,
            PIECES.tip1,
            PIECES.single
        ],
        recipes: [
            RECIPES.BASIC_FULL,
            RECIPES.BASIC,
            RECIPES.SINGLE
        ],
        nOrders: 10,
        baseOrderDuration: 18000,
        conveyorSpeed: 13000,
        playerRotSpeed: -24,
        maxOrders: 4,
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

        if (this.scene.health <= 0) {

        } else {
            if (t - this.lastSpawnedPieceAt > this.stage.pieceSpawnRate) {
                this.lastSpawnedPieceAt = t;
                this.spawnPiece();
            }

            if (!this.validateCenter()) {
                this.scene.player.explode();
                this.hurt();
            }

            for(let o of this.scene.orders) {
                const dt = t - o.spawnTime;
                if (dt > o.duration) {
                    if (!o.failed) {
                        this.hurt();
                    }
                    o.fail();
                }
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
    }

    hurt() {
        this.scene.healthLights[5 - this.scene.health].turnOff();
        this.scene.health--;
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

        this.scene.player.targetRotSpeed = this.stage.playerRotSpeed;
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
        let newPt: PieceType;

        for(let order of this.scene.orders) {
            for(let rp of order.recipe.pieces) {
                if (!this.scene.pieces.find((p: any) => p.pieceType === rp)) {
                    newPt = rp;
                }
            }
        }

        if (!newPt) {
            newPt = helpers.sample(this.stage.availablePiecePool);
        }
        this.scene.pieces.push(new Piece(this.scene, newPt, Math.random() > 0.5 ? 'top' : 'bottom', this.stage.conveyorSpeed, this.scene.time.now));
    }
}