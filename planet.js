  "use strict";

  var canvas;
  var universeRadius;
  var CANVAS_WIDTH = 100;
  var CANVAS_HEIGHT = 100;
  var GRAVITATIONAL_CONSTANT = 6.67e-11;
  var TIME_DELTA = 25000;
  var END_TIME = 157788000;
  var PLANET_FILE = "resources/planets.txt";

  class Point {
    constructor(x, y){
      this.x = x;
      this.y = y;
    }

    distance (otherPoint){
      return Math.sqrt(
        (this.x - otherPoint.x)*
        (this.x - otherPoint.x) + 
        (this.y - otherPoint.y) *
        (this.y - otherPoint.y));
    }

    minus (otherPoint){
      return new Point (this.x - otherPoint.x, this.y - otherPoint.y);
    }
  }

  class Planet{
    constructor(imageSrc, location, velocity, mass){
      //this.image = new Image();
      //this.image.src = imageSrc;
      this.point = location;
      this.velocity = velocity;
      this.mass = mass;
      this.planetName = imageSrc;
    }

    draw(){
      canvas.beginPath();
      var drawablePoint = createDrawablePoint(this.point.x, this.point.y)
      canvas.arc(drawablePoint.x, drawablePoint.y, 2, 0, 2 * Math.PI, false);
      canvas.fillStyle = 'red';
      canvas.fill();
      canvas.lineWidth = 2;
      canvas.strokeStyle = '#FF0000';
      canvas.stroke();
      //canvas.drawImage(this.image, this.point.x, this.point.y);
    }

    updatePosition(F){
      var a_x = F.x/this.mass;
      var a_y = F.y/this.mass;
      this.velocity.x +=TIME_DELTA * a_x;
      this.velocity.y +=TIME_DELTA * a_y;
      this.point.x +=TIME_DELTA * this.velocity.x
      this.point.y +=TIME_DELTA * this.velocity.y
    }
  }

  function readPlanetFile(file){
    var planets = []
    var lines = file.split('\n');
    var numPlanets = parseInt(lines[0]);
    universeRadius = parseFloat(lines[1]);
    initializeCanvas(universeRadius);
    for(var line = 2; line-2 < numPlanets; line++){
      if (/\S/.test(lines[line])){
        var planetInfo = lines[line].trim().split(/\s+/);
        var location = new Point(parseFloat(planetInfo[0]), parseFloat(planetInfo[1]));
        var velocity = new Point(parseFloat(planetInfo[2]), parseFloat(planetInfo[3]));
        var mass = parseFloat(planetInfo[4]);
        var imageSrc = "resources/" + planetInfo[5];
        var planet = new Planet(imageSrc, location, velocity, mass);
        planets.push(planet)
      }
    }
    return planets;
  }

  function createDrawablePoint(x, y){
    var adjustedX = x+universeRadius;
    var adjustedY = y+universeRadius;
    var point = new Point(adjustedX * CANVAS_WIDTH/2 /universeRadius,
                      adjustedY * CANVAS_HEIGHT/2/universeRadius);
    console.log(point.x);
    console.log(point.y);
    return point;
  }

  function initializeCanvas(universeRadius){
    var canvasElement = $("<canvas width='" + CANVAS_WIDTH + 
                          "' height='" + CANVAS_HEIGHT + "'></canvas>");
    canvas = canvasElement.get(0).getContext("2d");
    $('body').append(canvasElement);
  }

  function drawAllPlanets(planets) {
    canvas.fillStyle = "#000000";
    canvas.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    for (var i = 0; i< planets.length; i++){
      planets[i].draw();
    }
  }

  function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
  }

  var planet1 = new Planet("earth", new Point(0,0), new Point(1,1), 100);
  var planet2 = new Planet("sun", new Point(50,50), new Point(2,1), 5000)
  var myPlanets = [planet1, planet2]
  var force1 = calculateNetForce(planet1, myPlanets)
  //assert(force1.x == 0 && force1.y == 0, "Force incorrect: (" + force1.x + ", " + force1.y + ")")
  var force2 = calculateNetForce(planet1, myPlanets)
  //assert(force2.x == 0 && force2.y == 0, "Force incorrect: (" + force2.x + ", " + force2.y + ")")

  function calculateNetForce(planet, planets){
    var F_x = 0;
    var F_y = 0;
    for (var i = 0; i< planets.length; i++){
      var other = planets[i];
      if (other==planet) continue;
      var distance = planet.point.distance(other.point);
      var F = GRAVITATIONAL_CONSTANT * planet.mass * other.mass/(distance*distance);
      var difference = other.point.minus(planet.point);
      F_x += F * difference.x / distance;
      F_y += F * difference.y /distance;
    }
    return new Point(F_x, F_y);
  }

  function startSimulation(planets){
    var startTime, currTime = 1;
    
    var simIteration = function(){
      drawAllPlanets(planets);
      for (var i =0; i< planets.length; i++){
        var planet = planets[i];
        var netForce = calculateNetForce(planet, planets);
        planet.updatePosition(netForce);
      }
      currTime+=1;
      if (currTime < END_TIME){
        setTimeout(simIteration, 1);
      }
      else{
        //print end state
      }
    }
    simIteration();
  }


  var xhttp = new XMLHttpRequest();
  xhttp.onreadystatechange = function() {
    var response = xhttp.responseText;
    if (xhttp.readyState == 3) {
      var planets = readPlanetFile(xhttp.responseText);
      startSimulation(planets);
    }
  };
  xhttp.open("GET", PLANET_FILE, true);
  xhttp.send();







