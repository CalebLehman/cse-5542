# CSE 5542 - Lab 2 - Caleb Lehman (.346)

TODO

## Files

  - lab02.html: Main HTML page
  - setup_shaders.js: Shader setup, written by Prof. Shen
  - lab02.js: Javascript for all other functionality
  - gl-matrix-min.js: Javascript which defines the glMatrix library
  - src: Directory with Javascript files implementing glMatrix

## Usage

Commands/functionality match those given in lab assignment, plus some additional features.

### Basic Drawing

Click in an empty area on the canvas to place a shape or click on an existing
shape to select it. The currently selected shape is displayed in purple
regardless of underlying color for visual convenience.

### Switching Shpaes

The following key presses control the current shape type.
New objects will be drawn with the current shape type.

  - p: switch to drawing points
  - h: switch to drawing horizontal line segments
  - v: switch to drawing vertical line segments
  - t: switch to drawing triangles
  - q: switch to drawing squares
  - o: switch to drawing circles

### Switching Colors

The following key presses control the current color.
New objects will be drawn with the current color.
Additionally, if the keys are pressed WHILE an object
is selected, it will be recolored appropriately.

  - r: color with red
  - g: color with green
  - b: color with blue

### Transformations

  - S/s: scale the selected object up/down (also
    see "W/w" below to affect entire canvas with scaling)
  - Click-and-drag left-and-right: rotates the selected object (also
    see "W/w" below to affect entire canvas with rotation)

### Other Control Commands

  - d: redisplay screen
  - c: clear/reset current screen
  - W/w: Toggle "World Mode," in which rotation/scaling
    are applied as world space transformations
  - Esc: Deselect current object

## Bonus Features

The bonus features implemented are as follows:

  - The o key can be used to draw circles (from previous lab)
  - Shapes can be reselected by clicking on them, at which point
    the user can applying more color/rotations/scaling

## Testing

This lab was tested on Windows 10 in a Chrome browser.
