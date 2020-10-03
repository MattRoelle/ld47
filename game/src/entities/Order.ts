import globals from "../globals";
import helpers from "../helpers";
import { GrabbablePieceType, PIECES, PieceType } from "./Piece";

export interface Recipe {
    pieces: PieceType[];
}

export const RECIPES = {
    BASIC: { pieces: [PIECES.base1, PIECES.tip1] } as Recipe,
    BASIC_FULL: { pieces: [PIECES.base1, PIECES.mid1, PIECES.tip1] } as Recipe,
}

export class Order extends Phaser.GameObjects.Container {
    spawnTime: number;
    constructor(scene: Phaser.Scene, public recipe: Recipe, public duration: number) {
        super(scene, globals.WIDTH, -8)
        scene.add.existing(this);
        this.setDepth(50000000);

        const spr = scene.add.sprite(0, 0, "order-ui")
        spr.setOrigin(0.5, 0);
        this.add(spr);
        let previewY = 50;

        for(let p of recipe.pieces as GrabbablePieceType[]) {
            const pieceSprite = scene.add.sprite(0, previewY, p.spriteKey);
            pieceSprite.setScale(0.5, 0.5)
            previewY -= p.height * 0.7;
            this.add(pieceSprite)
        }

        this.spawnTime = scene.time.now;
    }

    update(time: number, delta: number) {
        const t = (time - this.spawnTime) / this.duration;
        this.x = globals.WIDTH * (1 - t);
        this.y = -12 + (Math.sin(t*50)*9);
    }
}