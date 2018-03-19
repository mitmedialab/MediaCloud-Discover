
Perlin Noise in Three.js


<script src='https://cdn.rawgit.com/josephg/noisejs/master/perlin.js'></script>

noise.seed(Math.random());
noise.simplex2( (i+800)/6.25,j/6.25 ) * Math.pow(ex,4);
