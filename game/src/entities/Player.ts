import debugService from "../debugService";
import globals from "../globals";
import { BaseScene } from "../scenes/BaseScene";

export class Player extends Phaser.GameObjects.Container {
    constructor(
        scene: BaseScene,
        public rotationDuration: number
    ) {
        super(scene, 0, 0);

        scene.add.existing(this);
        this.add(scene.centerOriginSprite("player-innertube"))
        this.add(scene.centerOriginSprite("player-base"))
        this.add(scene.centerOriginSprite("player-head"))
        this.add(scene.centerOriginSprite("player-eyes"))

        const glass = scene.centerOriginSprite("player-head-glass");
        glass.setBlendMode(Phaser.BlendModes.MULTIPLY);
        glass.alpha = 0.75;
        this.add(glass);

        // scene.add.existing(this);
    }

    update(time: number, delta: number) {
        const t = ((time % this.rotationDuration) / this.rotationDuration) * Math.PI * 2;
        const x = Math.cos(t) * globals.ARENA_W * globals.WIDTH / 2;
        const y = Math.sin(t) * globals.ARENA_H * globals.HEIGHT / 2;
        const bobY = Math.sin(t * 4) * 3;
        // debugService.circle(x + globals.WIDTH/2, y + globals.HEIGHT/2, 16, 0x00FF00);
        this.x = x;
        this.y = y + 50 + bobY;
    }
}