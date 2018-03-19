// SVG Load Test

function SVGTest(scene) {

	var svgManager = new THREE.SVGLoader();
	var display = false;
	function svg_loading_done_callback(svgObject) {
  		init(new THREE.SVGObject(svgObject));
	};

	svgManager.load('/static/vectors/SVGTest2.svg', 
                svg_loading_done_callback, 
                function(){console.log("Loading SVG...");},
                function(){console.log("Error loading SVG!");
                });

	var map = new THREE.TextureLoader().load( "/static/vectors/SVGTest2.svg" ); 
	var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: true } ); 
	var sprite = new THREE.Sprite( material ); 
	if(display) {
		scene.add( sprite );
	}

	function init(svgObject) {

		svgObject.position.x = 0;
		svgObject.position.y = 0;
		svgObject.position.z = 0;
		// svgObject.scale.x = 1000;
		// svgObject.scale.y = 1000;
		// svgObject.scale.z = 1000;
		svgObject.scale.set(1000, 1000, 1000);
		scene.add(svgObject);
	}

	this.update = function() {
		// no-op
	}
}