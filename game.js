import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// 1. Scene Setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Bright cartoon sky

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 2. Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(10, 20, 10);
dirLight.castShadow = true;
scene.add(dirLight);

// 3. Environment (Driving Track Placeholder)
const groundGeo = new THREE.PlaneGeometry(100, 1000);
const groundMat = new THREE.MeshStandardMaterial({ color: 0x7cfc00 }); // Lawn green
const ground = new THREE.Mesh(groundGeo, groundMat);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// 4. Truck Placeholder (Until truck.glb is loaded)
const truckGeo = new THREE.BoxGeometry(2, 1.5, 4);
const truckMat = new THREE.MeshStandardMaterial({ color: 0xff1493 }); // Deep pink
const truck = new THREE.Mesh(truckGeo, truckMat);
truck.position.y = 1;
truck.castShadow = true;
scene.add(truck);

// 5. Game Loop
function animate() {
    requestAnimationFrame(animate);
    
    // Basic camera follow logic will go here
    camera.lookAt(truck.position);
    
    renderer.render(scene, camera);
}
animate();

// 6. Resize Handler
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
