
// Various Object Arrays
var GameObjects = new Array();
var DeadObjects = new Array();
var PlayerObjects = new Array();
var commandCollection;

// Used to control and maintain the game loop
var GameOver = true;
var CountdownTimer = 0;
var FrameCounter = 0;
var FramesPerSecond = 0;
var GameSpeed = .66;

// Used to help with the command timing. I'm not 100% sure how they work.
var commandDelay = 1;
var tick = 0;

// Should really be its own object
var ExplosionSize = 20;

// These are used to create unique IDs to track the DOM elements. Once I implement
// backbone MVC I should not need these anymore
var playerObjectId = 0;
var gameObjectId = 0;

// Used to maintain the GUI
var ZoomLevel = 400;
var StartingDistanceFromCenter = 100;
var availableWidth = window.innerWidth - 22;
var availableHeight = window.innerHeight - 22;

if (availableHeight < availableWidth)
{
	AvailablePixels = availableHeight;
}
else
{
	AvailablePixels = availableWidth;
}

var CurrentScale = AvailablePixels / ZoomLevel;

// Global GUI objects
var backgroundGroup;
var scopeGroup;
var portGroup;
var translateGroup;
var rotateGroup;
var mapGroup;

function Init()
{

  var background = document.getElementById("background");
  background.setAttributeNS(null, "height", availableHeight);	
  background.setAttributeNS(null, "width", availableWidth);
  
  backgroundGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
  backgroundGroup.setAttribute('id', 'backgroundGroup');
  background.appendChild(backgroundGroup);
  
  scopeGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
  scopeGroup.setAttribute('id', 'scopeGroup');
  scopeGroup.setAttribute('transform', 'translate('+availableWidth / 2+','+availableHeight / 2+')');
  background.appendChild(scopeGroup);
  
  var scope = document.createElementNS("http://www.w3.org/2000/svg","circle");
  scope.setAttributeNS(null, "cx", 0);	
  scope.setAttributeNS(null, "cy", 0);		
  scope.setAttributeNS(null, "r", ((AvailablePixels - 22) / 2));
  scope.setAttributeNS(null, "stroke", "gray");
  scope.setAttributeNS(null, "stroke-width", "2px");
  scope.setAttributeNS(null, "stroke-opacity", 0.5);
  scope.setAttributeNS(null, "fill", "black");
  scope.setAttributeNS(null, "fill-opacity", 0.0);
  scopeGroup.appendChild(scope);
  
  portGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
  portGroup.setAttribute('id', 'portGroup');
  portGroup.setAttribute('transform', 'translate('+availableWidth / 2+','+availableHeight / 2+') scale(' + CurrentScale + ')');
  background.appendChild(portGroup);
  
  rotateGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
  rotateGroup.setAttribute('id', 'rotateGroup');
  portGroup.appendChild(rotateGroup);
  
  translateGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
  translateGroup.setAttribute('id', 'translateGroup');
  rotateGroup.appendChild(translateGroup);
  
  mapGroup = document.createElementNS("http://www.w3.org/2000/svg","g");
  mapGroup.setAttribute('id', 'mapGroup');
  translateGroup.appendChild(mapGroup);
				
  for (var x = 0; x < window.innerWidth - 22; x++)
  {
	for (var y = 0; y < window.innerHeight - 22; y++)
	{
	  if (Math.floor((Math.random()*1000)+1) == 1)
	    {
		  var newStar = new StarModel({ xLocation: x, yLocation: y, alpha: Math.random(), brightning: Math.round(Math.random()), twinkleRate: Math.random()*0.1});
		  new StarView({model: newStar});
		}
	}
  }
  
  NewGame();
}

function NewGame()
{
  ClearGameObjects()
  PlayerObjects.length = 0;
  commandCollection = new CommandCollection();
    
  GameOver = false;
  CountdownTimer = 100;
  playerObjectId = 0;
  gameObjectId = 0;
  
  GameObjects.length = 0;
  
  CreateShipObject('Human', 0);

  FrameCounter = 0;

  FrameCounterInterval = setInterval("UpdateFramesPerSecond()", 1000);
  EnemyShipCreationInterval = setInterval("EnemyShipCreationLoop()", 1000);
  GameInterval = setInterval("GameLoop()", 40);
}

function ClearGameObjects()
{
  for (var i=0, j=GameObjects.length; i<j; i++)
  {
    DeadObjects.push(GameObjects[i]);
  }
  
  RemoveDeadObjects();
}

function UpdateFramesPerSecond()
{
  FramesPerSecond = FrameCounter;
  FrameCounter = 0;
}

function EnemyShipCreationLoop()
{
    CreateShipObject('Computer');
}
    
function GameLoop()
{
  FrameCounter++;
  
  if(CountdownTimer < 1)
  {
    window.clearInterval(FrameCounterInterval);
    window.clearInterval(GameInterval);
    window.clearInterval(EnemyShipCreationInterval);
    NewGame();
  }
  else
  {
    if (GameOver == true)
    {
      CountdownTimer = CountdownTimer - 1;
    }
    
    issueAiCommands();
    UpdateGameObjects();
    CollisionDetection();
    // BoundryChecking();
    UpdateGameElements();
    
    tick++;
  }
}

function issueAiCommands()
{
  if (FrameCounter == 10)
  {
    for (var x=1; x<PlayerObjects.length; x++)
    {
      Think(PlayerObjects[x]);
    }
  }
}

