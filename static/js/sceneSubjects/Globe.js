
/////////////////////////////////////////////////////////////////////////
// Globe Scene
/////////////////////////////////////////////////////////////////////////

function Globe( scene ) {

    var subscene = new THREE.Object3D();
    subscene.name = "Globe";
    scene.add(subscene);

    let loadedGlobeCountry;
    this.globe = undefined;


    /////////////////////////////////////////////////////////////////////////
    var DAT = DAT || {};
    var group = new THREE.Group();

    DAT.Globe = function(container, opts, scene, renderer, texture, group) {
      opts = opts || {};
    
        group.scale.set( opts.globeScale, opts.globeScale, opts.globeScale );

        var colorFn = opts.colorFn || function(x) {
            // var c = new THREE.Color();
            // c.setHSL( ( 0.6 - ( x * 0.5 ) ), 1.0, 0.5 );
            // return c;
            return new THREE.Color( MC_CONTEXT.entityColor() );
        };
      
        var imgDir = opts.imgDir || '/globe/';

        var Shaders = {
        'earth' : {
          uniforms: {
            'texture': { type: 't', value: null }
          },
          vertexShader: [
            'varying vec3 vNormal;',
            'varying vec2 vUv;',
            'void main() {',
              'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
              'vNormal = normalize( normalMatrix * normal );',
              'vUv = uv;',
            '}'
          ].join('\n'),
          fragmentShader: [
            'uniform sampler2D texture;',
            'varying vec3 vNormal;',
            'varying vec2 vUv;',
            'void main() {',
              'vec3 diffuse = texture2D( texture, vUv ).xyz;',
              'float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );',
              'vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity, 3.0 );',
              'gl_FragColor = vec4( diffuse + atmosphere, 1.0 );',
            '}'
          ].join('\n')
        },
        'atmosphere' : {
          uniforms: {},
          vertexShader: [
            'varying vec3 vNormal;',
            'void main() {',
              'vNormal = normalize( normalMatrix * normal );',
              'gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
            '}'
          ].join('\n'),
          fragmentShader: [
            'varying vec3 vNormal;',
            'void main() {',
              'float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );',
              'gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;',
            '}'
          ].join('\n')
        }
        };

      // var camera, scene, renderer, w, h;
      var w, h;
      var mesh, atmosphere, point;

      var overRenderer;

      var curZoomSpeed = 0;
      var zoomSpeed = 50;

      var mouse = { x: 0, y: 0 }, mouseOnDown = { x: 0, y: 0 };
      var rotation = { x: 0, y: 0 },
          target = { x: Math.PI*3/2, y: Math.PI / 6.0 },
          targetOnDown = { x: 0, y: 0 };

      var distance = 100000, distanceTarget = 100000;
      var padding = 40;
      var PI_HALF = Math.PI / 2;

      /////////////////////////////////////////////////////////////////////////
      function init() {

        if( DEBUG ) {
          console.log( 'Creating Globe...' ); 
        }

        var barSize = 3.0;

        container.style.color = '#fff';
        container.style.font = '13px/20px Arial, sans-serif';

        var shader, uniforms, material;
        w = container.offsetWidth || window.innerWidth;
        h = container.offsetHeight || window.innerHeight;

        var geometry = new THREE.BoxGeometry(barSize, barSize, 1);
        geometry.applyMatrix(new THREE.Matrix4().makeTranslation(0,0,-0.5));

        point = new THREE.Mesh(geometry);
        point.position.z = -100;

        geometry = new THREE.SphereGeometry(200, 40, 30);

        shader = Shaders['earth'];
        var uniforms = THREE.UniformsUtils.clone(shader.uniforms);
            
            uniforms['texture'].value = texture;

            material = new THREE.ShaderMaterial({
              uniforms: uniforms,
              vertexShader: shader.vertexShader,
              fragmentShader: shader.fragmentShader

            });

            mesh = new THREE.Mesh(geometry, material);
            mesh.rotation.y = Math.PI;
            group.add(mesh);

            shader = Shaders['atmosphere'];
            uniforms = THREE.UniformsUtils.clone(shader.uniforms);

            material = new THREE.ShaderMaterial({

                  uniforms: uniforms,
                  vertexShader: shader.vertexShader,
                  fragmentShader: shader.fragmentShader,
                  side: THREE.BackSide,
                  blending: THREE.AdditiveBlending,
                  transparent: true

            });

            mesh = new THREE.Mesh(geometry, material);
            mesh.scale.set( 1.1, 1.1, 1.1 );
            group.add(mesh);


        // renderer = new THREE.WebGLRenderer({antialias: true});
        // renderer.setSize(w, h);

        // renderer.domElement.style.position = 'absolute';

        // container.appendChild(renderer.domElement);

        // container.addEventListener('mousedown', onMouseDown, false);

        // container.addEventListener('mousewheel', onMouseWheel, false);

        // document.addEventListener('keydown', onDocumentKeyDown, false);

        // window.addEventListener('resize', onWindowResize, false);

        // container.addEventListener('mouseover', function() {
        //   overRenderer = true;
        // }, false);

        // container.addEventListener('mouseout', function() {
        //   overRenderer = false;
        // }, false);
      }

      function addData(data, opts) {
        var lat, lng, size, color, i, step, colorFnWrapper;

        opts.animated = opts.animated || false;
        this.is_animated = opts.animated;
        opts.format = opts.format || 'magnitude'; // other option is 'legend'
        if (opts.format === 'magnitude') {
          step = 3;
          colorFnWrapper = function(data, i) { return colorFn(data[i+2]); }
        } else if (opts.format === 'legend') {
          step = 4;
          colorFnWrapper = function(data, i) { return colorFn(data[i+3]); }
        } else {
          throw('error: format not supported: '+opts.format);
        }

        if (opts.animated) {
          if (this._baseGeometry === undefined) {
            this._baseGeometry = new THREE.Geometry();
            for (i = 0; i < data.length; i += step) {
              lat = data[i];
              lng = data[i + 1];
    //        size = data[i + 2];
              color = colorFnWrapper(data,i);
              size = 0;
              addPoint(lat, lng, size, color, this._baseGeometry);
            }
          }
          if(this._morphTargetId === undefined) {
            this._morphTargetId = 0;
          } else {
            this._morphTargetId += 1;
          }
          opts.name = opts.name || 'morphTarget'+this._morphTargetId;
        }
        var subgeo = new THREE.Geometry();
        for (i = 0; i < data.length; i += step) {
          lat = data[i];
          lng = data[i + 1];
          color = colorFnWrapper(data,i);
          size = Math.log(data[i + 2]);
          size = size*opts.sizeScale;
          addPoint(lat, lng, size, color, subgeo);
        }
        if (opts.animated) {
          this._baseGeometry.morphTargets.push({'name': opts.name, vertices: subgeo.vertices});
        } else {
          this._baseGeometry = subgeo;
        }
      };

      function createPoints() {
        if (this._baseGeometry !== undefined) {
          if (this.is_animated === false) {
            this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
                  color: 0xffffff,
                  vertexColors: THREE.FaceColors,
                  morphTargets: false
                }));
          } else {
            if (this._baseGeometry.morphTargets.length < 8) {
              console.log('t l',this._baseGeometry.morphTargets.length);
              var padding = 8-this._baseGeometry.morphTargets.length;
              console.log('padding', padding);
              for(var i=0; i<=padding; i++) {
                console.log('padding',i);
                this._baseGeometry.morphTargets.push({'name': 'morphPadding'+i, vertices: this._baseGeometry.vertices});
              }
            }
            this.points = new THREE.Mesh(this._baseGeometry, new THREE.MeshBasicMaterial({
                  color: 0xffffff,
                  vertexColors: THREE.FaceColors,
                  morphTargets: true
                }));
          }
          group.add(this.points);
        }
      }

      function addPoint(lat, lng, size, color, subgeo) {

        var phi = (90 - lat) * Math.PI / 180;
        var theta = (180 - lng) * Math.PI / 180;

        point.position.x = 200 * Math.sin(phi) * Math.cos(theta);
        point.position.y = 200 * Math.cos(phi);
        point.position.z = 200 * Math.sin(phi) * Math.sin(theta);

        point.lookAt(mesh.position);

        point.scale.z = Math.max( size, 0.1 ); // avoid non-invertible matrix
        point.updateMatrix();

        for (var i = 0; i < point.geometry.faces.length; i++) {

          point.geometry.faces[i].color = color;

        }
        if(point.matrixAutoUpdate){
          point.updateMatrix();
        }
        subgeo.merge(point.geometry, point.matrix);
      }

      function onMouseDown(event) {
        event.preventDefault();

        container.addEventListener('mousemove', onMouseMove, false);
        container.addEventListener('mouseup', onMouseUp, false);
        container.addEventListener('mouseout', onMouseOut, false);

        mouseOnDown.x = - event.clientX;
        mouseOnDown.y = event.clientY;

        targetOnDown.x = target.x;
        targetOnDown.y = target.y;

        container.style.cursor = 'move';
      }

      function onMouseMove(event) {
        mouse.x = - event.clientX;
        mouse.y = event.clientY;

        var zoomDamp = distance/1000;

        target.x = targetOnDown.x + (mouse.x - mouseOnDown.x) * 0.005 * zoomDamp;
        target.y = targetOnDown.y + (mouse.y - mouseOnDown.y) * 0.005 * zoomDamp;

        target.y = target.y > PI_HALF ? PI_HALF : target.y;
        target.y = target.y < - PI_HALF ? - PI_HALF : target.y;
      }

      function onMouseUp(event) {
        container.removeEventListener('mousemove', onMouseMove, false);
        container.removeEventListener('mouseup', onMouseUp, false);
        container.removeEventListener('mouseout', onMouseOut, false);
        container.style.cursor = 'auto';
      }

      function onMouseOut(event) {
        container.removeEventListener('mousemove', onMouseMove, false);
        container.removeEventListener('mouseup', onMouseUp, false);
        container.removeEventListener('mouseout', onMouseOut, false);
      }

      function onMouseWheel(event) {
        event.preventDefault();
        if (overRenderer) {
          zoom(event.wheelDeltaY * 0.3);
        }
        return false;
      }

      function onDocumentKeyDown(event) {
        switch (event.keyCode) {
          case 38:
            zoom(100);
            event.preventDefault();
            break;
          case 40:
            zoom(-100);
            event.preventDefault();
            break;
        }
      }


      function zoom(delta) {
        distanceTarget -= delta;
        distanceTarget = distanceTarget > 1000 ? 1000 : distanceTarget;
        distanceTarget = distanceTarget < 350 ? 350 : distanceTarget;
      }

      function changeColor( color ) {

        // for (var i = 0; i < point.geometry.faces.length; i++) {
        for (var i = 0; i < this._baseGeometry.faces.length; i++) {

          // this._baseGeometry.faces[i].color = color;
          this._baseGeometry.faces[i].color.setRGB( color.r, color.g, color.b );
        }

        // face.color.setRGB( Math.random(), Math.random(), Math.random() );
        this._baseGeometry.colorsNeedUpdate = true;
      }


      init();


      this.__defineGetter__('time', function() {
        return this._time || 0;
      });

      this.__defineSetter__('time', function(t) {
        var validMorphs = [];
        var morphDict = this.points.morphTargetDictionary;
        for(var k in morphDict) {
          if(k.indexOf('morphPadding') < 0) {
            validMorphs.push(morphDict[k]);
          }
        }

        validMorphs.sort();
        var l = validMorphs.length-1;
        var scaledt = t*l+1;
        var index = Math.floor(scaledt);
        for (i=0;i<validMorphs.length;i++) {
          this.points.morphTargetInfluences[validMorphs[i]] = 0;
        }
        var lastIndex = index - 1;
        var leftover = scaledt - index;
        if (lastIndex >= 0) {
          this.points.morphTargetInfluences[lastIndex] = 1 - leftover;
        }
        this.points.morphTargetInfluences[index] = leftover;
        this._time = t;
      });

      this.addData = addData;
      this.changeColor = changeColor;
      this.createPoints = createPoints;
      this.renderer = renderer;
      this.scene = scene;

      group.position.z = opts.zPosition;
      group.position.x = 18;
      
      if( DEBUG ) {
        console.log( 'Adding New Globe.' );
      }

      group.name = '3DGlobe';
      scene.add( group );
      group.visible = true;

      return this;
    }


    /////////////////////////////////////////////////////////////////////
    this.enter = function() {
        
        // Create Globe pulling data based on MC_CONTEXT state
        if( loadedGlobeCountry !== undefined && loadedGlobeCountry == MC_CONTEXT.country_id ) {

          // Update globe data geometry color to match current entity type
          let color = new THREE.Color( MC_CONTEXT.entityColor() );
          this.globe.changeColor( color );

          group.visible = true;
        
        } else {
          
          var object = scene.getObjectByName( '3DGlobe', true );
          scene.remove(object);

          group = new THREE.Group();
          
          addGlobe();
        }
    }


    /////////////////////////////////////////////////////////////////////
    this.exit = function() {
      
      group.visible = false;
    }


    /////////////////////////////////////////////////////////////////////
    this.init = function() {
        // no-op; enter() creates globe
    }

    const self = this;

    function addGlobe() {
        
        if(!Detector.webgl)
        {

            var globeDiv = document.getElementById("globe-container");
            globeDiv.innerHTML = "<img id=\"globe-image\" width=\"600px\" src=\"img/globe.png\" />";

            var recommendedDiv = document.getElementById("recommendedBrowsers");
            recommendedDiv.innerHTML = "Ваш браузер или видеокарта не поддерживает webGL, рекомендуется просмотр в браузерах <a href=\"http://www.google.com/chrome\">Google&nbsp;Chrome&nbsp;9.0+</a>, <a href=\"http://www.mozilla.org/ru/firefox/new/\">Mozilla&nbsp;Firefox&nbsp;4.0+</a>, <a href=\"http://www.opera.com/ru\">Opera&nbsp;13.0+</a>, <a href=\"http://windows.microsoft.com/ru-ru/internet-explorer/ie-11-worldwide-languages\">Internet&nbsp;Explorer&nbsp;11.0+</a>";
        }
        else
        {
            const globe_image = '/static/images/world_night.jpg';
            const container = document.getElementById('globe-container');
            const thinking = sceneManager.findSceneByName( "Thinking" );
            thinking.on();

            loadedGlobeCountry = MC_CONTEXT.country_id;

            // Call out to get Globe data points
            $.getJSON( `/getGlobeData/${MC_CONTEXT.country_id}`, function( data ) {
        
                if( DEBUG ) {
                    console.log( 'Globe Data:' );
                    console.log( data );
                }

                // Async Load Globe Image Texture and build on success
                const textureLoader = new THREE.TextureLoader();
                textureLoader.load( globe_image, function( texture ) {

                    // Make the Globe, passing scene, renderer, and texture
                    self.globe = new DAT.Globe( container, { 'animated': true, 'globeScale': 0.2, 'zPosition': -100 }, scene, sceneManager.renderer, texture, group );

                    // Load globe with data points
                    for ( var i = 0; i < data.length; i ++ ) {
                        self.globe.addData( data[i][1], {format: 'magnitude', name: data[i][0], 'sizeScale': 10.5} );
                    }
        
                    // Create Globe geometry
                    self.globe.createPoints();

                    thinking.off();
                });
            });
        }
    };


    /////////////////////////////////////////////////////////////////////////
    this.update = function(time) {

    	group.rotation.y += 0.002;
    }


    /////////////////////////////////////////////////////////////////////////
    this.getName = function() {
        return subscene.name;
    }
}