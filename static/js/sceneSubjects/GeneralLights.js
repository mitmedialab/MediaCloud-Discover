function GeneralLights(scene) {
	
    var subscene = new THREE.Object3D();
    subscene.name = "GeneralLights";
    scene.add(subscene);

	const light = new THREE.PointLight("#ffffff", 1);
    scene.add(light);
    
 //    var plh = new THREE.PointLightHelper(light, 2);
	// scene.add(plh);

	light2 = new THREE.PointLight( 0xffcc77, 1.0);
	scene.add(light2);
	light2.position.z = 30;
	light2.position.x = 40;
	light2.position.y = 20;

	// var plh2 = new THREE.PointLightHelper(light2,1);
	// scene.add(plh2);
	
	/////////////////////////////////////////////////////////////////////////
	this.init = function() {

	}


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }


	this.update = function(time) {
		// light.intensity = (Math.sin(time)+1.5)/1.5;
		// light.color.setHSL( Math.sin(time), 0.5, 0.5 );
	}
}