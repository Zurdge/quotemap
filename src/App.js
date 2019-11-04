import React from 'react';
import Overlay from './Overlay';
import Style from './App.module.css';
import * as THREE from 'three';
import {CSS3DRenderer, CSS3DObject} from "three/examples/jsm/renderers/CSS3DRenderer";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js';
import { BloomPass } from 'three/examples/jsm/postprocessing/BloomPass.js';
import { UnrealBloomPass } from './shaders/UnrealBloomPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js';

import {OverlayPass} from './shaders/OverlayPass'

import {Overlays} from './shaders/Overlays'

import {data} from './data.js';
import TWEEN from '@tweenjs/tween.js';

THREE.Color.prototype.getBrightness = function() {
  // https://www.w3.org/TR/AERT#color-contrast
  return 0.299 * this.r + 0.587 * this.g + 0.114 * this.b
}
Number.prototype.clamp = function(min, max) { return Math.min(Math.max(this, min), max) }

var camera, controls, scene, renderer, composer;
var geometry, material, mesh;

var cont, linePositions, lineColors, blending, linesMesh, points, raycaster;
var mouse;
var _options = {
  color: new THREE.Color(0.45,1,1),
  backgroundColor: 0x23153c,
  points: 30,
  maxDistance: 20,
  spacing: 15,
  showDots: true
}

raycaster = new THREE.Raycaster();
mouse = new THREE.Vector2();

function _onMouseDown(event){
  try{
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( mouse, camera );
    var intersects = raycaster.intersectObjects( scene.children, true  );

    lerpTo(intersects[0].object)
    var event = new Event('QuoteMe');
    event.quote = intersects[0].object.quote;
    window.dispatchEvent(event);
  }catch(e){
    console.log(e)
  }
}
function lerpTo(object){
  controls.enabled = false;
  var offset = 50;
  var distance = 50;
  const tween = new TWEEN.Tween(controls.target)
    .to(new THREE.Vector3(object.position.x+(Math.random()*0.5),object.position.y+(Math.random()*0.5),object.position.z+(Math.random()*0.5)), 2000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
    })
    .onComplete(()=>{
      controls.enabled = true;

        controls.update();
    });
  tween.start();

  const tween2 = new TWEEN.Tween(camera.position)
    .to(new THREE.Vector3(-(offset/2)+object.position.x+(Math.random()*offset),object.position.y+distance,-(offset/2)+object.position.z+(Math.random()*offset)), 2000)
    .easing(TWEEN.Easing.Quadratic.Out)
    .onUpdate(() => {
    })
    .onComplete(()=>{
        controls.update();
    });
  tween2.start();
}
init();
onInit();
animate();
//addCube();
updateLines();
init_Quotes();
setupPostprocessing();
function setupPostprocessing(){

}
function init_Quotes(){
  var quote = 0;
  for(var i in scene.children[0].children){
    var child = scene.children[0].children[i]
    child.quote = data[quote];
    if(quote < data.length){
      quote += 1;
    }else{
      quote = 0;
    }
  }
}
function init() {
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 750 );
    camera.position.y = 100;
    camera.lookAt(new THREE.Vector3(0,0,0));
    scene = new THREE.Scene();
    const color = new THREE.Color(0,0,0);  // white
    const near = 15;
    const far = 200;
    scene.fog = new THREE.Fog(color, near, far);
    renderer = new THREE.WebGLRenderer({antialias:true});
    renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.exposure = 1.5;
    renderer.autoClear = false;
    document.body.appendChild( renderer.domElement );
    renderer.domElement .addEventListener('mousedown',(e)=>{
      _onMouseDown(e)
    },false)
    renderer.domElement.addEventListener('touchstart',(e)=>{
      _onMouseDown(e.touches[0])
      console.log(e)
    },false);

    controls = new OrbitControls( camera, renderer.domElement );
    controls.enablePan = false;
		controls.enableZoom = true;
    controls.minDistance = 40;
    controls.maxDistance = 160;
		controls.enableDamping = true;
		controls.minPolarAngle = 0.025;
		controls.maxPolarAngle = 1.3;
		controls.dampingFactor = 0.07;
		controls.rotateSpeed = 0.3;

    var params = {
			exposure: 1,
			bloomStrength: 2,
			bloomThreshold: 0,
			bloomRadius: 0.25
		};
    composer = new EffectComposer(renderer);
    composer.setSize(window.innerWidth, window.innerHeight);
    composer.addPass(new RenderPass(scene, camera));

    var bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
		bloomPass.threshold = params.bloomThreshold;
		bloomPass.strength = params.bloomStrength;
		bloomPass.radius = params.bloomRadius;
    //bloomPass.renderToScreen = true;
    composer.addPass(bloomPass);

    var cloud = new THREE.TextureLoader().load( require('./clouds.jpg') );
    cloud.wrapS = cloud.wrapT = THREE.RepeatWrapping;
    var overlays = new OverlayPass(Overlays, cloud);
    composer.addPass(overlays)


}
function animate(time) {
    TWEEN.update(time);
    controls.update();
    requestAnimationFrame( animate );
    composer.render( scene, camera );
}

