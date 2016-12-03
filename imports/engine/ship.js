Ship = function Ship(shipType, obj) {

  this.Id = gameObjectId;
  this.Type = shipType;
	this.LocationX = 0;
	this.LocationY = 0;
	this.Facing = 0;
	this.Heading = 0;
	this.Velocity = 0;
	this.Size = 5;
	this.RotationDirection = "None";
	this.RotationVelocity = 0;
	this.Fuel = 1; // Must be at least 1 or object gets removed during collision detection!

  // This line of code should read the raw object IF passed in and map the
  // properties to the properties of this object.
  //
  // The reason I am doing this is because when I get objects back from the
  // server they come as plain JSON objects and the client has no idea what
  // prototype they should be. So, I can create the proper object on the client
  // by create a new object and passing in the raw JSON object. Then, this line
  // of code should map those generic properties to this object's properties.
  //
  // Existing code that calls this constructor and doesn't pass in an obj should
  // continue to work just fine.
  for (var prop in obj) this[prop] = obj[prop];

	if (shipType != 'Human') {

	   this.setStartingPosition();
	}

	gameObjectId++;
}

Ship.prototype.update = function() {

	for(var x = 0, y = commands.length; x < y; x++) {

	    if (commands[x].targetId == this.Id) {

	    	this.processShipCommand(commands[x].command);
	    	break;
	    }
    }

    if (this.RotationVelocity > 0) {

        if (this.RotationDirection == 'CounterClockwise') {

            this.Facing = this.Facing - this.RotationVelocity * 3 * gameSpeed;
        }
        else {

            this.Facing = this.Facing + this.RotationVelocity * 3 * gameSpeed;
        }
    }

    // This code keeps the Facing Number from 0 to 359. It will break for
    // numbers smaller than -360 and larger than 719
    if (this.Facing < 0) {

        this.Facing = 360 - this.Facing * -1;
    }
    else if (this.Facing > 359) {

        this.Facing = this.Facing - 360;
    }

    if (this.Velocity < 0) {

        this.Velocity = 0;
    }

    physics.moveObjectAlongVector(this);
}

Ship.prototype.setStartingPosition = function() {

  var angle = Math.floor(Math.random() * 360);

  var distanceFromPlayer = 20 * currentScale + Math.floor(Math.random() * 100 * currentScale + 1);

  if (angle == 0) {

    this.LocationX = playerShip.LocationX;
    this.LocationY = playerShip.LocationY + distanceFromPlayer * -1;
  }
  else if (angle == 90) {

    this.LocationX = playerShip.LocationX + distanceFromPlayer;
    this.LocationY = playerShip.LocationY;
  }
  else if (angle == 180) {

    this.LocationX = playerShip.LocationX;
    this.LocationY = playerShip.LocationY + distanceFromPlayer;
  }
  else if (angle == 270) {

    this.LocationX = playerShip.LocationX + distanceFromPlayer * -1;
    this.LocationY = playerShip.LocationY;
  }
  else if (angle < 90) {

    this.LocationX = playerShip.LocationX + distanceFromPlayer * Math.sin(angle * 0.0174532925);
    this.LocationY = playerShip.LocationY + distanceFromPlayer * Math.cos(angle * 0.0174532925) * -1;
  }
  else if (angle < 180) {

    this.LocationX = playerShip.LocationX + distanceFromPlayer * Math.sin((180 - angle) * 0.0174532925);
    this.LocationY = playerShip.LocationY + distanceFromPlayer * Math.cos((180 - angle) * 0.0174532925);
  }
  else if (angle < 270) {

    this.LocationX = playerShip.LocationX + distanceFromPlayer * Math.sin((angle - 180) * 0.0174532925) * -1;
    this.LocationY = playerShip.LocationY + distanceFromPlayer * Math.cos((angle - 180) * 0.0174532925);
  }
  else { // 360
    this.LocationX = playerShip.LocationX + distanceFromPlayer * Math.sin((360 - angle) * 0.0174532925) * -1;
    this.LocationY = playerShip.LocationY + distanceFromPlayer * Math.cos((360 - angle) * 0.0174532925) * -1;
  }

  this.Facing = Math.random()*360+1;
}

Ship.prototype.processShipCommand = function(command) {

    switch (command) {

        case 0: // Fire
            gameObjects.push(new Missile(this));
            break;
        case 3: // Rotate Right
            if (this.RotationDirection == 'None') {
                this.RotationDirection = 'Clockwise';
                this.RotationVelocity = this.RotationVelocity + 1;
            }
            else if (this.RotationDirection == 'Clockwise') {
                if (this.RotationVelocity < 3) {
                    this.RotationVelocity = this.RotationVelocity + 1;
                }
            }
            else if (this.RotationDirection == 'CounterClockwise') {
                this.RotationVelocity = this.RotationVelocity - 1;
                if (this.RotationVelocity == 0) {
                    this.RotationDirection = 'None';
                }
            }
            break;
        case 1: // Rotate Left
            if (this.RotationDirection == 'None') {
                this.RotationDirection = 'CounterClockwise';
                this.RotationVelocity = this.RotationVelocity + 1;
            }
            else if (this.RotationDirection == 'CounterClockwise') {
                if (this.RotationVelocity < 3) {
                    this.RotationVelocity = this.RotationVelocity + 1;
                }
            }
            else if (this.RotationDirection == 'Clockwise') {
                this.RotationVelocity = this.RotationVelocity - 1;
                if (this.RotationVelocity == 0) {
                    this.RotationDirection = 'None';
                }
            }
            break;
        case 2: // Accelerate
                physics.findNewVelocity(this, this.Facing, 1)
                gameObjects.push(new Thruster(this));
                break;
        case 4: // Brake
            if (this.Velocity > 0) {

                this.Velocity--;
            }
            if (this.RotationVelocity > 0) {

                this.RotationVelocity--;
                if (this.RotationVelocity == 0) {

                    this.RotationDirection = 'None';
                }
            }
            break;
    }
}
