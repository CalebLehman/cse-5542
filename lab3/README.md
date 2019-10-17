# CSE 5542 - Lab 3 - Caleb Lehman (.346)

Submission for Lab 3 of Prof. Shen's CSE 5542 course.

Scene for a toy plane, built using 3D WebGL and
hierarchical modeling techniques.

From the main HTML page, you can control various aspects
of the scene MANUALLY. You can also follow the link
to see a (very) simple ANIMATED version of the scene.

## Hierarchy diagram for plane scene

Empty nodes (place-holder nodes with no associated
shape) are marked with (E) after the name.

NOTE that there are the required 3 levels of hierarchy.

+-Floor

+-Root (E)
  |
  +-Front Body
  |
  +-Back Body
  |
  +-Cockpit
  |
  +-Wings
  |
  +-Fin Root (E)
  | |
  | +-Back Fin
  |
  +-Rotor (E)
  | |
  | +-Propeller Cap
  | |
  | +-Propeller
  |
  +-Leg Root (E)
    |
    +-Legs
    |
    +-Axel Root (E)
      |
      +-Axel
      |
      +-Wheels

## Files

  - `README.md`: Description of project submission
  - `lab03.html`: Main HTML page
  - `lab03_anim.html`: HTML page containing (very) simple animation
  - `lab03.mjs`: Main javascript module
  - `node.mjs`: Javascript module for node class used to model hierarchy
  - `plane_buffers.mjs`: Javascript module with methods to construct buffers
    for plane object
  - `plane_hierarchy.mjs`: Javascript module with methods to construct plane
    hierarchy
  - `setup_shaders.js`: Shader setup, written by Prof. Shen
  - `shape.mjs`: Javascript module for shape class used to encapsulate shape types
  - `gl-matrix-min.js`: Javascript which defines the glMatrix library
  - `src`: Directory with Javascript files implementing glMatrix

## Usage

From the main HTML page, you can control various aspects
of the plane scene:

### Plane movement

All the following translations are relative to
the plane's frame of reference.

  - `w/s`: Move the plane foward and backward
  - `a/d`: Move the plane left and right
  - `q/e`: Move the plane down and up 

### Camera adjustment

All the following rotations are relative to
the camera's frame of reference
(see [here](https://en.wikipedia.org/wiki/Aircraft_principal_axes)).

  - `R/r`: Alter the roll of the camera
  - `P/p`: Alter the pitch of the camera
  - `Y/y`: Alter the yaw of the camera

### Other control commands

  - `c`: Reset current screen
  - `H/h`: Rotate the propeller
  - `J/j`: Rotate the back fin
  - `K/k`: Rotate the legs
  - `L/l`: Rotate the wheels

## Bonus features

The lab assignment had no specific bonus assigned.

## Testing

This lab was tested on Windows 10 in a Chrome browser.
