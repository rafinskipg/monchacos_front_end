/** YEAH **/
'use strict';
var birdsGenerator = require('./models/birdsGenerator');
var particleGenerator = require('./models/particles');
var settings = require('./settings');
var player = require('./player');
var particles = particleGenerator.particles;
var song, then, now, canvas,ctx, canvas2, ctx2, shown,  particlesGenerationStep, particlesDying, color, birds;


function start(){
  particlesGenerationStep = 'white'
  birds = birdsGenerator.getPackOfBirds(window.innerWidth, window.innerHeight, 15);
  player.initialize();
  //getBlueParticles();
  launchCanvas();
}

function launchCanvas(){
  $('#canvas').removeClass('hidden');

  then = Date.now();
  canvas = document.getElementById('canvas');
  canvas2 = document.getElementById('canvas2');
  
  canvas.width = window.innerWidth //Or wathever
  canvas.height = window.innerHeight; //Or wathever 
  canvas2.width = window.innerWidth //Or wathever
  canvas2.height = window.innerHeight; //Or wathever
  ctx = canvas.getContext('2d');
  ctx2 = canvas2.getContext('2d');

  loop();
}

var loop = function loop(){
  now = Date.now();
  var dt = now - then;
  then = now;

  clear();
  update(dt);
  render();

  requestAnimationFrame(loop);
}

function update(dt){
  var newDt = dt/1000;
  //updateBackgrounds(newDt);
  updateBirds(newDt);
  player.update(newDt);
}

function updateBackgrounds(dt){
   particles = _.compact(particles.map(function(particle){
      particle.update(dt);
      if(particle.dying && particle.remaining_life <= 0){
        return null;
      }

      if(particle.pos.x > -30  && particle.pos.x < window.innerWidth + 30 
        && particle.pos.y > -30 && particle.pos.y < window.innerHeight + 30){
        return particle;
      }else if(!particlesDying){
        //Play sound particle
        return particleGenerator.newParticle(color);
      }
    }));
 
  if(particles.length == 0){
    getBlueParticles();
  }
}

function updateBirds(dt){

  birdsGenerator.updatePackOfBirds(birds, ctx2, [player.getEntity()]);

  birds = _.compact(birds.map(function(bird){
    bird.update(dt);
    return bird;
  }));
}

function clear(){
  ctx2.globalCompositeOperation = "source-over";

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  var gradient = ctx.createLinearGradient(canvas.width, canvas.height,0, 0);
 
  gradient.addColorStop(0, "rgb(84, 141, 189)");
  gradient.addColorStop(1, "rgb(99, 64, 113)");
  //ctx.fillStyle = 'rgba(255, 255, 255, 0.44)';
  //ctx2.globalCompositeOperation = "lighter";
  ctx2.fillStyle = 'rgba(255, 255, 255, 0.44)';
    
  ctx2.fillRect(0, 0, canvas.width, canvas.height);

}

function render(){

  /*particles.forEach(function(particle){
    particle.render(ctx);
  });*/

  birds.forEach(function(bird){
    bird.render(ctx2);
  });

  player.render(ctx2);
}

function changeAnimation(anim){
  particles = particles.map(function(p){
    p.dying = true;
    return p;
  });
  particlesDying = true;
  particlesGenerationStep = anim;
}


function  getRedParticles(){
  color = {r:255,g:0,b:0};
  particles = particleGenerator.getColorParticles(color, 20, 0);
}
function  getGreenParticles(){
  color = {r:13,g:209,b:23};
  particles = particleGenerator.getColorParticles(color, 20,0);
}
function  getBrownParticles(){
  color = {r:138,g:65,b:71};
  particles = particleGenerator.getColorParticles(color, 20,0);
}
function  getBlueParticles(){
  color = {r:53,g:100,b:223};
  particles = particleGenerator.getColorParticles(color, 20,0);
}

$(document).ready(function(){
  start();

  $(window).on('resize', function(){
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;
    ctx2.canvas.width = window.innerWidth;
    ctx2.canvas.height = window.innerHeight;
  })
});