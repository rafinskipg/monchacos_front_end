(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
  The MIT License

  Copyright (c) 2011 Mike Chambers

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE.
*/


/**
* A QuadTree implementation in JavaScript, a 2d spatial subdivision algorithm.
* @module QuadTree
**/

/****************** QuadTree ****************/

/**
* QuadTree data structure.
* @class QuadTree
* @constructor
* @param {Object} An object representing the bounds of the top level of the QuadTree. The object 
* should contain the following properties : x, y, width, height
* @param {Boolean} pointQuad Whether the QuadTree will contain points (true), or items with bounds 
* (width / height)(false). Default value is false.
* @param {Number} maxDepth The maximum number of levels that the quadtree will create. Default is 4.
* @param {Number} maxChildren The maximum number of children that a node can contain before it is split into sub-nodes.
**/
function QuadTree(bounds, pointQuad, maxDepth, maxChildren)
{ 
  var node;
  if(pointQuad)
  {

    node = new Node(bounds, 0, maxDepth, maxChildren);
  }
  else
  {
    node = new BoundsNode(bounds, 0, maxDepth, maxChildren);
  }

  this.root = node;
}

/**
* The root node of the QuadTree which covers the entire area being segmented.
* @property root
* @type Node
**/
QuadTree.prototype.root = null;


/**
* Inserts an item into the QuadTree.
* @method insert
* @param {Object|Array} item The item or Array of items to be inserted into the QuadTree. The item should expose x, y 
* properties that represents its position in 2D space.
**/
QuadTree.prototype.insert = function(item)
{
  if(item instanceof Array)
  {
    var len = item.length;

    for(var i = 0; i < len; i++)
    {
      this.root.insert(item[i]);
    }
  }
  else
  {
    this.root.insert(item);
  }
}

/**
* Clears all nodes and children from the QuadTree
* @method clear
**/
QuadTree.prototype.clear = function()
{
  this.root.clear();
}

/**
* Retrieves all items / points in the same node as the specified item / point. If the specified item
* overlaps the bounds of a node, then all children in both nodes will be returned.
* @method retrieve
* @param {Object} item An object representing a 2D coordinate point (with x, y properties), or a shape
* with dimensions (x, y, width, height) properties.
**/
QuadTree.prototype.retrieve = function(item)
{
  //get a copy of the array of items
  var out = this.root.retrieve(item).slice(0);
  return out;
}

/************** Node ********************/


function Node(bounds, depth, maxDepth, maxChildren)
{
  this._bounds = bounds;
  this.children = [];
  this.nodes = [];

  if(maxChildren)
  {
    this._maxChildren = maxChildren;

  }

  if(maxDepth)
  {
    this._maxDepth = maxDepth;
  }

  if(depth)
  {
    this._depth = depth;
  }
}

//subnodes
Node.prototype.nodes = null;
Node.prototype._classConstructor = Node;

//children contained directly in the node
Node.prototype.children = null;
Node.prototype._bounds = null;

//read only
Node.prototype._depth = 0;

Node.prototype._maxChildren = 4;
Node.prototype._maxDepth = 4;

Node.TOP_LEFT = 0;
Node.TOP_RIGHT = 1;
Node.BOTTOM_LEFT = 2;
Node.BOTTOM_RIGHT = 3;


Node.prototype.insert = function(item)
{
  if(this.nodes.length)
  {
    var index = this._findIndex(item);

    this.nodes[index].insert(item);

    return;
  }

  this.children.push(item);

  var len = this.children.length;
  if(!(this._depth >= this._maxDepth) && 
    len > this._maxChildren)
  {
    this.subdivide();

    for(var i = 0; i < len; i++)
    {
      this.insert(this.children[i]);
    }

    this.children.length = 0;
  }
}

Node.prototype.retrieve = function(item)
{
  if(this.nodes.length)
  {
    var index = this._findIndex(item);

    return this.nodes[index].retrieve(item);
  }

  return this.children;
}

Node.prototype._findIndex = function(item)
{
  var b = this._bounds;
  var left = (item.x > b.x + b.width / 2)? false : true;
  var top = (item.y > b.y + b.height / 2)? false : true;

  //top left
  var index = Node.TOP_LEFT;
  if(left)
  {
    //left side
    if(!top)
    {
      //bottom left
      index = Node.BOTTOM_LEFT;
    }
  }
  else
  {
    //right side
    if(top)
    {
      //top right
      index = Node.TOP_RIGHT;
    }
    else
    {
      //bottom right
      index = Node.BOTTOM_RIGHT;
    }
  }

  return index;
}


Node.prototype.subdivide = function()
{
  var depth = this._depth + 1;

  var bx = this._bounds.x;
  var by = this._bounds.y;

  //floor the values
  var b_w_h = (this._bounds.width / 2)|0;
  var b_h_h = (this._bounds.height / 2)|0;
  var bx_b_w_h = bx + b_w_h;
  var by_b_h_h = by + b_h_h;

  //top left
  this.nodes[Node.TOP_LEFT] = new this._classConstructor({
    x:bx, 
    y:by, 
    width:b_w_h, 
    height:b_h_h
  }, 
  depth);

  //top right
  this.nodes[Node.TOP_RIGHT] = new this._classConstructor({
    x:bx_b_w_h,
    y:by,
    width:b_w_h, 
    height:b_h_h
  },
  depth);

  //bottom left
  this.nodes[Node.BOTTOM_LEFT] = new this._classConstructor({
    x:bx,
    y:by_b_h_h,
    width:b_w_h, 
    height:b_h_h
  },
  depth);


  //bottom right
  this.nodes[Node.BOTTOM_RIGHT] = new this._classConstructor({
    x:bx_b_w_h, 
    y:by_b_h_h,
    width:b_w_h, 
    height:b_h_h
  },
  depth); 
}

Node.prototype.clear = function()
{ 
  this.children.length = 0;

  var len = this.nodes.length;
  for(var i = 0; i < len; i++)
  {
    this.nodes[i].clear();
  }

  this.nodes.length = 0;
}


/******************** BoundsQuadTree ****************/

function BoundsNode(bounds, depth, maxChildren, maxDepth)
{
  Node.call(this, bounds, depth, maxChildren, maxDepth);
  this._stuckChildren = [];
}

BoundsNode.prototype = new Node();
BoundsNode.prototype._classConstructor = BoundsNode;
BoundsNode.prototype._stuckChildren = null;

//we use this to collect and conctenate items being retrieved. This way
//we dont have to continuously create new Array instances.
//Note, when returned from QuadTree.retrieve, we then copy the array
BoundsNode.prototype._out = [];

BoundsNode.prototype.insert = function(item)
{ 
  if(this.nodes.length)
  {
    var index = this._findIndex(item);
    var node = this.nodes[index];

    //todo: make _bounds bounds
    if(item.x >= node._bounds.x &&
      item.x + item.width <= node._bounds.x + node._bounds.width &&
      item.y >= node._bounds.y &&
      item.y + item.height <= node._bounds.y + node._bounds.height)
    {
      this.nodes[index].insert(item);
    }
    else
    {     
      this._stuckChildren.push(item);
    }

    return;
  }

  this.children.push(item);

  var len = this.children.length;

  if(!(this._depth >= this._maxDepth) && 
    len > this._maxChildren)
  {
    this.subdivide();

    for(var i = 0; i < len; i++)
    {
      this.insert(this.children[i]);
    }

    this.children.length = 0;
  }
}

BoundsNode.prototype.getChildren = function()
{
  return this.children.concat(this._stuckChildren);
}

BoundsNode.prototype.retrieve = function(item)
{
  var out = this._out;
  out.length = 0;
  if(this.nodes.length)
  {
    var index = this._findIndex(item);

    out.push.apply(out, this.nodes[index].retrieve(item));
  }

  out.push.apply(out, this._stuckChildren);
  out.push.apply(out, this.children);

  return out;
}

BoundsNode.prototype.clear = function()
{

  this._stuckChildren.length = 0;

  //array
  this.children.length = 0;

  var len = this.nodes.length;

  if(!len)
  {
    return;
  }

  for(var i = 0; i < len; i++)
  {
    this.nodes[i].clear();
  }

  //array
  this.nodes.length = 0;  

  //we could call the super clear function but for now, im just going to inline it
  //call the hidden super.clear, and make sure its called with this = this instance
  //Object.getPrototypeOf(BoundsNode.prototype).clear.call(this);
}

BoundsNode.prototype.getChildCount

module.exports = QuadTree;

},{}],2:[function(require,module,exports){
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
},{"./models/birdsGenerator":5,"./models/particles":9,"./player":13,"./settings":14}],3:[function(require,module,exports){
'use strict';

var pressedKeys = {};

function setKey(event, status) {
    var code = event.keyCode;
    var key;

    switch(code) {
    case 32:
        key = 'SPACE'; break;
    case 37:
        key = 'LEFT'; break;
    case 38:
        key = 'UP'; break;
    case 39:
        key = 'RIGHT'; break;
    case 40:
        key = 'DOWN'; break;
    default:
        // Convert ASCII codes to letters
        key = String.fromCharCode(code);
    }

    pressedKeys[key] = status;
}

document.addEventListener('keydown', function(e) {
    setKey(e, true);
});

document.addEventListener('keyup', function(e) {
    setKey(e, false);
});

window.addEventListener('blur', function() {
    pressedKeys = {};
});

var input = {
    isDown: function(key) {
        return pressedKeys[key.toUpperCase()];
    },
    addKey : function(code){
        pressedKeys[code.toUpperCase()] = true;
    },
    removeKey: function(code){
        pressedKeys[code.toUpperCase()] =  false;
    }
};

module.exports = input;
},{}],4:[function(require,module,exports){
var Victor = require('victor');
var utils = require('../utils');
var sprite = require('../sprite');
var entity = require('./entity');

function birdEntity(opts){
  opts.x = opts.x || 100;
  opts.y = opts.y || window.innerHeight/2;
  opts.speedY = opts.speed || -200;
  opts.speedX = opts.speed || -200;

  entity.prototype.constructor.call(this, opts);
  this.color = opts.color || 'black';
  this.colorFancy = utils.randomRGBColor();
  this.angle = opts.angle || 0;
  this.destinyAngle = this.angle;
  this.size = opts.size || 10;
}
birdEntity.prototype = new entity({x: 0, y : 0});

birdEntity.prototype.getRepulsionRadius = function(){
  return window.SETTINGS.birdRepulsionRadius.value;
}
birdEntity.prototype.getAligmentRadius = function(){
  return window.SETTINGS.birdAlignmentRadius.value;
}
birdEntity.prototype.getAttractionRadius = function(){
  return window.SETTINGS.birdAttractionRadius.value;
}
birdEntity.prototype.getSightRadius = function(){
  return window.SETTINGS.birdSightRadius.value;
}

birdEntity.prototype.getSpeed = function(){
  return window.SETTINGS.birdSpeed.value;
}

birdEntity.prototype.constructor = birdEntity;
birdEntity.prototype.parent = entity.prototype;

birdEntity.prototype.render = function(ctx){

  if( window.SETTINGS.debugging.value == 3 ){
    //Attraction  zone
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(42, 250, 33, 0.30)';
    ctx.arc(this.pos.x, this.pos.y, this.getAttractionRadius(), Math.PI*2, false);
    ctx.stroke();
  }

  if( window.SETTINGS.debugging.value == 2 || window.SETTINGS.debugging.value == 3 ){
    //Alignment  zone
    ctx.beginPath();
    ctx.fillStyle = 'rgba(33, 42, 250, 0.20)';
    ctx.arc(this.pos.x, this.pos.y, this.getAligmentRadius(), Math.PI*2, false);
    ctx.fill();
  }
  if(window.SETTINGS.debugging.value == 1 || window.SETTINGS.debugging.value == 2 || window.SETTINGS.debugging.value == 3 ){
    //Repulsion zone
    ctx.beginPath();
    ctx.fillStyle = 'rgba(250, 33, 33, 0.30)';
    ctx.arc(this.pos.x, this.pos.y, this.getRepulsionRadius(), Math.PI*2, false);
    ctx.fill();
  }

  //Bird
  ctx.fillStyle = this.leader === true ? 'red' : this.color;


  ctx.beginPath();
  this.opacity = 0.8;
  //a gradient instead of white fill
  var gradient = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, this.pos.x, this.pos.y, this.size);
  gradient.addColorStop(0, "rgba("+this.colorFancy.r+", "+this.colorFancy.g+", "+this.colorFancy.b+", "+this.opacity+")");
  gradient.addColorStop(0.5, "rgba("+this.colorFancy.r+", "+this.colorFancy.g+", "+this.colorFancy.b+", "+this.opacity+")");
  gradient.addColorStop(1, "rgba("+this.colorFancy.r+", "+this.colorFancy.g+", "+this.colorFancy.b+", 0)");
  ctx.fillStyle = gradient;
  ctx.arc(this.pos.x, this.pos.y, 2, Math.PI*2, false);
  ctx.fill();   
  

}

birdEntity.prototype.update = function(dt){
  
  //Only applies for leaders
  if(this.destinyAngle && this.destinyAngle != this.angle){
    if(this.angle < this.destinyAngle){
      this.angle = (this.angle + dt) > this.destinyAngle ? this.destinyAngle : (this.angle + dt);
    }else{
      this.angle = (this.angle - dt) < this.destinyAngle ? this.destinyAngle : (this.angle - dt);
    }
    //Uncomment for weird movement
    //this.angle = this.destinyAngle * dt;
    //this.speed.rotateDeg(this.angle);
  }
  
  var speedDt = new Victor(this.getSpeed(), this.getSpeed()).multiply(new Victor(dt, dt)).rotateDeg(this.angle);
  
  this.pos = this.pos.add(speedDt);

  //Check borders
  if(this.pos.x > window.innerWidth){
    this.pos.x = 0;
  }else if(this.pos.x < 0){
    this.pos.x = window.innerWidth;
  }
  if(this.pos.y > window.innerHeight){
    this.pos.y = 0;
  }else if(this.pos.y < 0){
    this.pos.y = window.innerHeight;
  }
}

module.exports = birdEntity;
},{"../sprite":15,"../utils":16,"./entity":7,"victor":17}],5:[function(require,module,exports){
var entities = require('./entities');
var utils = require('../utils');
var QuadTree = require('../QuadTree');
var tree;

function newBird(x,y){
  return  new entities.birdEntity({
    x: x,
    y: y,
    speed: 80,
    mass: utils.random(10, 30),
    life: utils.random(10, 500),
    angle: 0
  });
}

function getPackOfBirds(limitWidth, limitHeight, amount){
  var screenFactor = (window.innerWidth / window.innerHeight);
  var lower = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
  var randomLeaderIndex = utils.random(0, amount - 1);

  var pack = [];
  
  for(var i = 0; i < amount; i++){
    var x = utils.random(0, limitWidth);
    var y = utils.random(0, limitHeight);
    var bird = newBird(x,y);
    if(i === randomLeaderIndex){
      bird.leader = true;
    }
    pack.push(bird);
  }

  //Initialize quad tree.
  tree = new QuadTree({
    x: 0, 
    y: 0,
    width: limitWidth,
    height: limitHeight
  });
  
  //Insert on QuadTree
  updateTree(pack);

  //Assign a random leader
  var leaderIndex = utils.random(0, pack.length);
  pack[leaderIndex].leader = true;

  return pack;
}

function updateTree(pack){
  tree.clear();
  insertTree(pack,'pack');
}

function insertTree(arr, name){
  for(var i = 0; i < arr.length; i++){
    var el = arr[i];
    tree.insert({
      x: el.pos.x,
      y: el.pos.y,
      width: el.size,
      height: el.size,
      type: name,
      indexOriginalObject: i
    })
  }
}


function updatePackOfBirds(pack, ctx, enemies){

  //Changeof leadership
  var shouldChangeLeader = utils.random(0, 2000) < 10;

  if(shouldChangeLeader){
    var newLeaderIndex = utils.random(0, pack.length);

    function clearLeader(group){
      group = group.map(function(item){
        item.leader = false;
        return item;
      });
    }

    function assignLeader(group,indexLeader){
      group = group.map(function(item,index){
        if(index == indexLeader){
          item.leader = true;
        }
        return item;
      });
    }

    clearLeader(pack);
    assignLeader(pack, newLeaderIndex);
  }

  var meanX, meanY, dx, dy, separation, cohesion, alignmen, avoiding;

  for(var i = 0; i < pack.length; i++){

      //Get the 7 nearest birds
      //var neighbors = getNearest(pack[i], i, pack, 7, window.innerWidth * 10);
      //var nearBirds = getNearest(pack[i], i, pack, 7, 30);
      var neighbors = kNearest(pack[i], pack, 7, pack[i].getAttractionRadius());
      var alignmentNeighbors = kNearest(pack[i], pack, 7, pack[i].getAligmentRadius());
      var birdsInRepulsionZone = kNearest(pack[i], pack, 7, pack[i].getRepulsionRadius());
      var enemiesNear = kNearest(pack[i], enemies, 2, pack[i].getSightRadius());

      
      for(var n = 0; n < neighbors.length; n++){
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.beginPath();
        ctx.moveTo(pack[i].pos.x, pack[i].pos.y);
        ctx.lineTo(neighbors[n].pos.x, neighbors[n].pos.y);
        ctx.closePath();
        ctx.stroke();
      }

      for(var n = 0; n < alignmentNeighbors.length; n++){
        ctx.strokeStyle = "rgba(64, 143, 64, 0.76)";
        ctx.beginPath();
        ctx.moveTo(pack[i].pos.x, pack[i].pos.y);
        ctx.lineTo(alignmentNeighbors[n].pos.x, alignmentNeighbors[n].pos.y);
        ctx.closePath();
        ctx.stroke();
      }

      for(var n = 0; n < birdsInRepulsionZone.length; n++){
        ctx.strokeStyle = "rgba(185, 28, 28, 0.54)";
        ctx.beginPath();
        ctx.moveTo(pack[i].pos.x, pack[i].pos.y);
        ctx.lineTo(birdsInRepulsionZone[n].pos.x, birdsInRepulsionZone[n].pos.y);
        ctx.closePath();
        ctx.stroke();
      }

      for(var n = 0; n < enemiesNear.length; n++){
        ctx.strokeStyle = "rgba(185, 28, 28, 0.54)";
        ctx.beginPath();
        ctx.moveTo(pack[i].pos.x, pack[i].pos.y);
        ctx.lineTo(enemiesNear[n].pos.x, enemiesNear[n].pos.y);
        ctx.closePath();
        ctx.stroke();
      }
      
      
      //var meanAngleX = arrayMean(neighbors, function(b){ return Math.cos(b.angle); });
      //var meanAngleY = arrayMean(neighbors, function(b){ return Math.sin(b.angle); });

      //var averageAngle = Math.atan2(meanAngleY,meanAngleX);
      
      // 1. Separation - avoid crowding neighbors (short range repulsion)
      separation = 0;
      if (birdsInRepulsionZone.length > 0) {
          meanX = arrayMean(birdsInRepulsionZone, function(b){return b.pos.x});
          meanY = arrayMean(birdsInRepulsionZone, function(b){return b.pos.y});
          dx = meanX - pack[i].pos.x;
          dy = meanY - pack[i].pos.y;
          separation = (Math.atan2(dx, dy) * 180 / Math.PI) - pack[i].angle;
          separation += 180;
      }

      // 2. Alignment - steer towards average heading of neighbors
      alignment = 0;

      if (alignmentNeighbors.length > 0) {
          alignment = arrayMean(alignmentNeighbors, function(b){ return b.angle }) - pack[i].angle;
      }

      // 3. Cohesion - steer towards average position of neighbors (long range attraction)
      cohesion = 0;

      if (neighbors.length > 0) {
          meanX = arrayMean(neighbors, function(b){return b.pos.x});
          meanY = arrayMean(neighbors, function(b){return b.pos.y});
          dx = meanX - pack[i].pos.x;
          dy = meanY - pack[i].pos.y;
          cohesion = (Math.atan2(dx, dy) * 180 / Math.PI) - pack[i].angle;
      }
     

      avoiding = 0;
      //4. Avoid near enemies
      if(enemiesNear.length > 0){
        meanX = arrayMean(enemiesNear, function(b){return b.pos.x});
        meanY = arrayMean(enemiesNear, function(b){return b.pos.y});
        dx = meanX - pack[i].pos.x;
        dy = meanY - pack[i].pos.y;
        avoiding = (Math.atan2(dx, dy) * 180 / Math.PI) - pack[i].angle;
        avoiding += 180;
      }

      var turnAmount;
      if(avoiding){
        //console.log('avoiding')
        turnAmount = avoiding;
      }else{
        turnAmount = (cohesion * 0.01) + (alignment * 0.5) + (separation * 0.25);
      }
      pack[i].angle += turnAmount;
  }


  //Assign fear variable
  var hasFear = utils.random(0, 1000) < 10;

  if(hasFear){
    var newAngleOfMovement = utils.random(0, 360);

    function changeAngleOfLeader(group, angle){
      group = group.map(function(item){
        if(item.leader === true){
          item.destinyAngle = angle;
        }
        return item;
      });
    }

    changeAngleOfLeader(pack, newAngleOfMovement);
  }
  //Apply cohesion 5-10 nearest birds, independant from distance
  //TODO

  /*
   In flocking simulations, there is no central control; each bird behaves autonomously. 
   In other words, each bird has to decide for itself which flocks to consider as 
   its environment. 
   Usually environment is defined as a circle (2D) or sphere (3D) 
   with a certain radius (representing reach).
  */


  //Possible improvements bin-lattice spatial subdivision


  updateTree(pack);
}


//Return the N nearest neighbors of a bird
function getNearest(bird, indexOriginalObject, pack, desiredNearestAmount, maxSize ){

  function accumulate (acc, radius){
    if(radius > maxSize){
      //Avoid maximum call stack
      return acc;
    }

    var allItemsFound = tree.retrieve({x: bird.pos.x, y: bird.pos.y, height: radius, width: radius  })
    
    //Remove current item
    allItemsFound = _.compact(_.clone(allItemsFound).map(function(item){
      if(item.indexOriginalObject != indexOriginalObject){
        return item;
      }
    }));


    if(allItemsFound.length == desiredNearestAmount){
      return allItemsFound;
    }

    if(allItemsFound.length < desiredNearestAmount){
      return accumulate(allItemsFound, radius + 100);
    }else if(allItemsFound.length > desiredNearestAmount){ 

      var initialLength = acc.length;
      var actualLength = allItemsFound.length;
      var amountNeeded = (actualLength - initialLength) > desiredNearestAmount ? desiredNearestAmount : actualLength - initialLength;
      var diff = _.difference(allItemsFound, acc);

      function getTheNearestWithLimitOf(arr, item, maxItems){
        var newDistance = pack[item.indexOriginalObject].pos.distance(bird.pos);

        if(arr.length < maxItems){
          arr.push(item);
          return arr;
        }

        var maxiMumDistanceItemIndex = arr.indexOf(_.max(arr, function(i){
          return i.distance;
        }));
        arr[maxiMumDistanceItemIndex] = item;
        return arr;
      }

      function getNearestOfGroup (selectedItems, items, amountNeeded){
        if(items.length == 0){
          return selectedItems;
        }
        var newItem = items.shift();
        newItem.distance = pack[newItem.indexOriginalObject].pos.distance(bird.pos);
        selectedItems = getTheNearestWithLimitOf(selectedItems, newItem, amountNeeded);
        
        return getNearestOfGroup(selectedItems, items, amountNeeded);
      }
 
      return acc.concat(getNearestOfGroup([], diff, amountNeeded));
    }
  }

  //Map the points to the original pack
  var nearestPoints =  accumulate([], 5);
  return nearestPoints.map(function(item){
    return pack[item.indexOriginalObject];
  });
}

//Calculates the mean of the array a1 on the field idx
function arrayMean (a1, extractor) {
  'use strict';
  var result, i;

  result = 0;
  for (i = 0; i < a1.length; i += 1) {
      result += extractor(a1[i]);
  }
  result /= a1.length;
  return result;
};

function kNearest(a1, lst, k, maxDist) {
    'use strict';
    var result = [], tempDist = [], idx = 0, worstIdx = -1, dist, agent;

    while (idx < lst.length) {
        agent = lst[idx];
        if (a1 !== agent) {
            dist = a1.pos.distance(agent.pos);
            if (dist < maxDist) {
                if (result.length < k) {
                    result.push(agent);
                    tempDist.push(dist);
                    worstIdx = tempDist.indexOf(_.max(tempDist));
                } else {
                    if (dist < tempDist[worstIdx]) {
                        tempDist[worstIdx] = dist;
                        result[worstIdx] = agent;
                        worstIdx = tempDist.indexOf(_.max(tempDist));
                    }
                }
            }
        }

        idx += 1;
    }

    return result;
};





module.exports.updatePackOfBirds = updatePackOfBirds;
module.exports.getPackOfBirds = getPackOfBirds;
},{"../QuadTree":1,"../utils":16,"./entities":6}],6:[function(require,module,exports){
var entity = require('./entity');
var textEntity = require('./textEntity');
var birdEntity = require('./birdEntity');
var particleEntity = require('./particleEntity');

module.exports = {
  entity: entity,
  textEntity: textEntity,
  particleEntity: particleEntity,
  birdEntity: birdEntity
}
},{"./birdEntity":4,"./entity":7,"./particleEntity":8,"./textEntity":11}],7:[function(require,module,exports){
var Victor = require('victor');

function entity(opts){
  this.pos = new Victor(opts.x,opts.y);
  this.speed = new Victor(opts.speedX || 0, opts.speedY || 0);
  this.acceleration = new Victor(opts.accX || 0, opts.accY || 0);
}

entity.prototype.update = function(dt){
  this.speed.add(this.acceleration);
  var speedDt = new Victor(this.speed.x, this.speed.y).multiply(new Victor(dt, dt));
  this.pos = this.pos.add(speedDt);
}

entity.prototype.render = function(ctx){
  //Implement
}

module.exports = entity;
},{"victor":17}],8:[function(require,module,exports){
var Victor = require('victor');
var entity = require('./entity');
var utils = require('../utils');

function particleEntity(opts){
  entity.prototype.constructor.call(this, opts);
  this.color = opts.color || {r:0, g: 0, b: 0};
  this.mass = opts.mass || 1;
  this.angle = opts.angle || 0;
  this.radius = opts.radius || 5;
  this.life = opts.life || 200;
  this.remaining_life = this.life;
  this.opacity = 1;
  this.operator = utils.flipCoin() ? 1 : -1;
}

particleEntity.prototype = new entity({x: 0, y : 0});
particleEntity.prototype.constructor = particleEntity;
particleEntity.prototype.parent = entity.prototype;

particleEntity.prototype.render = function(ctx){

  ctx.beginPath();
  this.opacity = Math.round(this.remaining_life/this.life*100)/100
  //a gradient instead of white fill
  var gradient = ctx.createRadialGradient(this.pos.x, this.pos.y, 0, this.pos.x, this.pos.y, this.radius);
  gradient.addColorStop(0, "rgba("+this.color.r+", "+this.color.g+", "+this.color.b+", "+this.opacity+")");
  gradient.addColorStop(0.5, "rgba("+this.color.r+", "+this.color.g+", "+this.color.b+", "+this.opacity+")");
  gradient.addColorStop(1, "rgba("+this.color.r+", "+this.color.g+", "+this.color.b+", 0)");
  ctx.fillStyle = gradient;
  ctx.arc(this.pos.x, this.pos.y, this.radius, Math.PI*2, false);
  ctx.fill();

  if(!this.dying){
    if(this.remaining_life < 0 ){
      this.operator = 1;
    }else if(this.remaining_life > this.life){
      this.operator = -1;
    }

    this.operator < 0 ? this.remaining_life-- : this.remaining_life++;
  }else{
    this.remaining_life--;
  }
}

module.exports = particleEntity;
},{"../utils":16,"./entity":7,"victor":17}],9:[function(require,module,exports){
var entities = require('./entities');
var utils = require('../utils');
var particles = getColorParticles(null, 50);

function newParticle(color){
  return  new entities.particleEntity({
      x: utils.random(0, window.innerWidth),
      y: utils.random(0, window.innerHeight),
      radius: utils.random(5, 20),
      speedX: utils.random(-20, 20),
      speedY: utils.random(-20, 20),
      mass: utils.random(10, 30),
      life: utils.random(10, 500),
      color: color || utils.randomRGBColor()
    });
}

function getColorParticles(color, amount, baseRemainingLife){
  var p = [];
  amount = amount ? amount : 20;
  for(var i = 0; i < amount; i++){
    var particle = newParticle(color);
    if(baseRemainingLife != null){ particle.remaining_life = baseRemainingLife} ;
    p.push(particle);
  }
  return p;
}

function newFireParticle(){
  return  new entities.particleEntity({
      x: Math.ceil(window.innerWidth/2),
      y: Math.ceil(window.innerHeight/2),
      radius: utils.random(5, 20),
      speedX: utils.random(-20, 20),
      speedY: utils.random(-20, -40),
      mass: utils.random(10, 30),
      life: utils.random(10, 300),
      color: utils.randomRGBColor()
    });
}

function getFireParticles (){
  var p = [];
  for(var i = 0; i < 100; i++){
    p.push(newFireParticle())
  }
  return p;
}

module.exports.particles = particles;
module.exports.newParticle = newParticle;
module.exports.newFireParticle = newFireParticle;
module.exports.getColorParticles = getColorParticles;
module.exports.getFireParticles = getFireParticles;
},{"../utils":16,"./entities":6}],10:[function(require,module,exports){
var entity = require('./entity');
var sprite = require('../sprite');
var Victor = require('victor');

function Player(opts){
  entity.prototype.constructor.call(this, opts);
  this.mass = opts.mass || 1;
  this.angle = opts.angle || 0;
  this.radius = opts.radius || 5;
  this.life = opts.life || 200;
  this.remaining_life = this.life;
  this.maxSpeed = opts.maxSpeed || 200;

}

Player.prototype.render = function(ctx){
  ctx.beginPath();
  ctx.fillStyle = 'black';
  ctx.arc(this.pos.x, this.pos.y, this.radius, Math.PI*2, false);
  ctx.fill();   
  
}

Player.prototype.update = function(dt){
  if((this.speed.x < this.maxSpeed && this.acceleration.x > 0)  || this.acceleration.x < 0){
    this.speed.add(this.acceleration);
  }

  if(this.destinyAngle != null && this.destinyAngle != this.angle){
    if(this.angle < this.destinyAngle){
      this.angle = (this.angle + dt * 100) > this.destinyAngle ? this.destinyAngle : (this.angle + dt* 100 );
    }else{
      this.angle = (this.angle - dt * 100) < this.destinyAngle ? this.destinyAngle : (this.angle - dt* 100);
    }
  }

  var speedDt = new Victor(this.speed.x, this.speed.y).multiply(new Victor(dt, dt)).rotateDeg(this.angle);
  
  this.pos = this.pos.add(speedDt);

  //Check borders
  if(this.pos.x > window.innerWidth){
    this.pos.x = 0;
  }else if(this.pos.x < 0){
    this.pos.x = window.innerWidth;
  }
  if(this.pos.y > window.innerHeight){
    this.pos.y = 0;
  }else if(this.pos.y < 0){
    this.pos.y = window.innerHeight;
  }
}

module.exports = Player;
},{"../sprite":15,"./entity":7,"victor":17}],11:[function(require,module,exports){
var Victor = require('victor');
var entity = require('./entity');

function textEntity(opts){
  opts.x = opts.x || 100;
  opts.y = opts.y || window.innerHeight;
  opts.speedY = opts.speedY || -200;

  entity.prototype.constructor.call(this, opts);
  this.color = opts.color || 'white';
  this.font = opts.font || '40px Indie Flower';
  this.text = opts.text || 'test text';
}

textEntity.prototype = new entity({x: 0, y : 0});
textEntity.prototype.constructor = textEntity;
textEntity.prototype.parent = entity.prototype;

textEntity.prototype.render = function(ctx){
  ctx.fillStyle = this.color;
  ctx.font = this.font;
  if(typeof(this.text) == 'object'){
    for(var i = 0; i < this.text.length; i++){
      this.printText(ctx,this.text[i], this.pos.y + (70 * i));
    }
  }else{
    this.printText(ctx,this.text, this.pos.y);
  }
}

textEntity.prototype.printText = function(ctx, text, posY){
  var textWidth = ctx.measureText(text).width;
  ctx.fillText(text , (window.innerWidth/2) - (textWidth / 2), posY);
}

textEntity.prototype.getTextHeight = function(){
  if(typeof(this.text) == 'object'){
    var amount = 50 * this.text.length;
    return amount;
  }else{
    return 40;
  }
}

module.exports = textEntity;
},{"./entity":7,"victor":17}],12:[function(require,module,exports){
var entities = require('./entities');

var texts = [];
var suscribers = [];

var intro =  new entities.textEntity({
  text: ['Colors',
  'by rafinskipg']
});

var predefinedTexts = [
  {
    text: ['Red',
    'as your eyes after programming all day',
    'as deep',
    'deeep',
    'deeep',
    'goatse'],
    trigger: 'red'
  },{
    text: ['Green',
    '',
    'as bulbasur'],
    trigger: 'green'
  },
  {
    text: ['Brown',
    'because potatoes'],
    trigger: 'brown'
  },
  {
    text: ['Blue',
    'azuulll porque tu amor es azull',
    'como el marr azullllll'],
    trigger: 'blue'
  },
  {
    text: ['Yellow','porque yellow mis cohonéééé'],
    trigger: 'yellow'
  },
  {
    text: ['White', 'as walter', 'like santas beard'],
    trigger: 'white'
  },
  {
    text: [
    'All','because potatoes again'],
    trigger: 'default'
  },
  {
    text: ['fire', ':)'],
    trigger: 'fire'
  }
]

function trigger(index){
  suscribers.forEach(function(sus){
    sus(index);
  });
}

function suscribe(fn){
  suscribers.push(fn);
}

function newText(){
  var text = predefinedTexts.shift();
  console.log(text)
  return new entities.textEntity({ text: text.text});
}

function prepareNewText(){
  var text = predefinedTexts[0];
  trigger(text.trigger);
}

texts.push(intro);

module.exports.texts = texts;
module.exports.newText = newText;
module.exports.prepareNewText = prepareNewText;
module.exports.suscribe = suscribe;
},{"./entities":6}],13:[function(require,module,exports){
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
},{"./input":3,"./models/playerModel":10}],14:[function(require,module,exports){
window.SETTINGS = {
  birdSpeed:{
    name: 'Bird speed',
    value: 80
  },
  birdSightRadius:{
    name: 'Bird sight radius',
    value: 100
  },
  birdAttractionRadius: {
    name: 'Bird attraction radius - Green',
    value: 130
  },
  birdAlignmentRadius: {
    name: 'Bird alignment radius - Blue',
    value: 24
  },
  birdRepulsionRadius: {
    name: 'Bird repulsion radius - Red',
    value: 11
  },
  birdSightRadius: {
    name: 'Bird sight radius',
    value: 300
  },
  debugging:{
    name:'Debugging level',
    value: 0,
    max: 5
  }
}
},{}],15:[function(require,module,exports){
function Sprite(img){
	this.img = img;
	this.animations = {};
}

Sprite.prototype.addAnimation = function (name, frames, size, duration, pos, direction){
	pos = pos ? pos : [0,0];
	direction = direction ? direction : 'horizontal';

	this.animations[name] = {
		frames: frames,
		frameTime: duration/1000/frames.length,
		size: size,
		direction: direction,
		pos: pos,
		frameIndex : 0,
		frameDt : 0
	}
}

Sprite.prototype.playAnimation = function (name, reset){
	this.currentAnimation = name;
	if(reset){
		this.animations[name].frameIndex = 0;
		this.animations[name].frameDt = 0;
	}
}

Sprite.prototype.update = function(dt){
	var currentAnimation = this.animations[this.currentAnimation];
	if(currentAnimation){
		currentAnimation.frameDt += dt;
		if(currentAnimation.frameDt >= currentAnimation.frameTime){
      currentAnimation.frameDt = 0;
			currentAnimation.frameIndex = currentAnimation.frameIndex < (currentAnimation.frames.length - 1) ? currentAnimation.frameIndex + 1 : 0;
		}
	}
}

Sprite.prototype.render = function(ctx, x, y, resizeX, resizeY, angle){
	var currentAnimation = this.animations[this.currentAnimation];
	if(currentAnimation){
		var width = resizeX ? resizeX : currentAnimation.size[0];
		var height = resizeY ? resizeY : currentAnimation.size[1];
	  
    ctx.save();
    ctx.translate(x,y);

    if(angle){   
      ctx.rotate(angle * Math.PI / 180);
    }

		ctx.drawImage(
      this.img,
      currentAnimation.pos[0] + (currentAnimation.size[0] * currentAnimation.frames[currentAnimation.frameIndex]),
      currentAnimation.pos[1],
      currentAnimation.size[0],
      currentAnimation.size[1],
      - width/2, -height/2,
      width,
      height
    );

    if(angle){
      ctx.translate(-width/2, -height/2) ; 
    }
    
    ctx.restore();
	}
	
}

module.exports = Sprite;
},{}],16:[function(require,module,exports){
function random(a, b){
  return Math.floor(Math.random() * b) + a;
}

function randomColor(){
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function randomRGBColor(){
  var color = {};
  color.r = Math.round(Math.random()*255);
  color.g = Math.round(Math.random()*255);
  color.b = Math.round(Math.random()*255);
  return color;
}

function flipCoin() {
    return (Math.floor(Math.random() * 2) == 0);
}

module.exports = {
  random: random,
  randomColor: randomColor,
  randomRGBColor: randomRGBColor,
  flipCoin: flipCoin
}
},{}],17:[function(require,module,exports){
exports = module.exports = Victor;

/**
 * # Victor - A JavaScript 2D vector class with methods for common vector operations
 */

/**
 * Constructor. Will also work without the `new` keyword
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = Victor(42, 1337);
 *
 * @param {Number} x Value of the x axis
 * @param {Number} y Value of the y axis
 * @return {Victor}
 * @api public
 */
function Victor (x, y) {
	if (!(this instanceof Victor)) {
		return new Victor(x, y);
	}

	/**
	 * The X axis
	 *
	 * ### Examples:
	 *     var vec = new Victor.fromArray(42, 21);
	 *
	 *     vec.x;
	 *     // => 42
	 *
	 * @api public
	 */
	this.x = x || 0;

	/**
	 * The Y axis
	 *
	 * ### Examples:
	 *     var vec = new Victor.fromArray(42, 21);
	 *
	 *     vec.y;
	 *     // => 21
	 *
	 * @api public
	 */
	this.y = y || 0;
};

/**
 * # Static
 */

/**
 * Creates a new instance from an array
 *
 * ### Examples:
 *     var vec = Victor.fromArray([42, 21]);
 *
 *     vec.toString();
 *     // => x:42, y:21
 *
 * @name Victor.fromArray
 * @param {Array} array Array with the x and y values at index 0 and 1 respectively
 * @return {Victor} The new instance
 * @api public
 */
Victor.fromArray = function (arr) {
	return new Victor(arr[0] || 0, arr[1] || 0);
};

/**
 * Creates a new instance from an object
 *
 * ### Examples:
 *     var vec = Victor.fromObject({ x: 42, y: 21 });
 *
 *     vec.toString();
 *     // => x:42, y:21
 *
 * @name Victor.fromObject
 * @param {Object} obj Object with the values for x and y
 * @return {Victor} The new instance
 * @api public
 */
Victor.fromObject = function (obj) {
	return new Victor(obj.x || 0, obj.y || 0);
};

/**
 * # Manipulation
 *
 * These functions are chainable.
 */

/**
 * Adds another vector's X axis to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.addX(vec2);
 *     vec1.toString();
 *     // => x:30, y:10
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addX = function (vec) {
	this.x += vec.x;
	return this;
};

/**
 * Adds another vector's Y axis to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.addY(vec2);
 *     vec1.toString();
 *     // => x:10, y:40
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.addY = function (vec) {
	this.y += vec.y;
	return this;
};

/**
 * Adds another vector to this one
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.add(vec2);
 *     vec1.toString();
 *     // => x:30, y:40
 *
 * @param {Victor} vector The other vector you want to add to this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.add = function (vec) {
	this.x += vec.x;
	this.y += vec.y;
	return this;
};

/**
 * Subtracts the X axis of another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtractX(vec2);
 *     vec1.toString();
 *     // => x:80, y:50
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractX = function (vec) {
	this.x -= vec.x;
	return this;
};

/**
 * Subtracts the Y axis of another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtractY(vec2);
 *     vec1.toString();
 *     // => x:100, y:20
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtractY = function (vec) {
	this.y -= vec.y;
	return this;
};

/**
 * Subtracts another vector from this one
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(20, 30);
 *
 *     vec1.subtract(vec2);
 *     vec1.toString();
 *     // => x:80, y:20
 *
 * @param {Victor} vector The other vector you want subtract from this one
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.subtract = function (vec) {
	this.x -= vec.x;
	this.y -= vec.y;
	return this;
};

/**
 * Divides the X axis by the x component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 0);
 *
 *     vec.divideX(vec2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Victor} vector The other vector you want divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideX = function (vector) {
	this.x /= vector.x;
	return this;
};

/**
 * Divides the Y axis by the y component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(0, 2);
 *
 *     vec.divideY(vec2);
 *     vec.toString();
 *     // => x:100, y:25
 *
 * @param {Victor} vector The other vector you want divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divideY = function (vector) {
	this.y /= vector.y;
	return this;
};

/**
 * Divides both vector axis by a axis values of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 2);
 *
 *     vec.divide(vec2);
 *     vec.toString();
 *     // => x:50, y:25
 *
 * @param {Victor} vector The vector to divide by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.divide = function (vector) {
	this.x /= vector.x;
	this.y /= vector.y;
	return this;
};

/**
 * Inverts the X axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invertX();
 *     vec.toString();
 *     // => x:-100, y:50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invertX = function () {
	this.x *= -1;
	return this;
};

/**
 * Inverts the Y axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invertY();
 *     vec.toString();
 *     // => x:100, y:-50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invertY = function () {
	this.y *= -1;
	return this;
};

/**
 * Inverts both axis
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.invert();
 *     vec.toString();
 *     // => x:-100, y:-50
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.invert = function () {
	this.invertX();
	this.invertY();
	return this;
};

/**
 * Multiplies the X axis by X component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 0);
 *
 *     vec.multiplyX(vec2);
 *     vec.toString();
 *     // => x:200, y:50
 *
 * @param {Victor} vector The vector to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyX = function (vector) {
	this.x *= vector.x;
	return this;
};

/**
 * Multiplies the Y axis by Y component of given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(0, 2);
 *
 *     vec.multiplyX(vec2);
 *     vec.toString();
 *     // => x:100, y:100
 *
 * @param {Victor} vector The vector to multiply the axis with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiplyY = function (vector) {
	this.y *= vector.y;
	return this;
};

/**
 * Multiplies both vector axis by values from a given vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     var vec2 = new Victor(2, 2);
 *
 *     vec.multiply(vec2);
 *     vec.toString();
 *     // => x:200, y:100
 *
 * @param {Victor} vector The vector to multiply by
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.multiply = function (vector) {
	this.x *= vector.x;
	this.y *= vector.y;
	return this;
};

/**
 * Normalize
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.normalize = function () {
	var length = this.length();

	if (length === 0) {
		this.x = 1;
		this.y = 0;
	} else {
		this.divide(Victor(length, length));
	}
	return this;
};

Victor.prototype.norm = Victor.prototype.normalize;

/**
 * If the absolute vector axis is greater than `max`, multiplies the axis by `factor`
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.limit(80, 0.9);
 *     vec.toString();
 *     // => x:90, y:50
 *
 * @param {Number} max The maximum value for both x and y axis
 * @param {Number} factor Factor by which the axis are to be multiplied with
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.limit = function (max, factor) {
	if (Math.abs(this.x) > max){ this.x *= factor; }
	if (Math.abs(this.y) > max){ this.y *= factor; }
	return this;
};

/**
 * Randomizes both vector axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomize(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:67, y:73
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomize = function (topLeft, bottomRight) {
	this.randomizeX(topLeft, bottomRight);
	this.randomizeY(topLeft, bottomRight);

	return this;
};

/**
 * Randomizes the y axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeX(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:55, y:50
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeX = function (topLeft, bottomRight) {
	var min = Math.min(topLeft.x, bottomRight.x);
	var max = Math.max(topLeft.x, bottomRight.x);
	this.x = random(min, max);
	return this;
};

/**
 * Randomizes the y axis with a value between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeY(new Victor(50, 60), new Victor(70, 80`));
 *     vec.toString();
 *     // => x:100, y:66
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeY = function (topLeft, bottomRight) {
	var min = Math.min(topLeft.y, bottomRight.y);
	var max = Math.max(topLeft.y, bottomRight.y);
	this.y = random(min, max);
	return this;
};

/**
 * Randomly randomizes either axis between 2 vectors
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.randomizeAny(new Victor(50, 60), new Victor(70, 80));
 *     vec.toString();
 *     // => x:100, y:77
 *
 * @param {Victor} topLeft first vector
 * @param {Victor} bottomRight second vector
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.randomizeAny = function (topLeft, bottomRight) {
	if (!! Math.round(Math.random())) {
		this.randomizeX(topLeft, bottomRight);
	} else {
		this.randomizeY(topLeft, bottomRight);
	}
	return this;
};

/**
 * Rounds both axis to an integer value
 *
 * ### Examples:
 *     var vec = new Victor(100.2, 50.9);
 *
 *     vec.unfloat();
 *     vec.toString();
 *     // => x:100, y:51
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.unfloat = function () {
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	return this;
};

/**
 * Performs a linear blend / interpolation of the X axis towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mixX(vec2, 0.5);
 *     vec.toString();
 *     // => x:150, y:100
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mixX = function (vec, amount) {
	if (typeof amount === 'undefined') {
		amount = 0.5;
	}

	this.x = (1 - amount) * this.x + amount * vec.x;
	return this;
};

/**
 * Performs a linear blend / interpolation of the Y axis towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mixY(vec2, 0.5);
 *     vec.toString();
 *     // => x:100, y:150
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mixY = function (vec, amount) {
	if (typeof amount === 'undefined') {
		amount = 0.5;
	}

	this.y = (1 - amount) * this.y + amount * vec.y;
	return this;
};

/**
 * Performs a linear blend / interpolation towards another vector
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 100);
 *     var vec2 = new Victor(200, 200);
 *
 *     vec1.mix(vec2, 0.5);
 *     vec.toString();
 *     // => x:150, y:150
 *
 * @param {Victor} vector The other vector
 * @param {Number} amount The blend amount (optional, default: 0.5)
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.mix = function (vec, amount) {
	this.mixX(vec, amount);
	this.mixY(vec, amount);
	return this;
};

/**
 * # Products
 */

/**
 * Creates a clone of this vector
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = vec1.clone();
 *
 *     vec2.toString();
 *     // => x:10, y:10
 *
 * @return {Victor} A clone of the vector
 * @api public
 */
Victor.prototype.clone = function () {
	return new Victor(this.x, this.y);
};

/**
 * Copies another vector's X component in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copyX(vec1);
 *
 *     vec2.toString();
 *     // => x:20, y:10
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copyX = function (vec) {
	this.x = vec.x;
	return this;
};

/**
 * Copies another vector's Y component in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copyY(vec1);
 *
 *     vec2.toString();
 *     // => x:10, y:20
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copyY = function (vec) {
	this.y = vec.y;
	return this;
};

/**
 * Copies another vector's X and Y components in to its own
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *     var vec2 = new Victor(20, 20);
 *     var vec2 = vec1.copy(vec1);
 *
 *     vec2.toString();
 *     // => x:20, y:20
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.copy = function (vec) {
	this.copyX(vec);
	this.copyY(vec);
	return this;
};

/**
 * Sets the vector to zero (0,0)
 *
 * ### Examples:
 *     var vec1 = new Victor(10, 10);
 *		 var1.zero();
 *     vec1.toString();
 *     // => x:0, y:0
 *
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.zero = function () {
	this.x = this.y = 0;
	return this;
};

/**
 * Calculates the dot product of this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.dot(vec2);
 *     // => 23000
 *
 * @param {Victor} vector The second vector
 * @return {Number} Dot product
 * @api public
 */
Victor.prototype.dot = function (vec2) {
	return this.x * vec2.x + this.y * vec2.y;
};

Victor.prototype.cross = function (vec2) {
	return (this.x * vec2.y ) - (this.y * vec2.x );
};

/**
 * Projects a vector onto another vector, setting itself to the result.
 *
 * ### Examples:
 *     var vec = new Victor(100, 0);
 *     var vec2 = new Victor(100, 100);
 *
 *     vec.projectOnto(vec2);
 *     vec.toString();
 *     // => x:50, y:50
 *
 * @param {Victor} vector The other vector you want to project this vector onto
 * @return {Victor} `this` for chaining capabilities
 * @api public
 */
Victor.prototype.projectOnto = function (vec2) {
    var coeff = ( (this.x * vec2.x)+(this.y * vec2.y) ) / ((vec2.x*vec2.x)+(vec2.y*vec2.y));
    this.x = coeff * vec2.x;
    this.y = coeff * vec2.y;
    return this;
};


Victor.prototype.horizontalAngle = function () {
	return Math.atan2(this.y, this.x);
};

Victor.prototype.horizontalAngleDeg = function () {
	return radian2degrees(this.horizontalAngle());
};

Victor.prototype.verticalAngle = function () {
	return Math.atan2(this.x, this.y);
};

Victor.prototype.verticalAngleDeg = function () {
	return radian2degrees(this.verticalAngle());
};

Victor.prototype.angle = Victor.prototype.horizontalAngle;
Victor.prototype.angleDeg = Victor.prototype.horizontalAngleDeg;
Victor.prototype.direction = Victor.prototype.horizontalAngle;

Victor.prototype.rotate = function (angle) {
	var nx = (this.x * Math.cos(angle)) - (this.y * Math.sin(angle));
	var ny = (this.x * Math.sin(angle)) + (this.y * Math.cos(angle));

	this.x = nx;
	this.y = ny;

	return this;
};

Victor.prototype.rotateDeg = function (angle) {
	angle = degrees2radian(angle);
	return this.rotate(angle);
};

Victor.prototype.rotateBy = function (rotation) {
	var angle = this.angle() + rotation;

	return this.rotate(angle);
};

Victor.prototype.rotateByDeg = function (rotation) {
	rotation = degrees2radian(rotation);
	return this.rotateBy(rotation);
};

/**
 * Calculates the distance of the X axis between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceX(vec2);
 *     // => -100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceX = function (vec) {
	return this.x - vec.x;
};

/**
 * Same as `distanceX()` but always returns an absolute number
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.absDistanceX(vec2);
 *     // => 100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Absolute distance
 * @api public
 */
Victor.prototype.absDistanceX = function (vec) {
	return Math.abs(this.distanceX(vec));
};

/**
 * Calculates the distance of the Y axis between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceY(vec2);
 *     // => -10
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceY = function (vec) {
	return this.y - vec.y;
};

/**
 * Same as `distanceY()` but always returns an absolute number
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceY(vec2);
 *     // => 10
 *
 * @param {Victor} vector The second vector
 * @return {Number} Absolute distance
 * @api public
 */
Victor.prototype.absDistanceY = function (vec) {
	return Math.abs(this.distanceY(vec));
};

/**
 * Calculates the euclidean distance between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distance(vec2);
 *     // => 100.4987562112089
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distance = function (vec) {
	return Math.sqrt(this.distanceSq(vec));
};

/**
 * Calculates the squared euclidean distance between this vector and another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(200, 60);
 *
 *     vec1.distanceSq(vec2);
 *     // => 10100
 *
 * @param {Victor} vector The second vector
 * @return {Number} Distance
 * @api public
 */
Victor.prototype.distanceSq = function (vec) {
	var dx = this.distanceX(vec),
		dy = this.distanceY(vec);

	return dx * dx + dy * dy;
};

/**
 * Calculates the length or magnitude of the vector
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.length();
 *     // => 111.80339887498948
 *
 * @return {Number} Length / Magnitude
 * @api public
 */
Victor.prototype.length = function () {
	return Math.sqrt(this.lengthSq());
};

/**
 * Squared length / magnitude
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *
 *     vec.lengthSq();
 *     // => 12500
 *
 * @return {Number} Length / Magnitude
 * @api public
 */
Victor.prototype.lengthSq = function () {
	return this.x * this.x + this.y * this.y;
};

Victor.prototype.magnitude = Victor.prototype.length;

/**
 * Returns a true if vector is (0, 0)
 *
 * ### Examples:
 *     var vec = new Victor(100, 50);
 *     vec.zero();
 *
 *     // => true
 *
 * @return {Boolean}
 * @api public
 */
Victor.prototype.isZero = function() {
	return this.x === 0 && this.y === 0;
};

/**
 * Returns a true if this vector is the same as another
 *
 * ### Examples:
 *     var vec1 = new Victor(100, 50);
 *     var vec2 = new Victor(100, 50);
 *     vec1.isEqualTo(vec2);
 *
 *     // => true
 *
 * @return {Boolean}
 * @api public
 */
Victor.prototype.isEqualTo = function(vec2) {
	return this.x === vec2.x && this.y === vec2.y;
};

/**
 * # Utility Methods
 */

/**
 * Returns an string representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toString();
 *     // => x:10, y:20
 *
 * @return {String}
 * @api public
 */
Victor.prototype.toString = function () {
	return 'x:' + this.x + ', y:' + this.y;
};

/**
 * Returns an array representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toArray();
 *     // => [10, 20]
 *
 * @return {Array}
 * @api public
 */
Victor.prototype.toArray = function () {
	return [ this.x, this.y ];
};

/**
 * Returns an object representation of the vector
 *
 * ### Examples:
 *     var vec = new Victor(10, 20);
 *
 *     vec.toObject();
 *     // => { x: 10, y: 20 }
 *
 * @return {Object}
 * @api public
 */
Victor.prototype.toObject = function () {
	return { x: this.x, y: this.y };
};


var degrees = 180 / Math.PI;

function random (min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function radian2degrees (rad) {
	return rad * degrees;
}

function degrees2radian (deg) {
	return deg / degrees;
}

},{}]},{},[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16]);
