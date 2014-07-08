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
// VoxelObject3D view object
//

VoxView.VoxelObject3D = function(model, location) {
  THREE.Object3D.call(this);

  var center = location || new THREE.Vector3();

  var verts = [];
  for (var i = 0; i < 8; i++) {
    verts.push(VoxView.convertCornerToVertex(model.corners[i], VoxView.CORNER[i].dir, center));
  }

  var fullGeom = new THREE.Geometry();
  fullGeom.vertices = verts;

  var voxObj = new THREE.Object3D();
  var makeFace = function(a1,a2,a3, b1,b2,b3, name) {
    var face, quad, geom = new THREE.Geometry();
    geom.vertices = verts;

    face = new THREE.Face3(a1.index, a2.index, a3.index);
    geom.faces.push(face);
    fullGeom.faces.push(face);

    face = new THREE.Face3(b1.index, b2.index, b3.index);
    geom.faces.push(face);
    fullGeom.faces.push(face);

    quad = new THREE.Mesh(geom, model.material.clone());
    quad.name = name;

    voxObj.add(quad);
  }

  var C = VoxView.CORNER;
  makeFace(C.topSE, C.topNE, C.topNW, C.topSE, C.topNW, C.topSW, "Top");
  makeFace(C.topSE, C.botSW, C.botSE, C.topSE, C.topSW, C.botSW, "South");
  makeFace(C.topSE, C.botNE, C.topNE, C.topSE, C.botSE, C.botNE, "East");
  makeFace(C.botNW, C.botNE, C.botSE, C.botNW, C.botSE, C.botSW, "Bottom");
  makeFace(C.botNW, C.topNW, C.topNE, C.botNW, C.topNE, C.botNE, "North");
  makeFace(C.botNW, C.topSW, C.topNW, C.botNW, C.botSW, C.topSW, "West");

  this.model = model;
  this.vertices = verts;
  this.faceMeshes = voxObj;
  this.fullMesh = new THREE.Mesh(fullGeom, model.material.clone());
  this.wireMesh = new THREE.WireframeHelper(this.fullMesh);
  this.wireMesh.material.color.set(model.material.color);

  this.add(this.faceMeshes);
  this.add(this.wireMesh);
}

VoxView.VoxelObject3D.prototype = Object.create(THREE.Object3D.prototype);

VoxView.VoxelObject3D.prototype.updateVertices = function(center) {
  var origin = center || new THREE.Vector3();
  for (var i = 0; i < 8; i++) {
    this.vertices[i].copy(VoxView.convertCornerToVertex(this.model.corners[i], VoxView.CORNER[i].dir, origin));
  }

  this.traverse(function (m) {
    if (m.geometry) {
      m.geometry.verticesNeedUpdate = true;
    }
  });

  this.remove(this.wireMesh);
  this.wireMesh = new THREE.WireframeHelper(this.fullMesh);
  this.wireMesh.material.color.set(this.fullMesh.material.color);
  this.add(this.wireMesh);
}

VoxView.VoxelObject3D.prototype.selectControlPoint = function(ray) {
  var iobj = null;
  var intersects = ray.intersectObjects(this.faceMeshes.children);
  if (intersects.length > 0) {
    iobj = intersects[0].object;
  }
  return iobj;
}

VoxView.VoxelObject3D.prototype.startHoverEffect = function(obj) {
  var HOVER_COLOR = 0xffff00;
  obj.material.color.setHex(HOVER_COLOR);
}

VoxView.VoxelObject3D.prototype.stopHoverEffect = function(obj) {
  obj.material.color.set(this.fullMesh.material.color);
}

//
// VoxelGrid3D view object
//

