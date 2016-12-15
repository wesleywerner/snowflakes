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
    getFPS: function(){		
      this.frameNumber++;		
      var d = new Date().getTime();
      var currentTime = ( d - this.startTime ) / 1000;
      this.current = Math.floor( ( this.frameNumber / currentTime ) );
      if( currentTime > 1 ){
        this.startTime = new Date().getTime();
        this.frameNumber = 0;
      }
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
      // place the tree at the bottom-center
      var tree = data.images.tree;
      tree.pos = {
        x: data.W / 2 - tree.width / 2,
        y: data.H - tree.height
      }
      // place the star above the tree
      var star = data.images.star;
      star.pos = {
        x: tree.pos.x + tree.width / 2,
        y: tree.pos.y
      }
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
    
    // draw our star
    data.context.drawImage(
      data.images.star,
      data.images.star.pos.x,
      data.images.star.pos.y);
    
    // calculate rendering speed
    data.fps.getFPS();
    
    // print debug information
    data.context.font = '20px arial';
    data.context.fillStyle = '#fff';
    data.context.fillText('fps:' + data.fps.current, 50, 20);
  }

  // start resource loading and canvas setup
  loadResources();
  setupCanvas();
  draw();
  
  // return our data store to the main window scope
  return data;
  
})();
