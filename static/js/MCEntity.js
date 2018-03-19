function MCEntity(scene, data) {

// ENTITY: A data structure for representing the data and state of an entity
// (Person, Place, Organization, or Media Source) and passing it into application state.

// 1. Constructor should ingest data from query call (do we need different types here or just a catch-all)

// Run Rahul's queries he suggested and build this for them.

// TODO: Show the "label" property, not the "tag", on the screen as the text to represent the tag.
	    
	// Unpack Media Query data_list

	// this.firstName = first;

	this.data = data;
	this.name = data.name;
	this.size = 300;
	init();

	function init() {
		var mesh = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(this.size, 2), new THREE.MeshStandardMaterial({ color: "#0AE", roughness: 0 }));
		var mesh = makeShinySphere();
		var r = Math.random()*200;
		mesh.position.set(r, -r, r);
		mesh.userData.name = data.name;
		scene.add(mesh);
	}

	function makeShinySphere() {

		var geometry = new THREE.SphereGeometry(30, 64, 64); 
		var material = new THREE.MeshStandardMaterial({ color: "#000", roughness: 1 });
		 
		var envMap = new THREE.TextureLoader().load('/static/images/envMap.png');
		envMap.mapping = THREE.SphericalReflectionMapping;
		material.envMap = envMap;
		
		var roughnessMap = new THREE.TextureLoader().load('/static/images/roughnessMap.png');
		roughnessMap.magFilter = THREE.NearestFilter;
		material.roughnessMap = roughnessMap;
		
		var mesh = new THREE.Mesh(geometry, material);
		return mesh;
	}
}