function genPoint(x, y, z) {
  let sphere;
  if (!points) { points = []; }

  if (_options.showDots) {
    const geometry = new THREE.SphereGeometry( (0.25 + Math.random()), 5, 5 ); // radius, width, height
    const material = new THREE.MeshBasicMaterial({color: new THREE.Color(_options.color.r*(0.6+(Math.random()*0.4)),_options.color.g*(0.6+(Math.random()*0.4)),_options.color.b*(0.6+(Math.random()*0.4)))})
    // const material = new THREE.MeshLambertMaterial({
    //   color: _options.color});
    sphere = new THREE.Mesh( geometry, material );
  } else {
    sphere = new THREE.Object3D();
  }
  cont.add( sphere );
  sphere.ox = x;
  sphere.oy = y;
  sphere.oz = z;
  sphere.position.set(x,y,z);
  sphere.r = rn(-20,20); // rotation rate
  return points.push(sphere);
}

function onInit() {
  cont = new THREE.Group()
  cont.position.set(0,0,0)
  scene.add(cont)

  let n = _options.points;
  console.log(n)
  let { spacing } = _options
  // if (mobileCheck()) {
  //   n = ~~(n * 0.75)
  //   spacing = ~~(spacing * 0.65)
  // }

  const numPoints = n * n * 2
  linePositions = new Float32Array( numPoints * numPoints * 3 )
  lineColors = new Float32Array( numPoints * numPoints * 3 )

  const colorB = (new THREE.Color(_options.color)).getBrightness();
  const bgB = (new THREE.Color(_options.backgroundColor)).getBrightness();
  blending =  colorB > bgB ? 'additive' : 'subtractive';

  const geometry = new THREE.BufferGeometry()
  geometry.addAttribute('position', new THREE.BufferAttribute(linePositions, 3).setDynamic(true))
  geometry.addAttribute('color', new THREE.BufferAttribute(lineColors, 3).setDynamic(true))
  geometry.computeBoundingSphere()
  geometry.setDrawRange( 100, 100 )
  geometry.frustumCulled = false;
  //const material = new THREE.MeshBasicMaterial({color: new THREE.Color(255,0,0)});
  const material = new THREE.MeshBasicMaterial({
    vertexColors: THREE.VertexColors,
    blending: blending === 'additive' ? THREE.AdditiveBlending : null,
    // blending: THREE.SubtractiveBlending
    transparent: true
  })
    // blending: THREE.CustomBlending
    // blendEquation: THREE.SubtractEquation
    // blendSrc: THREE.SrcAlphaFactor
    // blendDst: THREE.OneMinusSrcAlphaFactor

  linesMesh = new THREE.LineSegments( geometry, material )
  linesMesh.frustumCulled = false;
  cont.add( linesMesh )

  for (let i = 0; i<=n; i++) {
    for (let j = 0; j<=n; j++) {

      const y = ri(-3, 3)

        const x = ((i - (n/2)) * spacing) + ri(-5,5)
        let z = ((j - (n/2)) * spacing) + ri(-5,5)
        if (i % 2) { z += spacing * 0.5 } // offset
        genPoint(x, y, z)
        genPoint(x , y + ri(spacing, spacing), z + ri(-spacing,spacing))

    }
  }
}
function updateLines(){
  let vertexpos = 0
  let colorpos = 0
  let numConnected = 0
  const bgColor = new THREE.Color(_options.backgroundColor)
  const color = new THREE.Color(_options.color)
  const diffColor = color.clone().sub(bgColor)
  for (let i = 0; i < points.length; i++) {
    let dist, distToMouse
    const p = points[i]
    // p.position.y += Math.sin(@t * 0.005 - 0.02 * p.ox + 0.015 * p.oz) * 0.02


    distToMouse = 1000

    const distClamp = distToMouse.clamp(5,15)
    p.scale.x = (p.scale.y = (p.scale.z = ((15 - distClamp) * 0.25).clamp(1, 100)))

    if (p.r !== 0) {
      let ang = Math.atan2( p.position.z, p.position.x )
      dist = Math.sqrt( (p.position.z * p.position.z) + (p.position.x * p.position.x) )
      ang += 0.00025 * p.r
      p.position.x = dist * Math.cos(ang)
      p.position.z = dist * Math.sin(ang)
    }
      // p.position.x += Math.sin(@t * 0.01 + p.position.y) * 0.02
      // p.position.z += Math.sin(@t * 0.01 - p.position.y) * 0.02

    for (let j = i; j < points.length; j++) {
      const p2 = points[j]
      const dx = p.position.x - p2.position.x
      const dy = p.position.y - p2.position.y
      const dz = p.position.z - p2.position.z
      dist = Math.sqrt( (dx * dx) + (dy * dy) + (dz * dz) )
      if (dist < _options.maxDistance) {
        let lineColor
        const alpha = (( 1.0 - (dist / _options.maxDistance) ) * 2).clamp(0, 1)
        if (blending === 'additive') {
          lineColor = new THREE.Color(0x000000).lerp(diffColor, alpha)
        } else {
          lineColor = bgColor.clone().lerp(color, alpha)
        }
        // if @blending == 'subtractive'
        //   lineColor = new THREE.Color(0x000000).lerp(diffColor, alpha)

        linePositions[ vertexpos++ ] = p.position.x
        linePositions[ vertexpos++ ] = p.position.y
        linePositions[ vertexpos++ ] = p.position.z
        linePositions[ vertexpos++ ] = p2.position.x
        linePositions[ vertexpos++ ] = p2.position.y
        linePositions[ vertexpos++ ] = p2.position.z

        lineColors[ colorpos++ ] = lineColor.r
        lineColors[ colorpos++ ] = lineColor.g
        lineColors[ colorpos++ ] = lineColor.b
        lineColors[ colorpos++ ] = lineColor.r
        lineColors[ colorpos++ ] = lineColor.g
        lineColors[ colorpos++ ] = lineColor.b

        numConnected++
      }
    }
  }
  linesMesh.geometry.setDrawRange( 0, numConnected * 2 )
  linesMesh.geometry.attributes.position.needsUpdate = true
  linesMesh.geometry.attributes.color.needsUpdate = true
  // @pointCloud.geometry.attributes.position.needsUpdate = true
}
function ri(start,end) {
  if (start == null) start = 0
  if (end == null) end = 1
  return Math.floor(start + (Math.random() * ((end - start) + 1)))
}
function rn(start,end) {
  if (start == null) start = 0
  if (end == null) end = 1
  return start + (Math.random() * (end - start))
}
function listAuthors(){
  var authors = [];
  for(var i in data){
    if(authors.length > 15){
      break;
    }
    authors.push(data[i]);
  }
  console.log(authors)
}
function App() {
  listAuthors();
  return (
    <div className={Style.container} id='three'>
      <Overlay/>
    </div>
  );
}

export default App;
