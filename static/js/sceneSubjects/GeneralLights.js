function GeneralLights(scene) {
	
    var subscene = new THREE.Object3D();
    subscene.name = "GeneralLights";
    scene.add(subscene);

	// There Are, 3, THREE Lights

	var lights = [];
	lights[ 0 ] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[ 1 ] = new THREE.PointLight( 0xffffff, 1, 0 );
	lights[ 2 ] = new THREE.PointLight( 0xffffff, 1, 0 );

	lights[ 0 ].position.set( 0, 200, 0 );
	lights[ 1 ].position.set( 100, 200, 100 );
	lights[ 2 ].position.set( - 100, - 200, - 100 );

	scene.add( lights[ 0 ] );
	scene.add( lights[ 1 ] );
	scene.add( lights[ 2 ] );


	/////////////////////////////////////////////////////////////////////////
	this.init = function() {

	}


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }


	this.update = function(time) {
		// no-op
	}
}