import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ==========================================
// 1. PENGATURAN SCENE & KAMERA
// ==========================================
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Warna langit biru cerah

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// ==========================================
// 2. PENCAHAYAAN (LIGHTING)
// ==========================================
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(20, 50, 20);
dirLight.castShadow = true;
scene.add(dirLight);

// ==========================================
// 3. PEMUATAN MODEL 3D (ASSETS)
// ==========================================
const loader = new GLTFLoader();

// A. Memuat Map/Lingkungan
loader.load('assets/models/pastacosi_factory.glb', (gltf) => {
    const map = gltf.scene;
    scene.add(map);
    console.log("Map berhasil dimuat!");
}, undefined, (error) => console.error('Gagal memuat map:', error));

// B. Membuat Grup Kendaraan Utama
// Kita membuat grup agar bodi dan ban menyatu menjadi 1 objek (Player)
const truckGroup = new THREE.Group();
truckGroup.position.set(0, 1, 0); // Posisi awal truk
scene.add(truckGroup);

// C. Memuat Bodi Truk
loader.load('assets/models/2017_equipped_chevrolet_colorado_z71_off_road.glb', (gltf) => {
    const truckBody = gltf.scene;
    truckGroup.add(truckBody);
    console.log("Bodi Truk berhasil dimuat!");
}, undefined, (error) => console.error('Gagal memuat bodi truk:', error));

// D. Memuat Ban Truk (dan menduplikasinya menjadi 4 buah)
loader.load('assets/models/3d_modeled_black_rims_and_mud_tires.glb', (gltf) => {
    const tireModel = gltf.scene;

    // CATATAN: Ubah nilai x, y, z di bawah ini untuk menyesuaikan posisi ban 
    // agar pas dengan lengkungan roda pada model Chevrolet Anda.
    const tirePositions = [
        { x: -1.2, y: 0.5, z: 2.0 },  // Depan Kiri
        { x: 1.2, y: 0.5, z: 2.0 },   // Depan Kanan
        { x: -1.2, y: 0.5, z: -1.8 }, // Belakang Kiri
        { x: 1.2, y: 0.5, z: -1.8 }   // Belakang Kanan
    ];

    tirePositions.forEach((pos) => {
        const tire = tireModel.clone(); // Menduplikasi model ban
        tire.position.set(pos.x, pos.y, pos.z);
        
        // Memutar ban sebelah kanan 180 derajat agar velg menghadap keluar (jika perlu)
        if (pos.x > 0) tire.rotation.y = Math.PI; 
        
        truckGroup.add(tire);
    });
    console.log("Ban Truk berhasil dimuat!");
}, undefined, (error) => console.error('Gagal memuat ban:', error));


// ==========================================
// 4. SISTEM KONTROL INPUT
// ==========================================
const keys = { w: false, a: false, s: false, d: false };
const speed = 0.4; // Kecepatan maju/mundur
const turnSpeed = 0.04; // Kecepatan belok

window.addEventListener('keydown', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = true;
});

window.addEventListener('keyup', (e) => {
    const key = e.key.toLowerCase();
    if (keys.hasOwnProperty(key)) keys[key] = false;
});

// ==========================================
// 5. GAME LOOP & KAMERA ANIMASI
// ==========================================
function animate() {
    requestAnimationFrame(animate);
    
    // Logika Pergerakan Kendaraan (Bergerak menggunakan sumbu Z lokal)
    // Catatan: Jika truk bergerak mundur saat ditekan W, ubah translateZ(speed) menjadi translateZ(-speed)
    if (keys.w) truckGroup.translateZ(speed); 
    if (keys.s) truckGroup.translateZ(-speed);
    
    // Logika Berbelok (Hanya bisa belok jika sedang menekan W atau S)
    if (keys.w || keys.s) {
        // Jika mundur, arah belok dibalik sedikit agar terasa natural
        const dir = keys.s ? -1 : 1; 
        if (keys.a) truckGroup.rotation.y += turnSpeed * dir;
        if (keys.d) truckGroup.rotation.y -= turnSpeed * dir;
    }

    // Kamera mengikuti dari belakang (Third-person view)
    // Offset kamera: x=0 (tengah), y=5 (tinggi), z=-10 (di belakang truk)
    const relativeCameraOffset = new THREE.Vector3(0, 5, -10);
    const cameraOffset = relativeCameraOffset.applyMatrix4(truckGroup.matrixWorld);
    
    // Lerp membuat pergerakan kamera lebih halus
    camera.position.lerp(cameraOffset, 0.1);
    camera.lookAt(truckGroup.position);
    
    renderer.render(scene, camera);
}

// Menjalankan Game Loop
animate();

// ==========================================
// 6. RESIZE HANDLER (Jika ukuran layar berubah)
// ==========================================
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
