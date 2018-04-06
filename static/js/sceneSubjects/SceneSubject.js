function SceneSubject(scene) {
	
	const radius = 2;
	const mesh = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(radius, 2), new THREE.MeshStandardMaterial({ flatShading: true }));

	// Pinning Objects To The Camera 
	// 	(requires camera to be unconventionally added to the scene)
	//	(requires position to be set after being added to the camera)
	// https://stackoverflow.com/questions/17218054/how-to-put-an-object-in-front-of-camera-in-three-js
	// MC_CONTEXT.camera.add(mesh);
	mesh.position.set(-30, 15, -60);

	this.update = function(time) {
		const scale = Math.sin(time)+2;
		// mesh.scale.set(scale, scale, scale);
		mesh.rotation.y += 0.001;
	}


	/////////////////////////////////////////////////////////////////////////
	this.init = function() {

	}


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return this.subscene.name;
    }
}