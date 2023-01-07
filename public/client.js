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

const controls = new OrbitControls (camera, renderer.domElement)


// GLOBE ITSELF:
const geometry = new THREE.SphereGeometry(5, 50, 50);
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
  
  // const point1 = new THREE.Mesh(
  //   new THREE.SphereBufferGeometry(0.1, 50, 50),
  //   new THREE.MeshBasicMaterial({color:0xff0000})
  // )
  
  // point1.position.set(5.2, 0, 0)
  // scene.add(point1)
  
  // const point2 = new THREE.Mesh(
  //   new THREE.SphereBufferGeometry(0.1, 50, 50),
  //   new THREE.MeshBasicMaterial({color:0x00ff00})
  // )
  
  // point2.position.set(0, 5.2, 0)
  // scene.add(point2)
  
  // const point3 = new THREE.Mesh(
  //   new THREE.SphereBufferGeometry(0.1, 50, 50),
  //   new THREE.MeshBasicMaterial({color:0x0000ff})
  // )
  
  // point3.position.set(0, 0, 5.2)
  // scene.add(point3)
  
  
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
  // group.add(point1)
  // group.add(point2)
  // group.add(point3)
  group.add(pointTest)
  
  
  //not including id, after points are posted to database, mongoose will automatically assign ID
  const coordinates = [[5.2, 0, 0], [0, 5.2, 0], [0, 0, 5.2]]

  async function addPoints() {
    for (let i = 0; i < coordinates.length; i++) {
      await fetch('http://127.0.0.1:3000/points', {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          "coordinateX": coordinates[i][0],
          "coordinateY": coordinates[i][1],
          "coordinateZ": coordinates[i][2]
        })
        })
    }

  }

  //this dbCoordinates array will contain the id of points fetched from database
  var dbCoordinates = []
  async function getPoints() {
    dbCoordinates = []
    await fetch('http://127.0.0.1:3000/points', {
      method: 'GET',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
      })
      .then((response) => response.json())
      .then((data) => {
        data.forEach(point => {
          dbCoordinates.push([[point.coordinateX, point.coordinateY, point.coordinateZ], point._id])
        })

      })

  }
  var pointMeshs = []
  async function displayPoints() {
    await getPoints()
    for (let i = 0; i < dbCoordinates.length; i++) {
      var newPoint = new THREE.Mesh(
        new THREE.SphereBufferGeometry(0.1, 50, 50),
        new THREE.MeshBasicMaterial({color:0xffffff})
      )
      newPoint.userData.id = dbCoordinates[i][1]
      newPoint.position.set(dbCoordinates[i][0][0], dbCoordinates[i][0][1], dbCoordinates[i][0][2])
      newPoint.geometry.attributes.position.needsUpdate = true;
      pointMeshs.push(newPoint)
      group.add(newPoint)

    }
  }

  function getAndDisplayPoints() {
    displayPoints()
  }

  async function deletePoints() {
    await fetch('http://127.0.0.1:3000/points', {
      method: 'DELETE',
      headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
      }
      })

  }

  document.getElementById("populateButton").addEventListener('click', addPoints)
  document.getElementById("displayButton").addEventListener('click', getAndDisplayPoints)
  document.getElementById("clearButton").addEventListener('click', deletePoints)

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
  })
  
  addEventListener('mouseup', () => {
    moving = false
    // console.log(moving)
  })

  var raycaster = new THREE.Raycaster()
  async function onMouseClick() {

    var idOfClicked, clickedPoint = false
    raycaster.setFromCamera(mouse, camera)
    for (let i = 0; i < pointMeshs.length; i++) {
      if ((raycaster.intersectObject(pointMeshs[i], true)).length > 0) {
        idOfClicked = pointMeshs[i].userData.id
        clickedPoint = true
        console.log("clicked")
        break
      }
    }

    if (clickedPoint) {
      var pointData = []
      await fetch('http://127.0.0.1:3000/points/' + idOfClicked, {
        method: 'GET',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        })
        .then((response) => response.json())
        .then((data) => {
          pointData.push([data.coordinateX, data.coordinateY, data.coordinateZ])
        })
        
        console.log(pointData)
    }
  
  }

  window.addEventListener('click', onMouseClick, false)
  
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