function Think(PlayerObject)
{
  switch (Math.floor(Math.random()*11+1))
  {
    case 1:
      var thrusterCommand = new CommandModel({playerId: PlayerObject.id, command: 2, targetId: PlayerObject.shipId, tick: tick+commandDelay});
      commandCollection.add(thrusterCommand);
      break;
    case 3:
    case 4:
    case 11:
      var fireCommand = new CommandModel({playerId: PlayerObject.id, command: 0, targetId: PlayerObject.shipId, tick: tick+commandDelay});
      commandCollection.add(fireCommand);
      break;
    case 6:
    case 7:
      var rotateCounterClockwiseCommand = new CommandModel({playerId: PlayerObject.id, command: 1, targetId: PlayerObject.shipId, tick: tick+commandDelay});
      commandCollection.add(rotateCounterClockwiseCommand);
      break;
    case 8:
    case 9:
      var rotateClockwiseCommand = new CommandModel({playerId: PlayerObject.id, command: 3, targetId: PlayerObject.shipId, tick: tick+commandDelay});
      commandCollection.add(rotateClockwiseCommand);
      break;
    case 2:
    case 5:
    case 10:
      var brakesCommand = new CommandModel({playerId: PlayerObject.id, command: 4, targetId: PlayerObject.shipId, tick: tick+commandDelay});
      commandCollection.add(brakesCommand);
      break;
  }
}

function UpdateGameObjects()
{
  for (var i=0; i<GameObjects.length; i++)
  {
    switch (GameObjects[i].Type)
    {
      case 'HumanShip':
      case 'ComputerShip':
        UpdateShipObject(GameObjects[i])
        break;
      case 'Missile':
        GameObjects[i].update();
        break;
      case 'Particle':
        GameObjects[i].update();
        break;
    }
  }
}

function CreateExplosion(SourceGameObject)
{
	for (var i = 0; i < ExplosionSize; i++)
	{
		GameObjects.push(new Particle(SourceGameObject)); 
	}
}

function UpdateGameElements()
{
  for (var i=0, j=GameObjects.length; i<j; i++)
  {
    switch (GameObjects[i].Type)
    {
      case 'ComputerShip':
      case 'HumanShip':
        UpdateShipElement(GameObjects[i])
        break;
      case 'Missile':
        GameObjects[i].updateView();
        break;
      case 'Particle':
        GameObjects[i].updateView();
        break;
    }
  }
}

function BoundryChecking()
{
  var MapRadius = AvailablePixels / 2 / CurrentScale;
  for (var i = 0; i < GameObjects.length; i++)
  {
    // Check to see if GameObject has flown past the border. I do this by measuring the distance
    // from the Game Object to the center of the screen and making sure the distance is smaller
    // than the radius of the screen.
    if (!(GameObjects[i].LocationX * GameObjects[i].LocationX + GameObjects[i].LocationY * GameObjects[i].LocationY < MapRadius * MapRadius))
    {
      DeadObjects.push(GameObjects[i]);
    }
  }
  RemoveDeadObjects()
}
     
function CollisionDetection()
{
  // Run Colision Detection for each GameObject
  for (var i = 0; i < GameObjects.length; i++)
  {
    // Ignore Particle objects when looking for collisions
    if (GameObjects[i].Type != 'Particle')
    {
      // Find this distance between this and every other object in the game and check to see if it
      // is smaller than the combined radius of the two objects.
      for (var j = 0; j < GameObjects.length; j++)
      {
        // Don't let objects colide with themselves or Particles!
        if (GameObjects[i] != GameObjects[j] && GameObjects[j].Type != 'Particle')
        {
          if (Math.sqrt((GameObjects[i].LocationX - GameObjects[j].LocationX) * (GameObjects[i].LocationX - GameObjects[j].LocationX) + (GameObjects[i].LocationY - GameObjects[j].LocationY) * (GameObjects[i].LocationY - GameObjects[j].LocationY)) < (GameObjects[i].Size + GameObjects[j].Size))
          {
            // This object has collided with something so we get to blow it up!!!
            CreateExplosion(GameObjects[j]);

            // I created this array of objects to remove because removing objects from
            // an array while you are still iterating over the same array is generaly
            // a bad thing!
            DeadObjects.push(GameObjects[j]);
            
            // No use blowing this up twice!
            break;
          }
        }
      }
    }
  }
  
  for (var k = 0; k < GameObjects.length; k++)
  {
    if ((GameObjects[k].Type == "Missile") && (GameObjects[k].Fuel < 1))
    {
      DeadObjects.push(GameObjects[k]);
    }
  }
  
  RemoveDeadObjects();
}

function RemoveDeadObjects()
{
  for (var i=0, j=DeadObjects.length; i<j; i++)
  {
    RemoveGameObject(DeadObjects[i]);
  }
  
  DeadObjects.length = 0;
}
    
function RemoveGameObject(GameObject)
{
  SvgElementToDelete = GameObject.svgElement;
  SvgElementToDelete.parentNode.removeChild(SvgElementToDelete);
  
  var i = 0;

  switch (GameObject.Type)
  {
    case 'HumanShip':
      GameOver = true;
      break;
    case 'ComputerShip':
      break;
  }
  
  for (var j = 0; j < GameObjects.length; j++)
  {
    if (GameObjects[j] == GameObject)
    {
      GameObjects.splice(i, 1);
    }
    else
    {
      i++;
    }
  }
}

function removePlayerObject(GameObject)
{
  for (var x=0; x < PlayerObjects.length; x++)
  {
    if (PlayerObject[x].shipId == GameObject.id)
    {
      PlayerObjects.splice(x,1);
    }
  }
}

