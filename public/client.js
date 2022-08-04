import * as THREE from 'three'
import { OrbitControls } from '/jsm/controls/Orbitcontrols.js'
import { gsap } from '/gsap/index.js'
import vertexShader from './shaders/vertex.glsl.js'
import fragmentShader from './shaders/fragment.glsl.js'
import atmosphereVertexShader from './shaders/atmosphereVertex.glsl.js'
import atmosphereFragmentShader from './shaders/atmosphereFragment.glsl.js'

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, innerWidth / innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer( {
  antialias: true
});


renderer.setSize( window.innerWidth, window.innerHeight );
renderer.setPixelRatio(devicePixelRatio)
document.body.appendChild( renderer.domElement );
// GLOBE ITSELF:

const geometry = new THREE.SphereGeometry(5, 50, 50);
// const material = new THREE.MeshBasicMaterial( {
//   map: new THREE.TextureLoader().load('./imgs/uvmap.jpg')
// } );
const shaderMaterial = new THREE.ShaderMaterial({
  vertexShader,
  fragmentShader,
  uniforms: {
    globeTexture: {
      value: new THREE.TextureLoader().load('./imgs/uvmap.jpg')
    }
  }
})
const sphere = new THREE.Mesh(
  geometry, shaderMaterial 
);


// CREATE ATMOSPHERE:

const shaderMaterialAtm = new THREE.ShaderMaterial({
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide
  })
  const atmosphere = new THREE.Mesh(
    geometry, shaderMaterialAtm
  );
  
  atmosphere.scale.set(1.1, 1.1, 1.1)
  
  scene.add( atmosphere );
  
  
  // DATAPOINT TESTS FOR BLUE (0 N, 90 W), RED (0 N, 0 W), AND GREEN (90 N):
  
  const point1 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.1, 50, 50),
    new THREE.MeshBasicMaterial({color:0xff0000})
  )
  
  point1.position.set(5.2, 0, 0)
  scene.add(point1)
  
  const point2 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.1, 50, 50),
    new THREE.MeshBasicMaterial({color:0x00ff00})
  )
  
  point2.position.set(0, 5.2, 0)
  scene.add(point2)
  
  const point3 = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.1, 50, 50),
    new THREE.MeshBasicMaterial({color:0x0000ff})
  )
  
  point3.position.set(0, 0, 5.2)
  scene.add(point3)
  
  
  // DATAPOINT TEST FOR LONGITUDE AND LATITUDE (FLORIDA):
  
  const pointTest = new THREE.Mesh(
    new THREE.SphereBufferGeometry(0.1, 50, 50),
    new THREE.MeshBasicMaterial({color:0xFF69B4})
  )
  
  let ogLAT = 27.6648;
  let ogLNG = 81.5158
  
  let lat = (ogLAT) * Math.PI/180;
  let lng = (ogLNG - 73.5) * Math.PI/180;
  
  let r = 5.2
  let x = r * Math.cos(lat) * Math.cos(lng)
  let y = r * Math.cos(lat) * Math.sin(lng)
  let z = r * Math.sin(lat)
  
  pointTest.position.set(y, z, x)
  scene.add(pointTest)
  
  
  // FOR THE GLOBE ELEMENTS TO MOVE TOGETHER:
  
  const group = new THREE.Group()
  // group.add(data)
  group.add(sphere)
  group.add(point1)
  group.add(point2)
  group.add(point3)
  group.add(pointTest)
  
  
  // TRIED TO CREATE DATA POINTS WITH AN ARRAY OF X,Y,Z COORDINATES, FAILED:
  
  // const dataPoint = new THREE.SphereBufferGeometry(0.1, 50, 50);
  // const dataMaterial = new THREE.PointsMaterial({ size: 1, sizeAttenuation: true, alphaTest: 0.5})
  
  // const coordinates = [[5.2, 0, 0], [3, 3, 3]]
  // const dataPoints = []
  // coordinates.forEach(pushData)
  
  // function pushData(coordInput) {
  //   let x = coordInput[0]
  //   let y = coordInput[1]
  //   let z = coordInput[2]
  //   dataPoints.push(x, y, z);
  // }
  
  // console.log(dataPoints)
  // dataPoint.setAttribute(
  //   'position',
  //   new THREE.Float32BufferAttribute(
  //     dataPoints, 3)
  // )
  // console.log(dataPoint)
  // const data = new THREE.Points(dataPoint, dataMaterial)
  // scene.add(data)
  
  const coordinates = [[5.2, 0, 0], [3, 3, 3]]
  coordinates.push([1, 1, 1])
  
  function addPoint() {
    console.log('added')
    for (let i = 0; i < coordinates.length; i++) {
      var newPoint = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.1, 50, 50),
        new THREE.MeshBasicMaterial({color:0xffffff})
      )
    
      newPoint.position.set(coordinates[i][0], coordinates[i][1], coordinates[i][2])
      newPoint.geometry.attributes.position.needsUpdate = true;
      group.add(newPoint)
  
    }
  }
  document.getElementById("populateButton").addEventListener('click', addPoint)
  
  scene.add(group)
  
  // CREATES STARS:
  
  const starGeometry = new THREE.BufferGeometry()
  const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff
  })
  
  const starVertices = []
  for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = -(Math.random() - 0.5) * 2000
    starVertices.push(x, y, z)
  }
  
  starGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(
      starVertices, 3)
  )
  const stars = new THREE.Points(starGeometry, starMaterial)
  scene.add(stars)
  
  
  // ANIMATION STUFF:
  
  camera.position.z = 15;
  
  const mouse = {
    x: undefined,
    y: undefined
  }
  
  addEventListener('mousemove', () => {
    mouse.x = (event.clientX / innerWidth) * 2 - 1
    mouse.y = -(event.clientY / innerHeight) * 2 + 1
  })
  
  let moving = false
  
  addEventListener('mousedown', () => {
    moving = true
    // console.log(moving)
  })
  
  addEventListener('mouseup', () => {
    moving = false
    // console.log(moving)
  })
  
  function animate() {
    requestAnimationFrame( animate );
    renderer.render( scene, camera );
    group.rotation.y += 0.001
    if(moving) {
      gsap.to(group.rotation, {
        x: -mouse.y * 0.3,
        y: mouse.x * 0.5,
        duration: 2
      })
    }
  };
  
  animate();

