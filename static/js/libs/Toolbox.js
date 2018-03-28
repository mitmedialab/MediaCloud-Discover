function Toolbox() {}

    let txtMesh = null;
    const textMaterial = new THREE.MeshPhongMaterial( { color: 0xffffff } );
    
/////////////////////////////////////////////////////////////////////////
Toolbox.addText = function( t, pos, group ) {

    var textGeo = new THREE.TextGeometry( t, {
        font: font,
        size: 2,
        height: 0,
        curveSegments: 12,
    });
    textGeo.computeBoundingBox();
    // textGeo.computeVertexNormals();
    // textGeo.center();
    
    txtMesh = new THREE.Mesh( textGeo, textMaterial );
    txtMesh.position.x = pos.x + 10;
    txtMesh.position.y = pos.y;
    txtMesh.position.z = pos.z;
    txtMesh.visible = false;
    // mesh.castShadow = true;
    // mesh.receiveShadow = true;

    group.add( txtMesh );
}