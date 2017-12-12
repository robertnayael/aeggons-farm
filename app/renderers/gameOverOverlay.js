export default function(ctx, justEnabled, scale) {

  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;

  ctx.font = "130px Arial";
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`Game Over`, 430, 300);

};
