// ui.js
function drawHealthBar(sprite, currentHealth, maxHealth) {
    // Clamp current health to 0 to avoid negative widths.
    currentHealth = Math.max(0, currentHealth);
    
    const barWidth = 50 * sprite.scale; // Adjust width as needed
    const barHeight = 10;
    let spriteWidth = (sprite.image.width / sprite.framesMax) * sprite.scale;
    let x = (sprite.position.x + sprite.offset.x) + (spriteWidth - barWidth) / 2;
    let y = sprite.position.y - 20; // 20 pixels above the sprite

    // Draw missing health (red).
    ctx.fillStyle = 'red';
    ctx.fillRect(x, y, barWidth, barHeight);
    // Draw current health (green).
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
    const originalPosition = { x: attacker.position.x, y: attacker.position.y };
    const targetEffectiveX = target.position.x + target.offset.x;
    const targetEffectiveY = target.position.y;
    const attackDistance = 50;
    const destination = {
        x: targetEffectiveX - attackDistance,
        y: targetEffectiveY
    };

    // Switch to running animation if available.
    if (attacker.sprites.run) {
        attacker.image = attacker.sprites.run.image;
        attacker.framesMax = attacker.sprites.run.framesMax;
        attacker.framesCurrent = 0;
    }
    while (Math.hypot(attacker.position.x - destination.x, attacker.position.y - destination.y) > 5) {
        const dx = destination.x - attacker.position.x;
        const dy = destination.y - attacker.position.y;
        const angle = Math.atan2(dy, dx);
        const step = 5;
        attacker.position.x += step * Math.cos(angle);
        attacker.position.y += step * Math.sin(angle);
        await new Promise(resolve => setTimeout(resolve, 16));
    }
    attacker.position.x = destination.x;
    attacker.position.y = destination.y;

    // Use the proper attack animation based on the attacker.
    if (attacker === soldier) {
        attacker.image = attacker.sprites[soldierAttackChoice].image;
        attacker.framesMax = attacker.sprites[soldierAttackChoice].framesMax;
    } else if (attacker === allyTop) {
        attacker.image = attacker.sprites[allyTopAttackChoice].image;
        attacker.framesMax = attacker.sprites[allyTopAttackChoice].framesMax;
    } else {
        attacker.image = attacker.sprites.attack.image;
        attacker.framesMax = attacker.sprites.attack.framesMax;
    }
    attacker.framesCurrent = 0;
    await new Promise(resolve => setTimeout(resolve, 500));

    // Reset to idle before running back.
    attacker.resetToIdle();

    if (attacker.sprites.run) {
        attacker.image = attacker.sprites.run.image;
        attacker.framesMax = attacker.sprites.run.framesMax;
        attacker.framesCurrent = 0;
    }
    while (Math.hypot(attacker.position.x - originalPosition.x, attacker.position.y - originalPosition.y) > 5) {
        const dx = originalPosition.x - attacker.position.x;
        const dy = originalPosition.y - attacker.position.y;
        const angle = Math.atan2(dy, dx);
        const step = 5;
        attacker.position.x += step * Math.cos(angle);
        attacker.position.y += step * Math.sin(angle);
        await new Promise(resolve => setTimeout(resolve, 16));
    }
    attacker.position.x = originalPosition.x;
    attacker.position.y = originalPosition.y;
    // Ensure final state is idle.
    attacker.resetToIdle();
}

async function enemyAttackAnimation(attacker, target) {
    // Save the attacker's original position.
    const originalPosition = { 
        x: attacker.position.x, 
        y: attacker.position.y 
    };

    // Calculate the target's effective x position using its position and offset.
    const targetEffectiveX = target.position.x + target.offset.x;
    // Use the target's y position directly.
    const targetEffectiveY = target.position.y;
    
    // Define the fixed horizontal distance for the enemy attack.
    const attackDistance = 50; // generic attack distance
    const orcAttackOffset = 200; // special offset for the orc (adjust as needed)
    
    // Determine destination x coordinate based on attacker.
    const destinationX = (attacker === orc)
        ? targetEffectiveX + orcAttackOffset
        : targetEffectiveX + attackDistance;
    
    // Destination: x is computed above; y equals target's y.
    const destination = {
        x: destinationX,
        y: targetEffectiveY
    };

    // Switch to running animation if available.
    if (attacker.sprites.run) {
        attacker.image = attacker.sprites.run.image;
        attacker.framesMax = attacker.sprites.run.framesMax;
        attacker.framesCurrent = 0;
    }

    // Animate movement toward the destination.
    while (Math.hypot(attacker.position.x - destination.x, attacker.position.y - destination.y) > 5) {
        const dx = destination.x - attacker.position.x;
        const dy = destination.y - attacker.position.y;
        const angle = Math.atan2(dy, dx);
        const step = 5; // adjust step size if needed
        attacker.position.x += step * Math.cos(angle);
        attacker.position.y += step * Math.sin(angle);
        await new Promise(resolve => setTimeout(resolve, 16)); // ~60 FPS
    }
    attacker.position.x = destination.x;
    attacker.position.y = destination.y;

    // Play the enemy attack animation.
    attacker.image = attacker.sprites.attack.image;
    attacker.framesMax = attacker.sprites.attack.framesMax;
    attacker.framesCurrent = 0;
    await new Promise(resolve => setTimeout(resolve, 500));

    // Reset to idle animation before running back.
    attacker.resetToIdle();

    // Animate movement back to the original position using running animation.
    if (attacker.sprites.run) {
        attacker.image = attacker.sprites.run.image;
        attacker.framesMax = attacker.sprites.run.framesMax;
        attacker.framesCurrent = 0;
    }
    while (Math.hypot(attacker.position.x - originalPosition.x, attacker.position.y - originalPosition.y) > 5) {
        const dx = originalPosition.x - attacker.position.x;
        const dy = originalPosition.y - attacker.position.y;
        const angle = Math.atan2(dy, dx);
        const step = 5;
        attacker.position.x += step * Math.cos(angle);
        attacker.position.y += step * Math.sin(angle);
        await new Promise(resolve => setTimeout(resolve, 16));
    }
    attacker.position.x = originalPosition.x;
    attacker.position.y = originalPosition.y;
    
    // After returning, switch to idle animation.
    attacker.resetToIdle();
}