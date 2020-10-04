import * as Phaser from "phaser";
import globals from "../globals";

const N_GLOBES = 5;

export class HealthLight extends Phaser.GameObjects.Container {
    mainSpr: Phaser.GameObjects.Sprite;
    glowSpr: Phaser.GameObjects.Sprite;
    offSpr: Phaser.GameObjects.Sprite;
    constructor(scene: Phaser.Scene, idx: number) {
        let t = idx / N_GLOBES

        super(scene, globals.WIDTH, (globals.HEIGHT * 0.2) + (t * globals.HEIGHT * 0.6));

        scene.add.existing(this);

        this.setDepth(1000000000000000)

        this.mainSpr = scene.add.sprite(0, 0, 'health-light');
        this.mainSpr.setOrigin(1, 0.5);
        this.add(this.mainSpr);

        this.offSpr = scene.add.sprite(0, 0, 'health-light-off');
        this.offSpr.setOrigin(1, 0.5);
        this.add(this.offSpr);
        this.offSpr.setVisible(false);

        this.glowSpr = scene.add.sprite(-18, 0, 'health-light-glow')
            .setBlendMode(Phaser.BlendModes.ADD)
            .setAlpha(0.1)
        this.add(this.glowSpr);
    }

    turnOff() {
        this.glowSpr.setVisible(false);
        this.mainSpr.setVisible(false);
        this.offSpr.setVisible(true);
    }
}