<template>
  <div ref="containerRef" class="w-full h-full"></div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useThemeStore } from '@/store/modules/theme';

const emit = defineEmits<{
  loaded: [];
  'update:tooltip': [data: { visible: boolean; text: string; left: string; top: string }];
}>();

const themeStore = useThemeStore();
const containerRef = ref<HTMLDivElement>();
const loading = ref(true);

let scene: THREE.Scene;
let camera: THREE.PerspectiveCamera;
let renderer: THREE.WebGLRenderer;
let orbitControls: OrbitControls;
let raycaster: THREE.Raycaster;
let mouse: THREE.Vector2;
let carModel: THREE.Group | null = null;
let groundMesh: THREE.Mesh | null = null;
const meshList: THREE.Mesh[] = [];
let highlightedMesh: THREE.Mesh | null = null;
let originalMaterial: THREE.Material | THREE.Material[] | null = null;

const LIGHT_COLORS = {
  scene: 0xe6f0fa,
  ground: 0xd4e5f7
};

const DARK_COLORS = {
  scene: 0x0d1b2a,
  ground: 0x6f8a9f
};

function updateSceneColors(isDark: boolean) {
  if (!scene) return;

  const colors = isDark ? DARK_COLORS : LIGHT_COLORS;
  scene.background = new THREE.Color(colors.scene);

  if (groundMesh) {
    (groundMesh.material as THREE.MeshStandardMaterial).color.setHex(colors.ground);
  }
}

function initThree() {
  if (!containerRef.value) return;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(themeStore.darkMode ? DARK_COLORS.scene : LIGHT_COLORS.scene);

  const aspect = containerRef.value.clientWidth / containerRef.value.clientHeight;
  camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
  camera.position.set(4, 3, 4);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;
  containerRef.value.appendChild(renderer.domElement);

  orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDamping = true;
  orbitControls.dampingFactor = 0.05;
  orbitControls.minDistance = 2;
  orbitControls.maxDistance = 15;
  orbitControls.target.set(0, 0, 0);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  addLights();
  addGround();
  loadCarModel();

  animate();
}

function addLights() {
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(10, 15, 10);
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.1;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -10;
  directionalLight.shadow.camera.right = 10;
  directionalLight.shadow.camera.top = 10;
  directionalLight.shadow.camera.bottom = -10;
  scene.add(directionalLight);

  const directionalLight2 = new THREE.DirectionalLight(0x4a90d9, 0.6);
  directionalLight2.position.set(-5, 10, -5);
  scene.add(directionalLight2);

  const pointLight = new THREE.PointLight(0x1890ff, 0.5, 20);
  pointLight.position.set(0, 5, 0);
  scene.add(pointLight);
}

function addGround() {
  const groundGeometry = new THREE.PlaneGeometry(30, 30);
  const groundMaterial = new THREE.MeshStandardMaterial({
    color: themeStore.darkMode ? DARK_COLORS.ground : LIGHT_COLORS.ground,
    roughness: 0.8,
    metalness: 0.1
  });
  groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
  groundMesh.rotation.x = -Math.PI / 2;
  groundMesh.position.y = -0.01;
  groundMesh.receiveShadow = true;
  scene.add(groundMesh);
}

function loadCarModel() {
  const loader = new GLTFLoader();

  loader.load(
    '/model/su7.glb',
    gltf => {
      carModel = gltf.scene;

      const box = new THREE.Box3().setFromObject(carModel);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 5 / maxDim;
      carModel.scale.setScalar(scale);

      carModel.position.x = -center.x * scale;
      carModel.position.y = -box.min.y * scale;
      carModel.position.z = -center.z * scale;

      carModel.traverse(child => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;

          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material.forEach(mat => {
                mat.side = 0;
              });
            } else {
              child.material.side = 0;
            }
          }

          const meshName = child.name || `部件_${meshList.length + 1}`;

          child.userData = {
            name: meshName,
            isPart: true
          };

          meshList.push(child);
        }
      });

      scene.add(carModel);

      setupInteraction();

      loading.value = false;
      emit('loaded');
    },
    undefined,
    error => {
      console.error('模型加载失败:', error);
      loading.value = false;
    }
  );
}

function setupInteraction() {
  const onMouseMove = (event: MouseEvent) => {
    if (!containerRef.value || meshList.length === 0) return;

    const rect = containerRef.value.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(meshList);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      emit('update:tooltip', {
        visible: true,
        text: obj.userData.name || '未知部件',
        left: `${event.clientX + 15}px`,
        top: `${event.clientY + 15}px`
      });
      document.body.style.cursor = 'pointer';
    } else {
      emit('update:tooltip', {
        visible: false,
        text: '',
        left: '0px',
        top: '0px'
      });
      document.body.style.cursor = 'default';
    }
  };

  const onClick = (event: MouseEvent) => {
    if (!containerRef.value || meshList.length === 0) return;

    const rect = containerRef.value.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(meshList);

    if (intersects.length > 0) {
      const obj = intersects[0].object;
      if (obj instanceof THREE.Mesh) {
        highlightPart(obj);
      }
    }
  };

  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('click', onClick);
}

function highlightPart(mesh: THREE.Mesh) {
  if (highlightedMesh && highlightedMesh !== mesh) {
    if (originalMaterial) {
      highlightedMesh.material = originalMaterial;
    }
  }

  if (highlightedMesh !== mesh) {
    originalMaterial = mesh.material;
    const highlightMaterial = new THREE.MeshStandardMaterial({
      color: 0x1890ff,
      emissive: 0x1890ff,
      emissiveIntensity: 0.2,
      metalness: 0.5,
      roughness: 0.3,
      transparent: true,
      opacity: 0.9
    });
    mesh.material = highlightMaterial;
    highlightedMesh = mesh;
  }
}

function animateCameraTo(targetPosition: { x: number; y: number; z: number }, duration: number = 1200) {
  const startPosition = camera.position.clone();
  const startTarget = orbitControls.target.clone();
  const endTarget = new THREE.Vector3(0, 0, 0);
  const startTime = Date.now();

  function updateCamera() {
    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const easeProgress = 1 - (1 - progress) ** 3;

    camera.position.lerpVectors(startPosition, new THREE.Vector3(targetPosition.x, targetPosition.y, targetPosition.z), easeProgress);

    orbitControls.target.lerpVectors(startTarget, endTarget, easeProgress);

    if (progress < 1) {
      requestAnimationFrame(updateCamera);
    }
  }

  updateCamera();
}

function animate() {
  requestAnimationFrame(animate);
  orbitControls.update();
  renderer.render(scene, camera);
}

function handleResize() {
  if (!containerRef.value) return;

  const width = containerRef.value.clientWidth;
  const height = containerRef.value.clientHeight;

  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
}

watch(
  () => themeStore.darkMode,
  isDark => {
    updateSceneColors(isDark);
  }
);

onMounted(() => {
  initThree();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  renderer?.dispose();
  orbitControls?.dispose();
});

defineExpose({
  animateCameraTo,
  loading
});
</script>
