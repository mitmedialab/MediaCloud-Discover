
/////////////////////////////////////////////////////////////////////////
// Landing Scene
/////////////////////////////////////////////////////////////////////////

function Landing(scene) {


    var subscene = new THREE.Object3D();
    subscene.name = "Landing";
    scene.add(subscene);


    /////////////////////////////////////////////////////////////////////
    this.enter = function() {

        // Slide in summary div
        $( '#landing' ).load( '/html/landing_content.html');
        $( '#landing' ).show( "slide", { direction: "right"  }, 1000 );
    }


    this.exit = function() {

        $( '#landing' ).hide( "slide", { direction: "right"  }, 300 );
    }


    /////////////////////////////////////////////////////////////////////////
    this.update = function(time) {

        // no-op    	
    }


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }    


	/////////////////////////////////////////////////////////////////////////
    this.init = function() {
    	
    }
}