define(function(require){
  var THREE     = require( 'three' )
    , VoxView   = require( '../VoxView' )
    ;

  //
  // VoxelObject3D view object
  //
  VoxelObject3D = function(model, location) {
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

  VoxelObject3D.prototype = Object.create(THREE.Object3D.prototype);

  VoxelObject3D.prototype.updateVertices = function(center) {
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

  VoxelObject3D.prototype.selectControlPoint = function(ray) {
    var iobj = null;
    var intersects = ray.intersectObjects(this.faceMeshes.children);
    if (intersects.length > 0) {
      iobj = intersects[0].object;
    }
    return iobj;
  }

  VoxelObject3D.prototype.startHoverEffect = function(obj) {
    var HOVER_COLOR = 0xffff00;
    obj.material.color.setHex(HOVER_COLOR);
  }

  VoxelObject3D.prototype.stopHoverEffect = function(obj) {
    obj.material.color.set(this.fullMesh.material.color);
  }

  return VoxelObject3D;
});

