var Player = require('./models/playerModel');
var input = require('./input');

var player;

function initialize(){
  player = new Player({
    x: window.innerWidth / 2,
    y:  100,
    speedX : 10,
    speedY : 10,
    angle: 90,
    maxSpeed: 200
  });
}

function update(dt){
  var desiredAngle = null;
  if(input.isDown('w') || input.isDown('UP')){

    desiredAngle = -90;
    if(input.isDown('d') || input.isDown('RIGHT')){
      desiredAngle -= 45;
    }

    if(input.isDown('a') || input.isDown('LEFT')){
      desiredAngle += 45;
    }
  }else if(input.isDown('s') || input.isDown('DOWN')){
    desiredAngle = 90;

    if(input.isDown('d') || input.isDown('RIGHT')){
      desiredAngle += 45;
    }

    if(input.isDown('a') || input.isDown('LEFT')){
      desiredAngle -= 45;
    }
  }else{
    if(input.isDown('d') || input.isDown('RIGHT')){
      desiredAngle = 0;
    }else if(input.isDown('a') || input.isDown('LEFT')){
      desiredAngle = -180;
    }
  }

  if(input.isDown('SPACE') ){
    player.acceleration.x = 1;
    player.acceleration.y = 1;
  }else if(player.speed.x > 10){
    player.acceleration.x -= dt * 10;
    player.acceleration.y -= dt * 10;
  }else{
    player.acceleration.x = 0;
    player.acceleration.y = 0;
  }
  player.destinyAngle = desiredAngle;

  player.update(dt);
}

function render(ctx){
  if(window.SETTINGS.debugging.value == 1){
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(42, 250, 33, 0.50)';
    ctx.arc(player.pos.x, player.pos.y, 30 , Math.PI*2, false);
    ctx.stroke();
  }
  
  player.render(ctx);
}

module.exports = {
  update: update,
  render: render,
  initialize: initialize,
  getEntity: function(){
    return player;
  }
}