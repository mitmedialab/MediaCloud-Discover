
// Where do we do other event handlers besides updates? In here?
// How do we trigger a tween on click?

function StarField(scene) {
	
	// Parent Object
	var subscene = new THREE.Object3D();
	subscene.name = "StarField";
    scene.add(subscene);
    // Wait, Layers in Three.js?

	const particleCount = 1000;
	const radius = 2;
	const tweened = false;
	noise.seed(Math.random());
	var perlin;

	this.particles = new THREE.Geometry();
	
	// var pMaterial = new THREE.PointsMaterial({
	//     color: 0xFFFFFF,
	//     size: 20,
	//     map: THREE.TextureLoader( "images/particle.png" ),
 //  		blending: THREE.AdditiveBlending,
 //  		transparent: true
	// });

	// var pMaterial2 = new THREE.MeshStandardMaterial({ 
	// 			 			metalness: 1.0, 
	// 			 			flatShading: true });

	for(var p = 0; p < particleCount; p++)
	{
		var star = new THREE.IcosahedronBufferGeometry(radius*10, 3);
		star.x = THREE.Math.randFloatSpread( 200 );
		star.y = THREE.Math.randFloatSpread( 200 );
		star.z = THREE.Math.randFloatSpread( 200 );

		this.particles.vertices.push(star);
	}
	// console.log(`Particle Count: ${this.particles.vertices.length}`);

	var starsMaterial = new THREE.PointsMaterial( { color: 0xFFFFFF, size: 0.3 } );
	var particleSystem = new THREE.Points( this.particles, starsMaterial );
	
	particleSystem.sortParticles = true;
	subscene.add( particleSystem );

	// WIREFRAME
	// const meshwire = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(radius+0.5, 2), new THREE.MeshPhongMaterial({ }));
	// var geo = new THREE.EdgesGeometry( meshwire.geometry ); // or WireframeGeometry
	// var mat = new THREE.LineBasicMaterial( { color: 0xffffff, linewidth: 2 } );
	// var wireframe = new THREE.LineSegments( geo, mat );
	// meshwire.add( wireframe );
	// meshwire.position.set(0, 0, -2);
	// scene.add(meshwire);
	

	/////////////////////////////////////////////////////////////////////////
	this.init = function() {

	}


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }
    

	this.toggleVisible = function() {
		subscene.visible = !subscene.visible;
	}

	this.update = function(time) {
		perlin = noise.perlin2( time, time );
		perlin2 = noise.perlin2( time, time);

		// meshwire.rotation.y += 0.001;

		// ROTATE ENTIRE PARTICLE SYSTEM RANDOMLY
		if(controls.randomSpin) {
			particleSystem.rotation.y += 0.001+Math.abs(perlin2/10);
		} else {
			if(controls.starfieldOrbitToggle) {
				particleSystem.rotation.y += 0.001;
			}
		}

		if(false) {
			// TWEEN.removeAll();
			for(var p = 0; p < particleCount; p+2)
			{
				var t = new TWEEN.Tween( this.particles.vertices[p] ).to( {
							// x: perlin*25,
							y: Math.sin(perlin2*Math.random()*20000)	}, 10000 );
						// .easing( TWEEN.Easing.Elastic.Out);
				t.start();
			}
			this.particles.verticesNeedUpdate = true;
		}
	}

}