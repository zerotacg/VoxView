define(function(require){
  var THREE     = require( 'three' )
    ;

  //
  // VoxView module object
  //

  var VoxView = { };

  VoxView.VERSION = [0, 1, 0];
  VoxView.RESOLUTION = 1.5;

  // Set up VoxView.CORNER
  ( function() {

    var dirs = {
      top:    { val: 0, dir: 1,  name: 'top' },
      bottom: { val: 2, dir: -1, name: 'bot' },
      south:  { val: 0, dir: 1,  name: 'S'   },
      north:  { val: 1, dir: -1, name: 'N'   },
      east:   { val: 0, dir: -1, name: 'E'   },
      west:   { val: 4, dir: 1,  name: 'W'   }
    };

    var corners = {};
    var makeCorner = function(y, x, z) {
      var fullname = y.name + x.name + z.name;
      var idx = y.val + x.val + z.val;
      var corner = {
        name: fullname,
        index: idx,
        dir: new THREE.Vector3(x.dir, y.dir, z.dir)
      };
      corners[fullname] = corner;
      corners[idx]  = corner;
    }

    makeCorner(dirs.top, dirs.south, dirs.east);
    makeCorner(dirs.bottom, dirs.south, dirs.east);
    makeCorner(dirs.top, dirs.north, dirs.east);
    makeCorner(dirs.bottom, dirs.north, dirs.east);
    makeCorner(dirs.top, dirs.south, dirs.west);
    makeCorner(dirs.bottom, dirs.south, dirs.west);
    makeCorner(dirs.top, dirs.north, dirs.west);
    makeCorner(dirs.bottom, dirs.north, dirs.west);

    VoxView.CORNER = corners;
  }() );

  VoxView.convertCornerToVertex = function(corner, direction, center) {
      var halfVoxel = new THREE.Vector3(0.5, 0.5, 0.5);
      var scale = new THREE.Vector3(1.5 / VoxView.RESOLUTION, 1.5 / VoxView.RESOLUTION, -1.5 / VoxView.RESOLUTION);
      var v = corner.clone();
    var scaled = v.multiply(scale);
    var shifted = scaled.add(direction.clone().multiply(halfVoxel));
    var centered = shifted.add(center);
    return centered;
  };



  //
  // Static helpers
  //

  // queryString is the URL component after the '?'
  VoxView.readQueryString = function(queryString) {
    var initialState = queryString.split("&");
    var corners = [];
    for (var i = 0; i < 8; i++) {
      if (initialState && initialState[i]) {
        var coordinate = initialState[i].split(",");
        corners[i] = new THREE.Vector3(
          parseFloat(coordinate[0]),
          parseFloat(coordinate[1]),
          parseFloat(coordinate[2])
        );
      } else {
        corners[i] = new THREE.Vector3(0.5, 0.5, 0.5);
      }
    }
    return corners;
  }

  VoxView.writeQueryString = function(model) {
    var voxelLink = document.getElementById('voxelLink');
    var newHref = window.location.href.split("?")[0];

    if (voxelLink) {
      for (var i = 0; i < 8; i++) {
        var v = model.corners[i];
        newHref += (i == 0 ? '?' : '&');
        newHref += Math.round(v.x * 100) / 100 + "," +
                   Math.round(v.y * 100) / 100 + "," +
                   Math.round(v.z * 100) / 100;
      }
      voxelLink.href = newHref;
    }
  }

  VoxView.relMouseCoords = function(event, domObj) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = domObj;

    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return { x: canvasX, y: canvasY };
  }

  VoxView.initGui = function(model, grid) {
    var gui = new dat.GUI();

    for (var i = 0; i < 8; i++) {
      var folder = gui.addFolder(VoxView.CORNER[i].name);
      var corner = model.corners[i];
      folder.add(corner, 'x', -VoxView.RESOLUTION, VoxView.RESOLUTION, 0.01);
      folder.add(corner, 'y', -VoxView.RESOLUTION, VoxView.RESOLUTION, 0.01);
      folder.add(corner, 'z', -VoxView.RESOLUTION, VoxView.RESOLUTION, 0.01);
    }
    var gridFolder = gui.addFolder("Voxel Grid");
    gridFolder.add(grid, 'visible');

  }

  // DO IT!
  //

  // Initialize scene elements
  
  return VoxView;
});
