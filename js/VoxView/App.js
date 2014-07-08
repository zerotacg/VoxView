define(function(require){
  var Detector      = require( 'Detector' )
    , THREE         = require( 'three' )
    , OrbitControls = require( 'three.orbitcontrols' )
    , VoxView       = require( '../VoxView' )
    , TooltipSprite = require( './TooltipSprite' )
    , UnitVoxel     = require( './UnitVoxel' )
    , VoxelGrid3D   = require( './VoxelGrid3D' )
    , VoxelObject3D = require( './VoxelObject3D' )
    ;

  //
  // VoxView Application object
  //
  App = function (paramObj) {
    var params = paramObj || {};

    //
    // Scenes
    //
    var scene = new THREE.Scene();
    var sceneOrtho = new THREE.Scene();

    //
    // Cameras
    //
    var DISPLAY_WIDTH = params.width || window.innerWidth;
    var DISPLAY_HEIGHT = params.height || window.innerHeight;
    var VIEW_ANGLE = 75;
    var ASPECT_RATIO = DISPLAY_WIDTH / DISPLAY_HEIGHT;
    var NEAR = 0.1;
    var FAR = 10000;

    var camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT_RATIO, NEAR, FAR);
    camera.position.set(3, 2, 1);
    camera.lookAt(scene.position);

    // The orthographic camera is for the tooltip sprite
    var cameraOrtho = new THREE.OrthographicCamera(
      -DISPLAY_WIDTH/2, DISPLAY_WIDTH/2,
      DISPLAY_HEIGHT/2, -DISPLAY_HEIGHT/2, NEAR, FAR
    );
    cameraOrtho.position.z = 10;

    //
    // Renderer
    //
    var renderer;
    if ( Detector.webgl )
      renderer = new THREE.WebGLRenderer({ antialias: true });
    else
      renderer = new THREE.CanvasRenderer();
    renderer.setSize(DISPLAY_WIDTH, DISPLAY_HEIGHT);
    renderer.autoClear = false;

    var domContainer = params.container || document.body;
    domContainer.appendChild(renderer.domElement);

    //
    // Lights
    //
    var light = new THREE.AmbientLight( 0xffffff );
    scene.add(light);

    //
    // Geometry
    //

    // Visible Geometry
    var model = new UnitVoxel({corners: params.cornerLocs});
    var vox = new VoxelObject3D(model);

    scene.add(vox);

    // Voxel Grid Geometry
    var gridobj = new VoxelGrid3D();

    scene.add(gridobj);

    //
    // Controls
    //
    var controls = new THREE.OrbitControls(camera, renderer.domElement);
    var tooltipSprite = new TooltipSprite();
    var projector = new THREE.Projector();
    var mouse = { x: 0, y: 0};

    controls.userPanSpeed = 0.1;
    sceneOrtho.add(tooltipSprite.sprite);

    var onDocumentMouseMove = function(event) {
      var coords = VoxView.relMouseCoords(event, renderer.domElement);

      mouse.x = (coords.x / DISPLAY_WIDTH) * 2 - 1;
      mouse.y = - (coords.y / DISPLAY_HEIGHT) * 2 + 1;
    }

    document.addEventListener('mousemove', onDocumentMouseMove, false);

    VoxView.initGui(model, gridobj);

    //
    // Initialize attributes
    //
    this.model = model;

    this.scene = scene;
    this.sceneOrtho = sceneOrtho;
    this.camera = camera
    this.cameraOrtho = cameraOrtho;
    this.renderer = renderer;

    this.vox = vox;
    this.grid = gridobj;
    this.tooltipSprite = tooltipSprite;

    this.controls = controls;

    this.projector = projector;
    this.INTERSECTED = null;
    this.mouse = mouse;
  }

  App.prototype = {
    constructor: App
   ,render: function () {
      var r = this.renderer;
      r.clear();
      r.render(this.scene, this.camera);
      r.clearDepth();
      r.render(this.sceneOrtho, this.cameraOrtho);
    }

   ,checkMouseOver: function(x, y) {
      var vector = new THREE.Vector3(x, y, 1);
      this.projector.unprojectVector(vector, this.camera);

      var ray = new THREE.Raycaster(this.camera.position,
                                    vector.sub(this.camera.position).normalize());

      var iobj = this.vox.selectControlPoint(ray);

      if (iobj) {

        // update tooltip if ray intersects a different object
        if (iobj != this.INTERSECTED) {
          if (this.INTERSECTED) {
            this.vox.stopHoverEffect(this.INTERSECTED);
          }
          this.INTERSECTED = iobj;

          this.vox.startHoverEffect(iobj);

          if (iobj.name) {
            this.tooltipSprite.setText(iobj.name);
          } else {
            this.tooltipSprite.clear();
          }

        }

        // do nothing if ray intersects the same object

      } else {

        // no intersections, so clear any intersected record
        if (this.INTERSECTED) {
          this.vox.stopHoverEffect(this.INTERSECTED);
          this.tooltipSprite.clear();
        }
        this.INTERSECTED = null;

      }
    }

   ,update: function () {
      this.controls.update();

      this.grid.update();

      this.vox.updateVertices();

      this.checkMouseOver(this.mouse.x, this.mouse.y);

      VoxView.writeQueryString(this.model);
    }

   ,animate: function () {
      var app = this;
      var next = function () {
        requestAnimationFrame(next);
        app.render();
        app.update();
      }
      requestAnimationFrame(next);
    }
  };

  return App;
});

