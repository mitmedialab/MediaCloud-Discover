function SceneSubject(scene) {
	
	const radius = 2;
	const mesh = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(radius, 2), new THREE.MeshStandardMaterial({ flatShading: true }));

	MC_CONTEXT.camera.add(mesh);
	mesh.position.set(-30, 15, -60);
	// scene.add(mesh);

	this.update = function(time) {
		const scale = Math.sin(time)+2;
		// mesh.scale.set(scale, scale, scale);
		mesh.rotation.y += 0.001;
	}
}