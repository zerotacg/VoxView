define(function(require){
  var THREE = require( 'three' );

  //
  // UnitVoxel model object
  //
  var UnitVoxel = function(params) {
    this.material = params.material || new THREE.MeshBasicMaterial({
      color: 0x00ff00,
      transparent: true,
      opacity: .2
    });

    if (params.corners) {
      this.corners = params.corners
    } else {
      this.corners = [];
      for (var i = 0; i < 8; i++) {
        this.corners[i] = new THREE.Vector3(0.0, 0.0, 0.0);
      }
    }
  };

  UnitVoxel.prototype = {
    constructor: UnitVoxel
  };
  return UnitVoxel;
});
