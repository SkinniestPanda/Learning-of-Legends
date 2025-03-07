// sprites.js
class Sprite {
    constructor({
        position,
        offset = { x: 0, y: 0 },
        imageSrc,
        scale = 1,
        framesMax = 1,
        sprites
    }) {
        this.position = position;
        this.offset = offset;
        this.width = 50;
        this.height = 150;
        this.image = new Image();
        this.image.src = imageSrc;
        this.scale = scale;
        this.framesMax = framesMax;
        this.framesCurrent = 0;
        this.framesElapsed = 0;
        this.framesHold = 5; // Animation speed
        this.sprites = sprites; // Additional sprites (e.g., idle, takeHit, death)
        this.dead = false; // Track if the sprite is dead

        // Preload all additional sprites
        if (this.sprites) {
            for (const key in this.sprites) {
                const sprite = this.sprites[key];
                sprite.image = new Image();
                sprite.image.src = sprite.imageSrc;
            }
        }
    }

    draw() {
        ctx.save();
        const frameWidth = this.image.width / this.framesMax;
        const drawWidth = frameWidth * this.scale;
        const drawHeight = this.image.height * this.scale;
        let x = this.position.x + this.offset.x;
        let y = this.position.y + this.offset.y;
        
        if (this.flip) {
            // Flip horizontally: scale context by -1 and adjust x position
            ctx.scale(-1, 1);
            // When flipped, the x coordinate needs to be adjusted:
            x = -x - drawWidth;
        }
        
        ctx.drawImage(
            this.image,
            this.framesCurrent * frameWidth,
            0,
            frameWidth,
            this.image.height,
            x,
            y,
            drawWidth,
            drawHeight
        );
        ctx.restore();
    }

    animateFrames() {
        this.framesElapsed++;
        if (this.framesElapsed % this.framesHold === 0) {
            if (this.framesCurrent < this.framesMax - 1) {
                this.framesCurrent++;
            } else {
                if (this.dead) return; // Stop animation if dead
                this.framesCurrent = 0;
            }
        }
    }

    update() {
        this.draw();
        this.animateFrames();
    }

    // Play hit animation then reset to idle after a short delay
    takeHit() {
        if (this.sprites?.takeHit) {
            this.image = this.sprites.takeHit.image;
            this.framesMax = this.sprites.takeHit.framesMax;
            this.framesCurrent = 0;
            setTimeout(() => {
                this.resetToIdle();
            }, 500); // Duration of hit animation
        }
    }

    // Play death animation and mark as dead
    die() {
        if (this.sprites?.death) {
            this.image = this.sprites.death.image;
            this.framesMax = this.sprites.death.framesMax;
            this.framesCurrent = 0;
            this.dead = true;
        }
    }

    // Reset sprite to idle animation
    resetToIdle() {
        if (this.sprites?.idle) {
            this.image = this.sprites.idle.image;
            this.framesMax = this.sprites.idle.framesMax;
            this.framesCurrent = 0;
            this.dead = false; // Reset dead flag
        }
    }
}

// Create soldier and orc sprites with their respective animations
const soldier = new Sprite({
    position: { x: 150, y: 300 },
    offset: { x: 0, y: -50 },
    imageSrc: 'images/allies/Medieval_King_Pack_2/Idle.png',
    scale: 2,
    framesMax: 8, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/allies/Medieval_King_Pack_2/Idle.png',
            framesMax: 8,
        },
        attack1: {
            imageSrc: 'images/allies/Medieval_King_Pack_2/Attack1.png',
            framesMax: 4,
        },
        attack2: {
            imageSrc: 'images/allies/Medieval_King_Pack_2/Attack2.png',
            framesMax: 4,
        },
        attack3: {
            imageSrc: 'images/allies/Medieval_King_Pack_2/Attack3.png',
            framesMax: 4,
        },    
        takeHit: {
            imageSrc: 'images/allies/Medieval_King_Pack_2/Take Hit - white silhouette.png', // Path to hit sprite sheet
            framesMax: 4,
        },
        death: {
            imageSrc: 'images/allies/Medieval_King_Pack_2/Death.png', // Path to death sprite sheet
            framesMax: 6,
        },
    },
});

