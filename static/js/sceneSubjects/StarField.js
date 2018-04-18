function StarField(scene) {
	
	var subscene = new THREE.Object3D();
	subscene.name = "StarField";
    scene.add(subscene);

    const particleCount = 1000;
    this.particles = new THREE.Geometry();
    var particleSystem = null;
	

	/////////////////////////////////////////////////////////////////////////
	this.init = function() {

		var star = new THREE.IcosahedronBufferGeometry();

		for(var p = 0; p < particleCount; p++)
		{
			star = star.clone();

			star.x = THREE.Math.randFloatSpread( 200 );
			star.y = THREE.Math.randFloatSpread( 200 );
			star.z = THREE.Math.randFloatSpread( 200 );

			this.particles.vertices.push(star);
		}

		var starsMaterial = new THREE.PointsMaterial( { color: 0xFFFFFF, size: 0.3 } );
		particleSystem = new THREE.Points( this.particles, starsMaterial );
		
		particleSystem.sortParticles = true;
		subscene.add( particleSystem );
	}


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }
    

    /////////////////////////////////////////////////////////////////////////
	this.toggleVisible = function() {
		subscene.visible = !subscene.visible;
	}


	/////////////////////////////////////////////////////////////////////////
	this.update = function(time) {

		if(controls.starfieldOrbitToggle) {
			particleSystem.rotation.y += 0.0002;
		}
	}
}