
/////////////////////////////////////////////////////////////////////////
// Globe Scene
/////////////////////////////////////////////////////////////////////////

function Globe(scene) {

    var subscene = new THREE.Object3D();
    subscene.name = "Globe";
    scene.add(subscene);

    /////////////////////////////////////////////////////////////////////
    this.enter = function() {
      
    }


    this.exit = function() {
      
    }



    addGlobe = function() {
        if(!Detector.webgl)
        {

            var globeDiv = document.getElementById("globe-container");
            globeDiv.innerHTML = "<img id=\"globe-image\" width=\"600px\" src=\"img/globe.png\" />";

            var recommendedDiv = document.getElementById("recommendedBrowsers");
            recommendedDiv.innerHTML = "Ваш браузер или видеокарта не поддерживает webGL, рекомендуется просмотр в браузерах <a href=\"http://www.google.com/chrome\">Google&nbsp;Chrome&nbsp;9.0+</a>, <a href=\"http://www.mozilla.org/ru/firefox/new/\">Mozilla&nbsp;Firefox&nbsp;4.0+</a>, <a href=\"http://www.opera.com/ru\">Opera&nbsp;13.0+</a>, <a href=\"http://windows.microsoft.com/ru-ru/internet-explorer/ie-11-worldwide-languages\">Internet&nbsp;Explorer&nbsp;11.0+</a>";
        }
        else
        {

            var container = document.getElementById('globe-container');

            // We're going to ask a file for the JSON data.
            xhr = new XMLHttpRequest();

            // Where do we get the data?
            xhr.open( 'GET', 'data/rank.json', true );

            // What do we do when we have it?
            xhr.onreadystatechange = function() {

                // If we've received the data
                if ( xhr.readyState === 4 && xhr.status === 200 ){
        
                    // Parse the JSON
                    var data = JSON.parse( xhr.responseText );

                    // Remove globe image 
                    /*var glimage = document.getElementById("globe-image");

                    container.removeChild(glimage);*/

                    // Make the globe
                    var globe = new DAT.Globe( container );        
        
                    // Tell the globe about your JSON data
                    globe.addData(data, {format: 'magnitude'});
        
                    // Create the geometry
                    globe.createPoints();
        
                    // Begin animation
                    globe.animate();

                }
            };
        
            // Begin request
            xhr.send( null );
        };
    };
    // addGlobe();


    /////////////////////////////////////////////////////////////////////////
    this.update = function(time) {

    	
    }


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }
    

	/////////////////////////////////////////////////////////////////////////
    this.init = function() {
    	var subscene = new THREE.Object3D();
    	subscene.name = "Globe";
    	scene.add(subscene);
    }
    this.init();
}