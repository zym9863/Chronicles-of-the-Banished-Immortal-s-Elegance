import * as THREE from 'three';

/**
 * 场景管理器 - 负责管理Three.js的核心组件
 */
export class SceneManager {
  public scene!: THREE.Scene;
  public camera!: THREE.PerspectiveCamera;
  public renderer!: THREE.WebGLRenderer;
  public canvas: HTMLCanvasElement;
  
  // 光照系统
  private ambientLight!: THREE.AmbientLight;
  private directionalLight!: THREE.DirectionalLight;
  private pointLights: THREE.PointLight[] = [];
  
  // 渲染循环
  private animationId: number | null = null;
  private clock: THREE.Clock;
  
  // 事件回调
  private updateCallbacks: (() => void)[] = [];
  private resizeCallbacks: (() => void)[] = [];

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.clock = new THREE.Clock();
    
    this.initScene();
    this.initCamera();
    this.initRenderer();
    this.initLights();
    this.setupEventListeners();
    
    console.log('SceneManager initialized');
  }

  /**
   * 初始化场景
   */
  private initScene(): void {
    this.scene = new THREE.Scene();
    
    // 设置场景背景 - 古风天空渐变
    this.scene.background = new THREE.Color(0x87CEEB); // 天蓝色
    
    // 添加雾效果，营造远山如黛的意境
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
  }

  /**
   * 初始化相机
   */
  private initCamera(): void {
    const aspect = this.canvas.clientWidth / this.canvas.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
    
    // 设置初始相机位置 - 在长安城的高楼上
    this.camera.position.set(0, 10, 20);
    this.camera.lookAt(0, 0, 0);
  }

  /**
   * 初始化渲染器
   */
  private initRenderer(): void {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: false
    });
    
    this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // 启用阴影
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // 设置色调映射，增强视觉效果
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
  }

  /**
   * 初始化光照系统
   */
  private initLights(): void {
    // 环境光 - 模拟天空散射光
    this.ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    this.scene.add(this.ambientLight);
    
    // 主方向光 - 模拟太阳光
    this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    this.directionalLight.position.set(50, 100, 50);
    this.directionalLight.castShadow = true;
    
    // 配置阴影
    this.directionalLight.shadow.mapSize.width = 2048;
    this.directionalLight.shadow.mapSize.height = 2048;
    this.directionalLight.shadow.camera.near = 0.5;
    this.directionalLight.shadow.camera.far = 500;
    this.directionalLight.shadow.camera.left = -100;
    this.directionalLight.shadow.camera.right = 100;
    this.directionalLight.shadow.camera.top = 100;
    this.directionalLight.shadow.camera.bottom = -100;
    
    this.scene.add(this.directionalLight);
    
    // 添加一些点光源，模拟灯笼等古风光源
    this.addPointLight(new THREE.Vector3(-10, 5, -10), 0xff6b35, 2, 20);
    this.addPointLight(new THREE.Vector3(10, 5, -10), 0xff6b35, 2, 20);
  }

  /**
   * 添加点光源
   */
  public addPointLight(position: THREE.Vector3, color: number, intensity: number, distance: number): THREE.PointLight {
    const light = new THREE.PointLight(color, intensity, distance);
    light.position.copy(position);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;
    light.shadow.mapSize.height = 512;
    
    this.pointLights.push(light);
    this.scene.add(light);
    
    return light;
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  /**
   * 窗口大小改变处理
   */
  private onWindowResize(): void {
    const width = this.canvas.clientWidth;
    const height = this.canvas.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
    
    // 调用所有注册的resize回调
    this.resizeCallbacks.forEach(callback => callback());
  }

  /**
   * 添加更新回调
   */
  public addUpdateCallback(callback: () => void): void {
    this.updateCallbacks.push(callback);
  }

  /**
   * 添加resize回调
   */
  public addResizeCallback(callback: () => void): void {
    this.resizeCallbacks.push(callback);
  }

  /**
   * 开始渲染循环
   */
  public startRenderLoop(): void {
    if (this.animationId !== null) {
      return; // 已经在运行
    }
    
    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      // 调用所有更新回调
      this.updateCallbacks.forEach(callback => callback());
      
      // 渲染场景
      this.renderer.render(this.scene, this.camera);
    };
    
    animate();
  }

  /**
   * 停止渲染循环
   */
  public stopRenderLoop(): void {
    if (this.animationId !== null) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * 获取当前时间
   */
  public getElapsedTime(): number {
    return this.clock.getElapsedTime();
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    this.stopRenderLoop();
    
    // 清理几何体和材质
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
    });
    
    // 清理渲染器
    this.renderer.dispose();
    
    // 移除事件监听器
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    console.log('SceneManager disposed');
  }
}
