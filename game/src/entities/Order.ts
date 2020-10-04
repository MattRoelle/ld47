import globals from "../globals";
import helpers from "../helpers";
import { GrabbablePieceType, PIECES, PieceType } from "./Piece";

export interface Recipe {
    pieces: PieceType[];
}

export const RECIPES = {
    BASIC: { pieces: [PIECES.base1, PIECES.tip1] } as Recipe,
    SINGLE: { pieces: [PIECES.single] } as Recipe,
    BASIC_FULL: { pieces: [PIECES.base1, PIECES.mid1, PIECES.tip1] } as Recipe,
}

export class Order extends Phaser.GameObjects.Container {
    spawnTime: number;
    dead: boolean = false;
    completed: boolean;
    progressBar: Phaser.GameObjects.Sprite;
    failed: boolean;

    constructor(scene: Phaser.Scene, public recipe: Recipe, public duration: number) {
        super(scene, globals.WIDTH, -8)
        scene.add.existing(this);
        this.setDepth(50000000000000);

        const spr = scene.add.sprite(0, 0, "order-ui")
        spr.setOrigin(0, 0.5);
        this.add(spr);
        let previewY = 5;

        for (let p of recipe.pieces as GrabbablePieceType[]) {
            const pieceSprite = scene.add.sprite(20, previewY, p.spriteKey);
            pieceSprite.setScale(0.6)
            pieceSprite.tintFill = true;
            this.add(pieceSprite)

            previewY -= p.height * 0.8;
        }

        this.spawnTime = scene.time.now;
    }

    fail() {
        if (this.failed) return;
        this.failed = true

        this.scene.cameras.main.shake(200, 0.02);
        helpers.explosion(this.x + 8, this.y + 28, this.scene);
        this.scene.time.delayedCall(300, () => {
            this.dead = true;
            this.destroy();
        })
    }

    complete() {
        this.completed = true;
        this.scene.tweens.add({
            targets: this,
            x: -100,
            angle: -180,
            ease: Phaser.Math.Easing.Quadratic.InOut,
            duration: 800,
            onComplete: () => {
                this.dead = true;
                this.destroy();
            }
        });
    }

    update(time: number, delta: number) {
        if (this.dead) return;

        const t = (time - this.spawnTime) / this.duration;

        // this.graphics.setBlendMode(Phaser.BlendModes.ADD)
        // this.graphics.setAlpha(0.5)

        if (!this.completed) {
            this.x = 0;
        }

        this.y = globals.HEIGHT * 1.05 * (1 - t);
    }
}