// Create two allies
const allyTop = new Sprite({
    position: { x: 50, y: 200 }, // Positioned above the soldier
    offset: { x: -60, y: -50 },
    imageSrc: 'images/allies/Fantasy_Warrior/Idle.png', // Replace with your ally image
    scale: 2,
    framesMax: 10, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/allies/Fantasy_Warrior/Idle.png', // Replace with your ally idle image
            framesMax: 10,
        },
        attack: {
            imageSrc: 'images/allies/Fantasy_Warrior/Attack1.png', // Add attack animation
            framesMax: 7,
        },
        takeHit: {
            imageSrc: 'images/allies/Fantasy_Warrior/Take hit.png', // Replace with your ally hit image
            framesMax: 3, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/allies/Fantasy_Warrior/Death.png', // Replace with your ally death image
            framesMax: 7, // Number of frames in death animation
        },
    },
});

const allyBottom = new Sprite({
    position: { x: 50, y: 400 }, // Positioned below the soldier
    offset: { x: 0, y: 0 },
    imageSrc: 'images/allies/Huntress_2/Idle.png', // Replace with your ally image
    scale: 2,
    framesMax: 10, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/allies/Huntress_2/Idle.png', // Replace with your ally idle image
            framesMax: 10,
        },
        attack: {
            imageSrc: 'images/allies/Huntress_2/Attack.png', // Add attack animation
            framesMax: 6,
        },
        takeHit: {
            imageSrc: 'images/allies/Huntress_2/Get Hit.png', // Replace with your ally hit image
            framesMax: 3, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/allies/Huntress_2/Death.png', // Replace with your ally death image
            framesMax: 10, // Number of frames in death animation
        },
    },
});

const enemyTop = new Sprite({
    position: { x: 700, y: 200 }, // Positioned above the orc
    offset: { x: 0, y: -70 },
    imageSrc: 'images/mobs/Goblin/Idle.png', // Replace with your enemy image
    scale: 2,
    framesMax: 4, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/mobs/Goblin/Idle.png', // Replace with your enemy idle image
            framesMax: 4,
        },
        attack: {
            imageSrc: 'images/mobs/Goblin/Attack.png', // Add attack animation
            framesMax: 8,
        },
        takeHit: {
            imageSrc: 'images/mobs/Goblin/Take Hit.png', // Replace with your enemy hit image
            framesMax: 4, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/mobs/Goblin/Death.png', // Replace with your enemy death image
            framesMax: 4, // Number of frames in death animation
        },
    },
});
enemyTop.flip = true;

const enemyBottom = new Sprite({
    position: { x: 700, y: 400 }, // Positioned below the orc
    offset: { x: 0, y: -50 },
    imageSrc: 'images/mobs/Skeleton/Idle.png', // Replace with your enemy image
    scale: 2,
    framesMax: 4, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/mobs/Skeleton/Idle.png', // Replace with your enemy idle image
            framesMax: 4,
        },
        attack: {
            imageSrc: 'images/mobs/Skeleton/Attack.png', // Add attack animation
            framesMax: 8,
        },
        takeHit: {
            imageSrc: 'images/mobs/Skeleton/Take Hit.png', // Replace with your enemy hit image
            framesMax: 4, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/mobs/Skeleton/Death.png', // Replace with your enemy death image
            framesMax: 4, // Number of frames in death animation
        },
    },
});
enemyBottom.flip = true;

const orc = new Sprite({
    position: { x: 650, y: 300 },
    offset: { x: -220, y: -170 },
    imageSrc: 'images/mobs/Evil_Wizard_2/Idle.png',
    scale: 2,
    framesMax: 8, // Number of frames in the idle animation
    sprites: {
        idle: {
            imageSrc: 'images/mobs/Evil_Wizard_2/Idle.png',
            framesMax: 8,
        },
        attack: {
            imageSrc: 'images/mobs/Evil_Wizard_2/Attack1.png', // Add attack animation
            framesMax: 8,
        },
        takeHit: {
            imageSrc: 'images/mobs/Evil_Wizard_2/Take hit.png', // Path to hit sprite sheet
            framesMax: 3, // Number of frames in hit animation
        },
        death: {
            imageSrc: 'images/mobs/Evil_Wizard_2/Death.png', // Path to death sprite sheet
            framesMax: 7, // Number of frames in death animation
        },
    },
});
orc.flip = true;