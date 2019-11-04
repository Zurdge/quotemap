/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Full-screen textured quad shader
 */



var Overlays = {
	uniforms: {
    "offsetx": {value:null},
    "offsety": {value:null},
    "tClouds": { value: null },
		"tDiffuse": { value: null },
		"opacity": { value: 1.0 }

	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"	vUv = uv;",
		"	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",
    "uniform float offsetx;",
    "uniform float offsety;",

		"uniform sampler2D tDiffuse;",
    "uniform sampler2D tClouds;",

		"varying vec2 vUv;",

		"void main() {",

		"	vec4 texel = texture2D( tDiffuse, vUv );",
    "	vec4 c = texture2D( tClouds, vUv+(vec2(offsetx,offsety)) );",
    "	vec4 c_2 = texture2D( tClouds, vUv+(vec2(-offsetx,-offsety)) );",
    "	vec4 hole = texture2D( tClouds, vUv );",
    " vec4 clouds = c * c_2;",
    " clouds = clouds+clouds;",
    "	gl_FragColor = (texel * ((vec4(clouds.r,clouds.r,clouds.r,1.0)) * (vec4(clouds.g,clouds.g,clouds.g,1.0))+hole.b))*2.0;",
		//"	gl_FragColor = opacity * texel * vec4(clouds.r,clouds.r,clouds.r,1.0);",

		"}"

	].join( "\n" )
};
export { Overlays };
