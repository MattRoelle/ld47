import * as Phaser from 'phaser';
import globals from '../globals';

export class BaseScene extends Phaser.Scene {
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