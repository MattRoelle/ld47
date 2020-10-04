import * as Phaser from 'phaser';
import globals from "./globals"

export default {
    rect(x: number, y: number, w: number, h: number, fillColor: number) {
        globals.GRAPHICS.fillStyle(fillColor);
        globals.GRAPHICS.fillRect(x, y, w, h);
    },
    lightCircle(x: number, y: number, r: number, fillColor: number) {
        globals.GRAPHICS.fillStyle(fillColor);
        globals.GRAPHICS.setBlendMode(Phaser.BlendModes.ADD);
        globals.GRAPHICS.setAlpha(0.5)
        globals.GRAPHICS.fillCircle(x, y, r);
    },
    init(scene: Phaser.Scene) {
        globals.GRAPHICS = scene.add.graphics();
        globals.GRAPHICS.setDepth(100000000000000000000000)
    },
    update(scene: Phaser.Scene) {
        scene.children.bringToTop(globals.GRAPHICS);
        globals.GRAPHICS.clear();
    }
}