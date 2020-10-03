import debugService from "../debugService";
import globals from "../globals";
import { BaseScene } from "../scenes/BaseScene";

const N_CLAW_BACKS = 10;

export class Player extends Phaser.GameObjects.Container {
    claw: Phaser.GameObjects.Sprite;
    clawAngle: 0;
    clawDirection: 'inward' | 'outward';
    clawContainer: Phaser.GameObjects.Container;
    innertube: Phaser.GameObjects.Sprite;
    eyes: Phaser.GameObjects.Sprite;
    clawBacks: Phaser.GameObjects.Sprite[];

    constructor(
        scene: BaseScene,
        public rotationDuration: number
    ) {
        super(scene, 0, 0);

        scene.add.existing(this);
        this.add(this.innertube = scene.centerOriginSprite("player-innertube"))
        this.add(scene.centerOriginSprite("player-base", 9, -10))
        this.add(scene.centerOriginSprite("player-head", 9, -20))
        this.add(this.eyes = scene.centerOriginSprite("player-eyes", 24, -14))
        this.clawBacks = [];
        for(let i = 0; i < N_CLAW_BACKS; i++) {
            const spr = scene.centerOriginSprite("player-claw-back");
            this.add(spr);
            this.clawBacks.push(spr);
        }

        const glass = scene.centerOriginSprite("player-head-glass");
        glass.setBlendMode(Phaser.BlendModes.MULTIPLY);
        glass.setPosition(10, -21)
        glass.alpha = 0.75;
        this.add(glass);

        this.clawAngle = 0;
        this.claw = scene.add.sprite(28, 15, "claw");
        this.claw.setOrigin(0.5, 0)
        this.add(this.claw);


        // scene.add.existing(this);
    }

    setClawRotation() {
        const playerWidth = 20;
        const playerHeight = 11;
        const originX = 29;
        const originY = 5;
        const theta = this.clawAngle || 0;
        const x = Math.cos(theta) * playerWidth;
        const y = Math.sin(theta) * playerHeight;
        this.claw.x = x + originX;
        this.claw.y = y + originY;
        if (this.claw.y > 8) {
            this.bringToTop(this.claw);
        } else {
            this.sendToBack(this.claw);
        }
        this.claw.rotation = this.clawAngle - Math.PI / 2;
        console.log('this.claw.y', this.claw.y);

        this.eyes.x = (Math.cos(theta) * 2) + 24;
        this.eyes.y = (Math.sin(theta) * 2) - 14;

        for(let i = 0; i < N_CLAW_BACKS; i++) {
            const angle = (i/N_CLAW_BACKS) * Math.PI * 2;
            const cb = this.clawBacks[i];

            cb.x = (Math.cos(theta - Math.PI + angle) * playerWidth) + 28;
            cb.y = (Math.sin(theta - Math.PI + angle) * playerHeight * 0.8) + 5;

            cb.rotation = theta + angle + Math.PI/2;
            if (cb.y > 3) {
                this.bringToTop(cb);
            } else {
                this.sendToBack(cb);
            }
        }
        this.sendToBack(this.innertube);
    }

    get clawTipPos() {
        return {
            x: this.x + this.claw.x + Math.cos(this.clawAngle)*37,
            y: this.y + this.claw.y + Math.sin(this.clawAngle)*37
        };
    }

    update(time: number, delta: number) {
        const t = ((time % this.rotationDuration) / this.rotationDuration) * Math.PI * 2;
        const x = Math.cos(t) * globals.ARENA_W * globals.WIDTH / 2;
        const y = 5 + (Math.sin(t) * globals.ARENA_H * globals.HEIGHT / 2);
        const bobY = Math.sin(t * 4) * 4;

        // debugService.circle(this.clawTipPos.x, this.clawTipPos.y, 10, 0xFe4545);

        this.x = x + globals.WIDTH/2.3;
        this.y = y + 50 + bobY + globals.HEIGHT/4;
        this.setClawRotation();
    }
}