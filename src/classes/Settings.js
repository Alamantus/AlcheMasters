export class Settings {
  constructor () {
    // Set Default Settings
    this.sortMethod = ['name'];

    this.randomSeed = 'AlcheMasters';

    this.locationCheckDelaySeconds = 5;

    // Number of frames to skip before recalculating item positions.
    this.itemCheckDelayNumberOfFrames = 5;

    // Multiplier for converting 1000 * latlong to distance in pixels for MapSpriteControllers.
    this.pixelScale = 100;

    // Min and max pixels that a map object can draw from the center of the circle.
    this.minPixelDistance = 16;
    this.maxPixelDistance = 180;

    // The margin range within which an item's position will not update if the player's compass heading.
    // Meant to combat items floating/moving when the heading change is very small.
    this.angleMarginOfError = 0.05;

    // The margin range within which an item's position will not update if the player's coordinates change.
    // Meant to combat items floating/moving when the geoposition calculation is inconsistent.
    this.geoMarginOfError = 0.00009;

    this.lerpPercent = 0.01;
  }
}

export let settings = new Settings();
