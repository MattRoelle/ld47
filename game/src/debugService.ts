import * as Phaser from 'phaser';
import globals from "./globals"

export default {
    rect(x: number, y: number, w: number, h: number, fillColor: number) {
        if (!globals.DEBUG) return;
        globals.DEBUG_GRAPHICS.fillStyle(fillColor);
        globals.DEBUG_GRAPHICS.fillRect(x, y, w, h);
    },
    circle(x: number, y: number, r: number, fillColor: number) {
        if (!globals.DEBUG) return;
        globals.DEBUG_GRAPHICS.lineStyle(2, fillColor);
        globals.DEBUG_GRAPHICS.strokeCircle(x, y, r);
    },
    init(scene: Phaser.Scene) {
        if (!globals.DEBUG) return;
        globals.DEBUG_GRAPHICS = scene.add.graphics();
    },
    update(scene: Phaser.Scene) {
        if (!globals.DEBUG) return;
        scene.children.bringToTop(globals.DEBUG_GRAPHICS);
        globals.DEBUG_GRAPHICS.clear();
    }
}