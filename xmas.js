/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see http://www.gnu.org/licenses/.
 */


/*
 * wrapped in a closure so we don't create global variable pollution.
 */
var xmas = ( function() {
  
  /*
   * Our data object houses preloaded images, snowflake data and
   * anything else we want to persist.
   */
  var data = {
    
    // flag indicating when images are loaded
    loaded: false,
    
    // store the canvas and context
    canvas: null,
    context: null,
    
    // image store
    images: {},
    
    // store the canvas size
    W: 0,
    H: 0,
    
    // Track the maximum number of snowflakes to display,
    // this can increase/decrease as the fps allow.
    // Track the angle counter, used to move snowflakes with the sin
    // function to give the appearance of blowing in the wind.
    maxFlakes: 20,
    snowflakes: [],
    flakeAngle: 0,
    
    // print debug info on screen
    debug: false
    
  }
  
  
  /*
   * A basic preloader that looks for predefined images, and loads
   * them as images become available.
   * Once all are loaded, set the 'loaded' property true.
   */
  function loadResources() {
    data.images.tree = document.querySelector('img[data-name="tree"]');
    data.images.star = document.querySelector('img[data-name="star"]');
    data.loaded = (data.images.tree != null && data.images.star != null);
    // retry if not yet loaded
    if (!data.loaded) setTimeout(loadResources, 500);
  }
  
  
  /*
   * Set up the canvas context.
   */
  function setupCanvas() {
    data.canvas = document.querySelector('canvas');
    if (data.canvas == null) throw ('No canvas element found on the page.');
    data.context = data.canvas.getContext('2d');
  }

  
  /*
   * A simple frames per second calculator.
   */
  data.fps = {
    current: 0,
    startTime: 0,	
    frameNumber: 0,	
    delta: 0,
    lastTime: 0,
    getFPS: function() {
      // track the frames drawn per second
      this.frameNumber++;		
      var now = new Date().getTime();
      var currentTime = ( now - this.startTime ) / 1000;
      this.current = Math.floor( ( this.frameNumber / currentTime ) );
      if( currentTime > 1 ){
        this.startTime = new Date().getTime();
        this.frameNumber = 0;
      }
      // track the difference in milliseconds since the last update
      this.delta = (now - this.lastTime) / 1000;
      this.lastTime = now;
    }
  };
  
  
  /*
   * Check for window size change and recalculate positions.
   */
  function resizeCheck() {
    // only when the known size differs from the actual
    if (data.W != window.innerWidth || data.H != window.innerHeight) {
      data.W = window.innerWidth;
      data.H = window.innerHeight;
      // apply the size to the canvas
      data.canvas.width = data.W;
      data.canvas.height = data.H;
    }
    // recalculate image positions
    if (data.loaded) {
      // position the tree
      var tree = data.images.tree;
      tree.pos = {
        x: data.W / 4 - tree.width / 2,
        y: data.H - tree.height
      }
      // position the star
      var star = data.images.star;
      star.pos = {
        x: tree.pos.x + tree.width / 2,
        y: tree.pos.y
      }
      star.cenX = star.width/2;
      star.cenY = star.height/2;
    }
  }
  // perform this check periodically
  setInterval(resizeCheck, 1000);

  
  /*
   * Main drawing loop.
   */
  function draw() {

    requestAnimationFrame(draw);
    
    if (!data.loaded || data.W == 0) return;
    
    // clear the screen
    data.context.clearRect(0, 0, data.W, data.H);
    
    // draw our tree
    data.context.drawImage(
      data.images.tree,
      data.images.tree.pos.x,
      data.images.tree.pos.y);
    
    // draw our rotating star
    var star = data.images.star;
    star.angle = (star.angle || 0) + 0.01;
    data.context.save();
    data.context.translate(data.images.star.pos.x, data.images.star.pos.y);
    data.context.rotate(data.images.star.angle);
    data.context.drawImage(data.images.star, -star.cenX, -star.cenY);
    data.context.restore();
    
    // draw our snow
    renderSnowflakes(data.fps.delta);
    
    // calculate rendering speed
    data.fps.getFPS();
    
    // print debug information
    if (data.debug == true) {
      data.context.font = '20px arial';
      data.context.fillStyle = '#fff';
      data.context.fillText('fps:' + data.fps.current, 50, 20);
      data.context.fillText('flakes:' + data.maxFlakes, 50, 40);
      data.context.fillText('delta:' + data.fps.delta, 50, 60);
    }
  }
  

  /*
   * Update and draw snowflakes.
   */
  function renderSnowflakes(dt) {

    data.context.fillStyle = "rgba(255, 255, 255, 0.4)";
    data.context.beginPath();
    
    // the angle, pushed through sin and cos functions, oscillates
    // the flake movement.
    data.flakeAngle += 0.01;
    
    for (var i=0; i<data.snowflakes.length; i++) {
    
      var p = data.snowflakes[i];
      
      // the vertical cosine movement gives the appearance of up-drafts
      var y = Math.cos(data.flakeAngle);
      
      // clamp to positive values so our flakes don't go up
      y = Math.max (0.5, y);
      
      // larger flakes fall quicker, giving a nice parallax effect
      y += (p.r * 0.1);
      
      // the horizontal sine movement gives the appearance of a breeze
      var x = Math.sin(data.flakeAngle) * 0.5;
      
      // larger flakes get the horizontal speed bonus too
      x += (p.r * 0.1);
      
      // finally, update the flake position at a delta ratio so it looks
      // consistent across varying framerates, with a speed factor.
      p.x += x * dt * 50;
      p.y += y * dt * 50;
      
      // add the flake arc to the drawing path
      data.context.moveTo(p.x, p.y);
      data.context.arc(p.x, p.y, p.r, 0, Math.PI*2, true);
      
      // warp flakes lost to the bottom of the window, back to the top
      if(p.y > data.H) {
        data.snowflakes[i] = makeFlake();
      }

    }
    
    data.context.fill();
    
  }
  
  
  /*
   * Create a unique snowflake.
   */
  function makeFlake () {
    
    // position it randomly on the x axis
    var x = Math.random() * data.W;
    
    // position flakes with a random padding outside the screen
    // so it appears to float in from the sides
    var padding = 100;
    
    var rnd = Math.floor( Math.random() * padding );
    x -= rnd;
    
    // the flake starts at the top.
    var y = 0;
    
    return {
      x: x,
      y: y,
      r: Math.random() * 4 + 1,           // draw radius
      d: Math.random() * data.maxFlakes   // density (adjusts behaviour)
    }
  }

  
  /*
   * Increase and decrease the number of snowflakes as allowed by fps.
   */
  function adjustFlakes() {
    // reduce snowflakes while fps is low
    if (data.fps.current < 10) {
      // clamp to a minimum number
      data.maxFlakes = Math.max(10, data.maxFlakes - 10);
    }
    else if (data.fps.current > 30) {
      // clamp to a maximum number
      data.maxFlakes = Math.min(500, data.maxFlakes + 10);
    }
    // cull any extra flakes
    if (data.snowflakes.length > data.maxFlakes) {
      data.snowflakes.splice(data.maxFlakes, data.snowflakes.length - data.maxFlakes);
    }
    // add any missing flakes
    while (data.snowflakes.length < data.maxFlakes) {
      data.snowflakes.push(makeFlake());
    }
  }
  setInterval(adjustFlakes, 1000);
  
  
  /*
   * Read the user message from the url querystring.
   */
  function readUserMessage() {
    var hash = window.location.hash;
    if (hash == '') {
      console.log('user messsage query is empty');
      return;
    }
    // get the user message element
    var el = document.getElementById('usermessage');
    el.innerText = atob(hash.slice(1));
    console.log('decoded user message as: ' + data.usermessage);
  }


  // start resource loading and canvas setup
  readUserMessage();
  loadResources();
  setupCanvas();
  draw();
  
  // return our data store to the main window scope
  return data;
  
})();
