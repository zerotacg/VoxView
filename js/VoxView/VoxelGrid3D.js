define(function(require){
  var THREE     = require( 'three' )
    ;

  //
  // VoxelGrid3D view object
  //
  VoxelGrid3D = function () {
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

  VoxelGrid3D.prototype = Object.create(THREE.Object3D.prototype);

  VoxelGrid3D.prototype.update = function() {
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

  return VoxelGrid3D;
});

