# CSE 5542 - Lab 3 - Caleb Lehman (.346)

Submission for Lab 3 of Prof. Shen's CSE 5542 course.

Scene for a toy plane, built using 3D WebGL and
hierarchical modeling techniques.

From the main HTML page, you can control various aspects
of the scene MANUALLY. You can also follow the link
to see a (very) simple ANIMATED version of the scene.

## IMPORTANT NOTE FOR GRADER

If you open `lab03.html` with your browser and the
plane object loads into the canvas, then you can ignore
this note. If it does not load (blank white canvas),
please see [the note](#bug-note) at the bottom of this README.

## Hierarchy diagram for plane scene

Empty nodes (place-holder nodes with no associated
shape) are marked with (E) after the name.

NOTE that there are the required 3 levels of hierarchy.

```
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
```

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
  - `lab03_no_modules`: Directory with a module-less version of this
    project (see [bug note](#bug-note) at bottom of this document)

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

This lab was tested on Windows 10 with Chrome, Firefox, and Microsoft Edge browsers.
See [the note](#bug-note) at the bottom of this document if the project
doesn't appear to be working.

## Bug note

This lab was developed using a local HTTP server, with which it works on all
tested browsers. When launched as a local HTML file however, it only worked
on Microsoft Edge.

If you are having issues with the graphics loading, I believe it to
be related to CORS/same-origin policy. There are (at least) two options 
to get the project working:

  1) Instead of opening the HTML pages as local pages, launch through
     local HTTP server. In particular, from the top directory of this
     project, you can run `python -m SimpleHTTPServer 8080` or
     `python3 -m http.server 8080` and then direct your browser
     to `localhost:8080`
  2) Navigate to the `lab03_no_modules/` directory and open
     the `lab03.html` file there
