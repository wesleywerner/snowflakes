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
    loaded: false,
    canvas: null,
    context: null,
    images: {}
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


  // start resource loading and canvas setup
  loadResources();
  setupCanvas();
  
  // return our data store to the main window scope
  return data;
  
})();
