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
    dead: boolean = false;
    graphics: Phaser.GameObjects.Graphics;
    completed: boolean;

    constructor(scene: Phaser.Scene, public recipe: Recipe, public duration: number) {
        super(scene, globals.WIDTH, -8)
        scene.add.existing(this);
        this.setDepth(50000000);

        this.graphics = scene.add.graphics();
        this.graphics.setDepth(50000001);

        const spr = scene.add.sprite(0, 0, "order-ui")
        spr.setOrigin(0.5, 0);
        this.add(spr);
        let previewY = 30;

        for(let p of recipe.pieces as GrabbablePieceType[]) {
            const pieceSprite = scene.add.sprite(0, previewY, p.spriteKey);
            pieceSprite.setScale(0.6)
            pieceSprite.tintFill = true;
            pieceSprite.tint = 0x000000;
            previewY -= p.height * 0.6;
            this.add(pieceSprite)
        }

        this.spawnTime = scene.time.now;
    }

    fail() {
        this.dead = true;
        this.destroy();
    }

    complete() {
        this.completed = true;
        this.scene.tweens.add({
            targets: this,
            y: this.y - 50,
            ease: Phaser.Math.Easing.Bounce.Out,
            duration: 500,
            onComplete: () => {
                this.dead = true;
                this.destroy();
            }
        });
    }

    update(time: number, delta: number) {
        if (this.dead) return;
        
        const t = (time - this.spawnTime) / this.duration;

        this.x = 30;
        this.y = 10;

        this.graphics.clear();
        // this.graphics.setBlendMode(Phaser.BlendModes.ADD)
        // this.graphics.setAlpha(0.5)
        this.graphics.fillRect(this.x - 15, this.y + 45, 32 * (1 - t), 5);

        // this.x = globals.WIDTH * 1.05 * (1 - t);
        // this.y = -12 + (Math.sin(t*50)*9);

        if (t > 1) {
            this.fail();
        }
    }
}