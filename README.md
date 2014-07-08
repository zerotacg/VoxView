# VoxView

VoxView is a web-based tool for visualizing and manipulating
Landmark-style voxel geometry. It is built upon several libraries:

* [three.js](http://threejs.org/) for 3D WebGL/Canvas drawing
* [dat.GUI](https://code.google.com/p/dat-gui/) for UI widgets
* Detector.js and Orbit Controls.js from [Three.js Examples](https://github.com/stemkoski/stemkoski.github.com) (WebGL detection and 3D manipulation controls)

Bower and requirejs is used for dependency management and can be
installed via `npm install` if not already installed globally. After
getting the necessary tools you can get the dependencies via bower
`./node_modules/.bin/bower install` and to create a build
`./node_modules/.bin/r.js -o build.js` to only get a concatenated build
`./node_modules/.bin/r.js -o build.js optimize=none`.

## Current Status

VoxView currently displays a single 1x1x1 cube with both wireframe and
solid translucent shading. The cube is embedded in a representation of
the voxel grid: Each corner of the cube mesh is at the center of a
voxel cell and the center vertex of the grid is at the center of the
mesh.

The user interface allows panning, zooming, and rotating to view the
mesh from various perspectives and also allows each corner of the mesh
cube to be moved anywhere within its voxel cell. This is intended to
reproduce the variety of mesh configurations that can be reproduced in
SOE's Landmark voxel-based game engine.

## Future Plans

* Add geometry to emphasize important points in the data structure
  (material values on vertices, mesh corners, etc.)

* Client-based storage of interesting configurations

* Permalinks to interesting configurations

* Merging of manipulated voxel grids into larger grids with proper
  corner precedence.
  
## Licensing

This software (unless otherwise noted) is distrbuted under the terms
of the MIT License. See the LICENSE file for details.
