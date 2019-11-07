# CSE 5542 - Lab 4 - Caleb Lehman (.346)

Submission for Lab 4 of Prof. Shen's CSE 5542 course.
Contact [Caleb Lehman](mailto:lehman.346@osu.edu) with issues.

Scene for "toy" plane and more complex plane model.
Model is loaded from a `.obj` file.
3D lighting techniques (Phong shading) are used to light the scene.

Several aspects of the scene can be controlled with key commands,
namely, camera rotation, "toy" plane position, and light position.

## Testing

This lab was tested on Windows 10 with the Chrome browser.
To avoid issues with CORS, I developed/tested using a local
HTTP server. There are other ways to work around it, but if
you have a python installation, I recommend:

```
$ cd <project-dir>
$ python -m http.server 8080        # for python 3
$ python -m SimpleHTTPServer 8080   # for python 2
<access localhost:8080 from browser>
```

## Files

  - `README.md`: Description of project submission
  - `lab04.html`: Main HTML page
  - `lab04.mjs`: Main javascript module
  - `node.mjs`: Javascript module for node class used to model hierarchy
  - `plane_buffers.mjs`: Javascript module with methods to construct buffers
    for plane object and other objects in the scene
  - `plane_hierarchy.mjs`: Javascript module with methods to construct plane
    hierarchy and other scene hierarchy
  - `setup_shaders.js`: Shader setup, written by Prof. Shen
  - `shape.mjs`: Javascript module for shape class used to encapsulate shape types
  - `gl-matrix-min.js`: Javascript which defines the glMatrix library
  - `src`: Directory with Javascript files implementing glMatrix
  - `model_plane.obj`: Wavefront `.obj` file for more complex plane model
  - `load_obj.mjs`: Code for loading model from (a simplified version of the ) `.obj` format

## Usage

From the main HTML page, you can control various aspects
of the plane scene:

### (Toy) plane movement

All the following translations are relative to
the plane's frame of reference.

  - `w/s`: Move the plane foward and backward
  - `a/d`: Move the plane left and right
  - `q/e`: Move the plane down and up 

### Light movement

  - `W/S`: Move the light along the world `+z/-z` axis
  - `A/D`: Move the light along the world `+x/-x` axis
  - `Q/E`: Move the light along the world `+y/-y` axis

### Camera adjustment

All the following rotations are relative to
the camera's frame of reference
(see [here](https://en.wikipedia.org/wiki/Aircraft_principal_axes)).

  - `R/r`: Alter the roll of the camera
  - `P/p`: Alter the pitch of the camera
  - `Y/y`: Alter the yaw of the camera

### Other control commands

  - `c`: Reset scene
  - `H/h`: Rotate the propeller
  - `J/j`: Rotate the back fin
  - `K/k`: Rotate the legs
  - `L/l`: Rotate the wheels

## Bonus features

The lab assignment had no specific bonus assigned.
