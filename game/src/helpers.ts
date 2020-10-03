import * as Phaser from "phaser";

function lerp(value1: number, value2: number, amount: number) {
    amount = amount < 0 ? 0 : amount;
    amount = amount > 1 ? 1 : amount;
    return value1 + (value2 - value1) * amount;
}
function dist(g1: any, g2: any): number {
    return Math.sqrt(Math.pow(g1.y - g2.y, 2) + Math.pow(g1.x - g2.x, 2));
}
function clamp(min: number, max: number, v: number): number {
    return Math.min(Math.max(v, min), v);
}
// ported from https://gist.github.com/itsmrpeck/be41d72e9d4c72d2236de687f6f53974
// Lerps from angle a to b (both between 0.f and PI_TIMES_TWO), taking the shortest path
function lerpRadians(a: number, b: number, lerpFactor: number): number {
    let result;
    let diff = b - a;
    if (diff < -Math.PI) {
        // lerp upwards past PI_TIMES_TWO
        b += Phaser.Math.PI2;
        result = this.lerp(a, b, lerpFactor);
        if (result >= Phaser.Math.PI2) {
            result -= Phaser.Math.PI2;
        }
    }
    else if (diff > Math.PI) {
        // lerp downwards past 0
        b -= Phaser.Math.PI2;
        result = lerp(a, b, lerpFactor);
        if (result < 0) {
            result += Phaser.Math.PI2;
        }
    }
    else {
        // straight lerp
        result = lerp(a, b, lerpFactor);
    }

    return result;
}

export default {
    lerp,
    clamp,
    lerpRadians,
    dist
}