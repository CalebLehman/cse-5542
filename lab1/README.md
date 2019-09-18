# CSE 5542 - Lab 1 - Caleb Lehman (.346)

This is a lab implementing a simple drawing program using WebGL.

## Files

  - lab01.html: Main HTML page
  - setup_shaders.js: Shader setup, written by Prof. Shen
  - lab01.js: Javascript for all other functionality

## Basic Usage

Commands match those given in lab assignment. In particular, the following key commands are available:

  - p: switch to drawing points
  - h: switch to drawing horizontal line segments
  - v: switch to drawing vertical line segments
  - t: switch to drawing triangles
  - q: switch to drawing squares
  - o: switch to drawing circles
  - r: switch to drawing in red
  - g: switch to drawing in green
  - b: switch to drawing in blue
  - d: redisplay screen
  - c: clear/reset current screen

Once a color and shape are selected, left-click draws shapes.

## Additional features (bonus)

The bonus features implemented are as follows:

  - The o key can be used to draw circles
  - The "Scale Canvas" slider can be used to resize the drawing canvas
  - The "Scale Shapes" slider can be used to scale drawing shapes (not
  bonus assigned by Prof. Shen, just for fun)

## Testing

This lab was tested on Windows 10 in a Chrome browser. There is a known bug
that all points are drawn behind all lines are drawn behind all triangles, regardless
of the order they are drawn in, but Prof. Shen said that this was acceptable for this lab.
