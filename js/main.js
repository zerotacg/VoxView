require.config({
    paths: {
        'dat': 'libs/dat-gui/src/dat'
      , 'three': 'libs/threejs/build/three'
      , 'three.orbitcontrols': 'OrbitControls'
      , 'text': 'libs/requirejs-text/text'
      , 'domReady': 'libs/requirejs-domReady/domReady'
    }

  , shim: {
        'Detector': { exports: 'Detector' }
      , 'three': { exports: 'THREE' }
      , 'three.orbitcontrols': {
            deps: [ 'three' ]
          , exports: 'THREE.OrbitControls'
        }
    }
});

define(function(require){
    var VoxView     = require( 'VoxView' )
      , VoxViewApp  = require( 'VoxView/App' )
      ;

    require(['domReady!'], function (doc){
        var initialState  = window.location.search.substring(1)
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
});
