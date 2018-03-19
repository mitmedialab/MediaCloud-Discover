function FontTest(scene) {

	const radius = 2;
	const mesh2 = new THREE.Mesh(new THREE.IcosahedronBufferGeometry(radius, 2), new THREE.MeshStandardMaterial({ flatShading: true }));

	mesh2.position.set(0, 0, -10);
	// scene.add(mesh2);

	var loader = new THREE.FontLoader();
	this.texts = [];

	// Dynamically add Media Cloud texts
	for(var ii = 0; ii < media_list.length; ii++) {
		addText(media_list[ii], this.texts);
	}

	this.update = function(time) {
		perlin = noise.perlin2( time, time );
		perlin2 = noise.perlin2( time, time);

		// if(controls.randomTextSpin) {
		// 	particleSystem.rotation.y += 0.001+Math.abs(perlin2/10);
		// } else {
		// 	particleSystem.rotation.y += 0.001;
		// }

		if(false) {
			// TWEEN.removeAll();
			for(var p = 0; p < this.texts.length; p++)
			{
				var t = new TWEEN.Tween( this.texts[p].position ).to( {
							// x: perlin*25,
							y: perlin2 * 200 // Math.random()*200 
						}, 1000 );
						// .easing( TWEEN.Easing.Elastic.Out);
				t.start();
			}
			
		}
		
		// Rotate Planet
		mesh2.rotation.y += 0.01;
	}

	function addEntity() {

		
	}

	function addText(t, text_array) {

		loader.load( 'https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/fonts/helvetiker_bold.typeface.json', function ( font ) {
	    	var textGeo = new THREE.TextGeometry( t, {
	        font: font,
	        size: 2, // font size
	        height: 0, // how much extrusion (how thick / deep are the letters)
	        curveSegments: 12,
	        // curveSegments: 5,
	        // bevelThickness: 1,
	        // bevelSize: 1,
	        // bevelEnabled: true
	    	});
	    
		    textGeo.computeBoundingBox();
		    var textMaterial = new THREE.MeshPhongMaterial( { color: 0xff0000 } );  // specular: 0xffffff
		    var mesh = new THREE.Mesh( textGeo, textMaterial );
		    mesh.position.x = Math.random()*105;
		    mesh.position.y = Math.random()*120;
		    mesh.position.z = Math.random()*150;
		    // mesh.castShadow = true;
		    // mesh.receiveShadow = true;
		    
		    text_array.push(mesh);
		    scene.add( mesh );
		});
	}
}