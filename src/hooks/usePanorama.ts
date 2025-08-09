import { onMounted, onUnmounted, useTemplateRef, type Ref } from 'vue';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface PointData {
  id: number;
  name: string;
  color: number;
  position: THREE.Vector3;
  mesh: THREE.Mesh;
}

const usePanorama = (id: string, imgUrl: string) => {
  const panoramaRef = useTemplateRef(id) as Ref<HTMLElement | null>;

  // 主要变量
  let scene: THREE.Scene;
  let camera: THREE.PerspectiveCamera;
  let renderer: THREE.WebGLRenderer;
  let controls: OrbitControls;
  let panoramaSphere: THREE.Mesh;
  let pointsGroup: THREE.Group;
  let isAddingPoint = false;
  let autoRotate = false;
  let points: PointData[] = [];

  // 初始化场景
  function init() {
    if (!panoramaRef.value) {
      console.error('Panorama container not found');
      return;
    }

    // 创建场景
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x222222);

    // 创建相机
    camera = new THREE.PerspectiveCamera(
      75,
      panoramaRef.value.offsetWidth / panoramaRef.value.offsetHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1);

    // 创建渲染器
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(
      panoramaRef.value.offsetWidth,
      panoramaRef.value.offsetHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    panoramaRef.value.appendChild(renderer.domElement);

    // 添加轨道控制器
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.rotateSpeed = 0.5;
    controls.minDistance = 0.1;
    controls.maxDistance = 2;

    // 创建组来存放标记点
    pointsGroup = new THREE.Group();
    scene.add(pointsGroup);

    // 加载默认全景图
    loadPanorama(imgUrl);

    // 添加窗口调整事件监听
    window.addEventListener('resize', onWindowResize, false);

    // 添加点击事件监听（用于添加点）
    renderer.domElement.addEventListener('click', onCanvasClick, false);

    // 开始动画循环
    animate();
  }

  // 加载全景图
  function loadPanorama(url: string) {
    // 如果已有全景球体，则从场景中移除
    if (panoramaSphere) {
      scene.remove(panoramaSphere);
    }

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      url,
      function (texture) {
        // 创建球体几何
        const geometry = new THREE.SphereGeometry(100, 60, 40);

        // 反转几何体，使纹理映射到内部
        geometry.scale(-1, 1, 1);

        // 创建材质
        const material = new THREE.MeshBasicMaterial({
          map: texture
        });

        // 创建球体网格
        panoramaSphere = new THREE.Mesh(geometry, material);
        scene.add(panoramaSphere);

        console.log('全景图加载成功！');
      },
      undefined,
      function (error) {
        console.error('加载全景图时出错:', error);
        console.log('加载全景图失败，请重试');
      }
    );
  }

  // 添加标记点
  function addPoint(
    position: THREE.Vector3,
    name = '标记点',
    color = 0xff0000
  ) {
    const pointId = points.length + 1;

    // 创建点几何
    const geometry = new THREE.SphereGeometry(0.5, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: color });
    const pointMesh = new THREE.Mesh(geometry, material);

    // 设置位置
    pointMesh.position.copy(position);

    // 创建线框
    const wireframe = new THREE.WireframeGeometry(geometry);
    const line = new THREE.LineSegments(wireframe);
    (line.material as THREE.LineBasicMaterial).color.set(0xffffff);
    (line.material as THREE.LineBasicMaterial).transparent = true;
    (line.material as THREE.LineBasicMaterial).opacity = 0.5;
    pointMesh.add(line);

    // 添加到场景
    pointsGroup.add(pointMesh);

    // 保存点信息
    const pointData = {
      id: pointId,
      name: name || `标记点 ${pointId}`,
      color: color,
      position: position.clone(),
      mesh: pointMesh
    };

    points.push(pointData);

    console.log(`已添加标记点: ${pointData.name}`);
    return pointData;
  }

  // 清除所有标记点
  function clearPoints() {
    while (pointsGroup.children.length > 0) {
      pointsGroup.remove(pointsGroup.children[0]);
    }
    points = [];
    console.log('已清除所有标记点');
  }

  // 动画将相机对准点
  function animateCameraToPoint(targetPosition: THREE.Vector3) {
    const startPosition = camera.position.clone();
    const startTime = Date.now();
    const duration = 1000; // 1秒

    function animate() {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // 缓动函数
      const ease = 1 - Math.pow(1 - progress, 3);

      // 插值位置
      camera.position.lerpVectors(startPosition, targetPosition, ease);

      // 更新控制器
      controls.update();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // 确保最终位置准确
        camera.position.copy(targetPosition);
      }
    }

    animate();
  }

  // 重置视角
  function resetView() {
    controls.reset();
    console.log('视角已重置');
  }

  // 切换自动旋转
  function toggleAutoRotate() {
    autoRotate = !autoRotate;
    controls.autoRotate = autoRotate;

    console.log(autoRotate ? '自动旋转已开启' : '旋转已停止');
  }

  // 设置添加点模式
  function setAddingPointMode(adding: boolean) {
    isAddingPoint = adding;
  }

  // 处理画布点击事件
  function onCanvasClick(event: MouseEvent) {
    if (!isAddingPoint || !panoramaRef.value) return;

    // 获取点击位置
    const rect = renderer.domElement.getBoundingClientRect();
    const mouse = new THREE.Vector2();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // 射线投射
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    // 检测与全景球的交点
    const intersects = raycaster.intersectObject(panoramaSphere);

    if (intersects.length > 0) {
      const point = intersects[0].point;

      // 将点位置归一化并缩放
      const scaledPoint = point.normalize().multiplyScalar(99.5);

      // 生成随机颜色
      const color = Math.floor(Math.random() * 0xffffff);

      // 添加标记点
      const pointName = prompt(
        '请输入标记点名称：',
        `标记点 ${points.length + 1}`
      );
      if (pointName !== null) {
        addPoint(scaledPoint, pointName, color);
        isAddingPoint = false; // 退出添加点模式
      }
    }
  }

  // 窗口大小调整处理
  function onWindowResize() {
    if (!panoramaRef.value) return;

    camera.aspect =
      panoramaRef.value.offsetWidth / panoramaRef.value.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(
      panoramaRef.value.offsetWidth,
      panoramaRef.value.offsetHeight
    );
  }

  // 动画循环
  function animate() {
    requestAnimationFrame(animate);

    if (autoRotate && panoramaSphere) {
      panoramaSphere.rotation.y += 0.001;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  // 清理函数
  function dispose() {
    window.removeEventListener('resize', onWindowResize, false);
    if (renderer && renderer.domElement) {
      renderer.domElement.removeEventListener('click', onCanvasClick, false);
    }

    // Dispose of Three.js objects to free memory
    if (renderer) renderer.dispose();
    if (panoramaSphere) {
      if (panoramaSphere.geometry) panoramaSphere.geometry.dispose();
      if (panoramaSphere.material) {
        if (Array.isArray(panoramaSphere.material)) {
          panoramaSphere.material.forEach((material) =>
            (material as THREE.Material).dispose()
          );
        } else {
          (panoramaSphere.material as THREE.Material).dispose();
        }
      }
    }

    points.forEach((point) => {
      if (point.mesh) {
        if (point.mesh.geometry) point.mesh.geometry.dispose();
        if (point.mesh.material) {
          if (Array.isArray(point.mesh.material)) {
            point.mesh.material.forEach((material) =>
              (material as THREE.Material).dispose()
            );
          } else {
            (point.mesh.material as THREE.Material).dispose();
          }
        }
      }
    });
  }

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    dispose();
  });

  return {
    loadPanorama,
    addPoint,
    clearPoints,
    animateCameraToPoint,
    resetView,
    toggleAutoRotate,
    setAddingPointMode,
    dispose
  };
};

export default usePanorama;
