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

function getPackOfBirds(limitWidth, limitHeight){
  var screenFactor = (window.innerWidth / window.innerHeight);
  var lower = window.innerWidth < window.innerHeight ? window.innerWidth : window.innerHeight;
  var amount = Math.round((lower * screenFactor )/10);
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