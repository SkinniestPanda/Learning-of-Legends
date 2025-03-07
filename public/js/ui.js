// ui.js
function drawHealthBar(sprite, currentHealth, maxHealth) {
    const barWidth = 50 * sprite.scale; // Adjust width as needed
    const barHeight = 10;
    let spriteWidth = (sprite.image.width / sprite.framesMax) * sprite.scale;
    let x = (sprite.position.x + sprite.offset.x) + (spriteWidth - barWidth) / 2;
    let y = sprite.position.y - 20; // 20 pixels above the sprite

    // Draw missing health (red)
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, barWidth, barHeight);
    // Draw current health (green)
    const healthWidth = barWidth * (currentHealth / maxHealth);
    ctx.fillStyle = 'green';
    ctx.fillRect(x, y, healthWidth, barHeight);
    ctx.strokeStyle = 'black';
    ctx.strokeRect(x, y, barWidth, barHeight);
}

function drawTurnOrder() {
    const xStart = 20; // Starting x-coordinate for icons
    const yStart = 10; // y-coordinate for icons
    const iconSize = 40; // Width and height for each icon
    const spacing = 60; // Horizontal spacing between icons
    let x = xStart;
    
    for (let i = 0; i < turnOrder.length; i++) {
        let charName = turnOrder[i];
        let sprite;
        switch(charName) {
            case 'soldier':
                sprite = soldier;
                break;
            case 'orc':
                sprite = orc;
                break;
            case 'allyTop':
                sprite = allyTop;
                break;
            case 'allyBottom':
                sprite = allyBottom;
                break;
            case 'enemyTop':
                sprite = enemyTop;
                break;
            case 'enemyBottom':
                sprite = enemyBottom;
                break;
            default:
                continue;
        }
        // Highlight current turn with a yellow border
        if (i === currentTurnIndex) {
            ctx.strokeStyle = 'yellow';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, yStart, iconSize, iconSize);
        }
        // Draw the sprite's first idle frame as an icon (scaled down)
        ctx.drawImage(
            sprite.image,
            0, 0,
            sprite.image.width / sprite.framesMax, sprite.image.height,
            x, yStart,
            iconSize, iconSize
        );
        // Draw the character's name below the icon
        ctx.fillStyle = 'black';
        ctx.font = '12px Arial';
        ctx.fillText(charName, x, yStart + iconSize + 12);
        x += spacing;
    }
}

// Attack animation
async function attackAnimation(attacker, target) {
    // Save original x position (y remains constant)
    const originalX = attacker.position.x;
    const originalY = attacker.position.y;  // Not used since y doesn't change

    // Calculate the target's effective x position using its position and offset.
    const targetX = target.position.x + target.offset.x;
    
    // Set how close the attacker should get to the target horizontally.
    const attackDistance = 50;  // Adjust as needed
    
    // Assuming the attacker is on the left side, compute the destination x:
    const destX = targetX - attackDistance;
    
    // Animate horizontal movement toward destX.
    while (attacker.position.x < destX) {
        attacker.position.x += 5;
        await new Promise(resolve => setTimeout(resolve, 16)); // ~60 FPS
    }
    // Ensure position is exactly destX.
    attacker.position.x = destX;
    
    // Play the attack animation.
    if (attacker === soldier) {
        attacker.image = attacker.sprites[soldierAttackChoice].image;
        attacker.framesMax = attacker.sprites[soldierAttackChoice].framesMax;
    } else {
        attacker.image = attacker.sprites.attack.image;
        attacker.framesMax = attacker.sprites.attack.framesMax;
    }
    attacker.framesCurrent = 0;
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Reset to idle animation.
    attacker.resetToIdle();
    
    // Animate movement back to original x.
    while (attacker.position.x > originalX) {
        attacker.position.x -= 5;
        await new Promise(resolve => setTimeout(resolve, 16));
    }
    attacker.position.x = originalX;
}
