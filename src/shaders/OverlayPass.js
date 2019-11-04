/**
 * @author alteredq / http://alteredqualia.com/
 */

import {
	ShaderMaterial,
	UniformsUtils
} from "three/build/three.module.js";
import { Pass } from "three/examples/jsm/postprocessing/Pass.js";

var OverlayPass = function ( shader, clouds ,textureID ) {

	Pass.call( this );

	this.textureID = ( textureID !== undefined ) ? textureID : "tDiffuse";
	this.clouds = clouds;
	if ( shader instanceof ShaderMaterial ) {

		this.uniforms = shader.uniforms;

		this.material = shader;

	} else if ( shader ) {

		this.uniforms = UniformsUtils.clone( shader.uniforms );
		this.uniforms.tClouds.value = clouds
		console.log(this.uniforms)

		this.material = new ShaderMaterial( {

			defines: Object.assign( {}, shader.defines ),
			uniforms: this.uniforms,
			vertexShader: shader.vertexShader,
			fragmentShader: shader.fragmentShader

		} );

	}
	this.frame = 0;
	this.updateUniforms = ()=>{
		this.frame += 0.001;
		this.material.uniforms.offsetx.value =  this.frame//Math.cos(this.frame);
		this.material.uniforms.offsety.value =  this.frame*0.9//Math.cos(this.frame)*0.9;
	}
	this.fsQuad = new Pass.FullScreenQuad( this.material );

};

OverlayPass.prototype = Object.assign( Object.create( Pass.prototype ), {

	constructor: OverlayPass,

	render: function ( renderer, writeBuffer, readBuffer /*, deltaTime, maskActive */ ) {
		this.updateUniforms();
		if ( this.uniforms[ this.textureID ] ) {

			this.uniforms[ this.textureID ].value = readBuffer.texture;

		}

		this.fsQuad.material = this.material;

		if ( this.renderToScreen ) {

			renderer.setRenderTarget( null );
			this.fsQuad.render( renderer );

		} else {

			renderer.setRenderTarget( writeBuffer );
			// TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600
			if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
			this.fsQuad.render( renderer );

		}

	}

} );

export { OverlayPass };
