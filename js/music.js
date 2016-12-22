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
 * Play some festive music.
 */
function playMusic() {
  
  function onSongLoaded(player) {
      player.play();
  }
  
  xmas.modPlayer = new ScripTracker();
  xmas.modPlayer.on(ScripTracker.Events.playerReady, onSongLoaded);
  xmas.modPlayer.loadModule("https://api.modarchive.org/downloads.php?moduleid=118434#christmas_dance_mix.mod");

xmas.modPlayer.on(ScripTracker.Events.instrument, 3, onInstrument);
function onInstrument(player, instrument, channel, note, effect, effectParam) {
    console.log("Instrument " + instrument + " playing note " + note + " on channel " + channel + ".");
}
}

function toggleMusic() {
  if (xmas.modPlayer.isPlaying)
    xmas.modPlayer.stop();
  else
    xmas.modPlayer.play();
}

playMusic();