VoxView.VoxelGrid3D = function () {
  THREE.Object3D.call(this);

  var gridHelper;
  var gridAxis;

  // inner cube
  var SIZE = 1;
  var STEP = 1;
  gridAxis = new THREE.Object3D();
  gridAxis.name = "Y";
  gridAxis.visible = true;
  for (var i = 0; i < 3; i++) {
    gridHelper = new THREE.GridHelper(SIZE, STEP);
    gridHelper.position = new THREE.Vector3(0, i-1, 0);
    gridAxis.add(gridHelper);
  }
  this.yAxis = gridAxis;

  gridAxis = new THREE.Object3D();
  gridAxis.name = "Z";
  gridAxis.visible = true;
  for (var j = 0; j < 3; j++) {
    gridHelper = new THREE.GridHelper(SIZE, STEP);
    gridHelper.position = new THREE.Vector3(0, 0, j-1);
    gridHelper.rotation.x = Math.PI/2;
    gridAxis.add(gridHelper);
  }
  this.zAxis = gridAxis;

  gridAxis = new THREE.Object3D();
  gridAxis.name = "X";
  gridAxis.visible = true;
  for (var k = 0; k < 3; k++) {
    gridHelper = new THREE.GridHelper(SIZE, STEP);
    gridHelper.position = new THREE.Vector3(k-1, 0, 0);
    gridHelper.rotation.z = Math.PI/2;
    gridAxis.add(gridHelper);
  }
  this.xAxis = gridAxis;

  // outer cube
  var SIZE = 2;
  var STEP = 1;
  gridAxis = new THREE.Object3D();
  gridAxis.name = "YO";
  gridAxis.visible = true;
  for (var i = -1; i < 4; i+=4) {
    gridHelper = new THREE.GridHelper(SIZE, STEP);
    gridHelper.setColors(0x444444,0x444444);
    gridHelper.position = new THREE.Vector3(0, i-1, 0);
    gridAxis.add(gridHelper);
  }
  this.yoAxis = gridAxis;

  gridAxis = new THREE.Object3D();
  gridAxis.name = "ZO";
  gridAxis.visible = true;
  for (var j = -1; j < 4; j+=4) {
    gridHelper = new THREE.GridHelper(SIZE, STEP);
    gridHelper.setColors(0x444444,0x444444);
    gridHelper.position = new THREE.Vector3(0, 0, j-1);
    gridHelper.rotation.x = Math.PI/2;
    gridAxis.add(gridHelper);
  }
  this.zoAxis = gridAxis;

  gridAxis = new THREE.Object3D();
  gridAxis.name = "XO";
  gridAxis.visible = true;
  for (var k = -1; k < 4; k+=4) {
    gridHelper = new THREE.GridHelper(SIZE, STEP);
    gridHelper.setColors(0x444444,0x444444);
    gridHelper.position = new THREE.Vector3(k-1, 0, 0);
    gridHelper.rotation.z = Math.PI/2;
    gridAxis.add(gridHelper);
  }
  this.xoAxis = gridAxis;

  this.add(this.xAxis);
  this.add(this.yAxis);
  this.add(this.zAxis);
  this.add(this.xoAxis);
  this.add(this.yoAxis);
  this.add(this.zoAxis);
  this.visible = true;
}

VoxView.VoxelGrid3D.prototype = Object.create(THREE.Object3D.prototype);

VoxView.VoxelGrid3D.prototype.update = function() {
  this.remove(this.xAxis);
  this.remove(this.yAxis);
  this.remove(this.zAxis);
  this.remove(this.xoAxis);
  this.remove(this.yoAxis);
  this.remove(this.zoAxis);

  if (this.visible) {
    if (this.xAxis.visible) {
      this.add(this.xAxis);
    }
    if (this.yAxis.visible) {
      this.add(this.yAxis);
    }
    if (this.zAxis.visible) {
      this.add(this.zAxis);
    }
    if (this.xAxis.visible) {
      this.add(this.xoAxis);
    }
    if (this.yAxis.visible) {
      this.add(this.yoAxis);
    }
    if (this.zAxis.visible) {
      this.add(this.zoAxis);
    }
  }
}

//
// TooltipSprite object
//

VoxView.TooltipSprite = function() {
  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d');

  context.font = "Bold 36px Arial";

  var texture = new THREE.Texture(canvas);
  texture.needsUpdate = true;

  var spriteMaterial = new THREE.SpriteMaterial({
    map: texture,
    useScreenCoordinates: true
  });
  var sprite = new THREE.Sprite(spriteMaterial);
  sprite.scale.set(200, 100, 1.0);
  sprite.position.set(80, 200, 0);

  this.sprite = sprite;
  this.context = context;
  this.texture = texture;
  this.textFillStyle = "rgba(255,255,255,1)";
}

VoxView.TooltipSprite.prototype = {};

VoxView.TooltipSprite.prototype.setText = function(toolText) {
  var textWidth = this.context.measureText(toolText).width;
  this.context.clearRect(0, 0, 640, 480);
  this.context.fillStyle = this.textFillStyle;
  this.context.fillText(toolText, 4, 30);
  this.texture.needsUpdate = true;
}

VoxView.TooltipSprite.prototype.clear = function() {
  this.context.clearRect(0, 0, 640, 480);
  this.texture.needsUpdate = true;
}

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
  gui = new dat.GUI();

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
