# CSE 5542 - Lab 2 - Caleb Lehman (.346)

Submission for Lab 2 of Prof. Shen's CSE 5542 course.

## Files

  - `lab02.html`: Main HTML page
  - `setup_shaders.js`: Shader setup, written by Prof. Shen
  - `lab02.js`: Javascript for all other functionality
  - `gl-matrix-min.js`: Javascript which defines the glMatrix library
  - `src`: Directory with Javascript files implementing glMatrix

## Usage

Commands/functionality match those given in lab assignment, plus some additional features.

### Basic Drawing

Click in an empty area on the canvas to place a shape or click on an existing
shape to select it. The currently selected shape is displayed in purple
regardless of underlying color for visual convenience.

### Switching Shpaes

The following key presses control the current shape type.
New objects will be drawn with the current shape type.
The current shape type is displayed to the right of the
drawing canvas.

  - `p`: switch to drawing points
  - `h`: switch to drawing horizontal line segments
  - `v`: switch to drawing vertical line segments
  - `t`: switch to drawing triangles
  - `q`: switch to drawing squares
  - `o`: switch to drawing circles

### Switching Colors

The following key presses control the current color.
New objects will be drawn with the current color.
Additionally, if the keys are pressed WHILE an object
is selected, it will be recolored appropriately. Since
the selected object is displayed in purple, the current
color is also displayed to the right of the drawing canvas,
so that the user can tell what color the object will display
upon de-selection.

  - `r`: color with red
  - `g`: color with green
  - `b`: color with blue

### Transformations

  - `S`/`s`: scale the selected object up/down (also
    see `W`/`w` below to affect entire canvas with scaling)
  - Click-and-drag left-and-right: rotates the selected object (also
    see `W`/`w` below to affect entire canvas with rotation)
  - `Ctrl` + Click-and-drag: translates the selected object (also
    see `W`/`w` below to affect entire canvas with rotation)

### Other Control Commands

  - `d`: redisplay screen
  - `c`: clear/reset current screen
  - `W`/`w`: Toggle "World Mode," in which transformations
    are applied to the world space, instead of to a single
    object. Note that while in "World Mode," rotations and
    scalings are always applied as if the origin lies at
    the center of the canvas
  - `Esc`: De-select current object

## Bonus Features

The implemented bonus features from the
[previous lab specification](http://web.cse.ohio-state.edu/~shen.94/5542/Site/Lab1.html)
are:

  - The `o` key can be used to draw circles

The implemented bonus features from the
[current lab specification](http://web.cse.ohio-state.edu/~shen.94/5542/Site/Lab2.html)
are:

  - Shapes can be reselected by clicking on them, at which point
    the user can apply more color/rotations/scaling/translations

Other features not mentioned in the lab specifications are:

  - Objects can be translated after being placed

## Testing

This lab was tested on Windows 10 in a Chrome browser.
