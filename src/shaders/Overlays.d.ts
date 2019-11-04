import {
	Uniform
} from '../../../src/Three';

export const Overlays: {
	uniforms: {
		tDiffuse: Uniform;
		opacity: Uniform;
	};
	vertexShader: string;
	fragmentShader: string;
};
