
/////////////////////////////////////////////////////////////////////////
// Thinking Animation
/////////////////////////////////////////////////////////////////////////

function Thinking(scene) {

    var subscene = new THREE.Object3D();
    subscene.name = "Thinking";
    scene.add(subscene);

	let theta = 0.0;
	
	const geometry = new THREE.DodecahedronGeometry( 2, 1 );
	const material = new THREE.MeshStandardMaterial( { 
		color: new THREE.Color( 0.5, 0.7, 0.7 ), 
		flatShading: false, 
		wireframe: true 
	} );
	let mesh1 = new THREE.Mesh( geometry, material );
	let mesh2 = new THREE.Mesh( geometry, material );
	let mesh3 = new THREE.Mesh( geometry, material );

	const orbiters = [ mesh1, mesh2, mesh3 ];
	
	const group = new THREE.Group();
	group.add( mesh1 );
	group.add( mesh2 );
	group.add( mesh3 );

	scene.add(group);


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }


	/////////////////////////////////////////////////////////////////////////
	this.on = function() {
		group.visible = true;
	}


	/////////////////////////////////////////////////////////////////////////
	this.off = function() {
		group.visible = false;
	}

	this.off();

    /////////////////////////////////////////////////////////////////////////
    this.update = function(time) {

		radius_x = 5;
		radius_y = 12;
		radius_z = 6;

		// Rotate
		for (var i = 0; i < orbiters.length; i++) {
			orbiters[i].rotation.x += 0.002;
		}

		// Orbit
		theta += 0.05;
		mesh1.position.x = radius_x * Math.cos( theta );
		mesh1.position.y = radius_y * Math.sin( theta );

		// Orbit Opposite x/y
		mesh2.position.y = radius_x * Math.cos( theta + 1.0 );
		mesh2.position.x = radius_y * Math.sin( theta + 0.5 );

		// Orbit x/z
		mesh3.position.x = radius_x * Math.cos( theta + 2.0 );
		mesh3.position.y = radius_y * Math.cos( theta + 1.0 );
		mesh3.position.z = radius_z * Math.sin( theta + 1.5 );
    }


	/////////////////////////////////////////////////////////////////////////
    this.init = function() {
    	const subscene = new THREE.Object3D();
    	subscene.name = "Thinking";
    	scene.add(subscene);
    }
    this.init();
}