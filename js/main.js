require.config({
    paths: {
        'three': 'libs/threejs/build/three.min'
      , 'three.orbitcontrols': 'OrbitControls'
      , 'dat': 'libs/dat-gui/build/dat.gui.min'
    }

  , shim: {
        'dat': { exports: 'dat' }
      , 'Detector': { exports: 'Detector' }
      , 'three': { exports: 'THREE' }
      , 'three.orbitcontrols': {
            deps: [ 'three' ]
          , exports: 'THREE.OrbitControls'
        }
    }
});

define(function(require){
    var three       = require( 'three' )
      , dat         = require( 'dat' )
      , VoxView     = require( 'VoxView' )
      , VoxViewApp  = require( 'VoxView/App' )

      , initialState  = window.location.search.substring(1)
      , displayDiv    = document.getElementById('voxViewDisplay')
      , corners
      ;
    if (initialState) {
      corners = VoxView.readQueryString(initialState);
    }
    voxObject = new VoxViewApp({ cornerLocs: corners,
                                 container: displayDiv,
                                 width: 800,
                                 height: 600 });

    // Start animation loop
    voxObject.animate();
});
