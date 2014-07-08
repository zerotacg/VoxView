define(function(require){
  var THREE     = require( 'three' )
    ;

  //
  // TooltipSprite object
  //

  TooltipSprite = function() {
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

  TooltipSprite.prototype = {};

  TooltipSprite.prototype.setText = function(toolText) {
    var textWidth = this.context.measureText(toolText).width;
    this.context.clearRect(0, 0, 640, 480);
    this.context.fillStyle = this.textFillStyle;
    this.context.fillText(toolText, 4, 30);
    this.texture.needsUpdate = true;
  }

  TooltipSprite.prototype.clear = function() {
    this.context.clearRect(0, 0, 640, 480);
    this.texture.needsUpdate = true;
  }

  return TooltipSprite;
});

