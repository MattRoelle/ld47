import * as Phaser from 'phaser';
import globals from '../globals';

export class BaseScene extends Phaser.Scene {
    fadeIn() {
        const g = this.add.graphics();
        g.fillStyle(0x000000);
        g.fillRect(0, 0, globals.WIDTH, globals.HEIGHT);
        g.setDepth(1000000000000000000000000000)
        this.tweens.add({
            targets: g,
            alpha: 0,
            onComplete: () => {
                g.destroy();
            },
            duration: 1000,
            ease: Phaser.Math.Easing.Quadratic.InOut
        })
    }

    fadeOut(scene: string, data: any = {}) {
        const g = this.add.graphics();
        g.fillStyle(0x000000);
        g.setAlpha(0)
        g.fillRect(0, 0, globals.WIDTH, globals.HEIGHT);
        g.setDepth(1000000000000000000000000000)
        this.tweens.add({
            targets: g,
            alpha: 1,
            onComplete: () => {
                this.scene.start(scene)
            },
            duration: 1000,
            ease: Phaser.Math.Easing.Quadratic.InOut
        })
    }

    public centerSprite(key: string): Phaser.GameObjects.Sprite {
        const spr = this.add.sprite(globals.WIDTH / 2, globals.HEIGHT / 2, key);
        return spr;
    }

    public centerOriginSprite(key: string, x = 0, y = 0) {
        const spr = this.add.sprite(x, y, key);
        spr.setOrigin(0, 0)
        return spr;
    }
}