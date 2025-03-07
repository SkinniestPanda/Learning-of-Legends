// animation.js
function animate() {
    animationId = requestAnimationFrame(animate);
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas

    // Draw allies first (behind the soldier)
    allyTop.update();
    allyBottom.update();

    // Draw enemies (behind the soldier)
    if (enemyTop) enemyTop.update();
    if (enemyBottom) enemyBottom.update();

    // Update main characters
    soldier.update();
    orc.update();

    // Draw health bars for all characters
    drawHealthBar(soldier, soldierHealth, 50);
    drawHealthBar(orc, wolfHealth, 50);
    drawHealthBar(allyTop, allyTopHealth, 50);
    drawHealthBar(allyBottom, allyBottomHealth, 50);
    if (enemyTop) drawHealthBar(enemyTop, enemyTopHealth, 50);
    if (enemyBottom) drawHealthBar(enemyBottom, enemyBottomHealth, 50);

    // Draw the turn order bar on top
    drawTurnOrder();
}