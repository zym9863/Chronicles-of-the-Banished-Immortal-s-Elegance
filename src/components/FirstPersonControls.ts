import * as THREE from 'three';

/**
 * 第一人称控制器
 */
export class FirstPersonControls {
  private camera: THREE.PerspectiveCamera;
  private canvas: HTMLCanvasElement;
  
  // 移动相关
  private moveSpeed: number = 10;
  private keys: { [key: string]: boolean } = {};
  private velocity: THREE.Vector3 = new THREE.Vector3();
  
  // 鼠标控制相关
  private mouseSensitivity: number = 0.002;
  private isLocked: boolean = false;
  private euler: THREE.Euler = new THREE.Euler(0, 0, 0, 'YXZ');
  
  // 约束
  private minPolarAngle: number = 0; // 最小俯仰角
  private maxPolarAngle: number = Math.PI; // 最大俯仰角
  
  // 碰撞检测
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private collisionObjects: THREE.Object3D[] = [];

  constructor(camera: THREE.PerspectiveCamera, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.canvas = canvas;
    
    this.setupEventListeners();
    this.setupPointerLock();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    // 键盘事件
    document.addEventListener('keydown', this.onKeyDown.bind(this));
    document.addEventListener('keyup', this.onKeyUp.bind(this));
    
    // 鼠标事件
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    
    // 点击画布锁定鼠标
    this.canvas.addEventListener('click', () => {
      this.canvas.requestPointerLock();
    });
  }

  /**
   * 设置指针锁定
   */
  private setupPointerLock(): void {
    const onPointerLockChange = () => {
      this.isLocked = document.pointerLockElement === this.canvas;
      
      // 显示/隐藏准星
      const crosshair = document.getElementById('crosshair');
      if (crosshair) {
        crosshair.style.display = this.isLocked ? 'block' : 'none';
      }
      
      // 显示/隐藏控制提示
      const controlsInfo = document.getElementById('controls-info');
      if (controlsInfo) {
        controlsInfo.style.display = this.isLocked ? 'block' : 'none';
      }
    };

    document.addEventListener('pointerlockchange', onPointerLockChange);
    document.addEventListener('pointerlockerror', () => {
      console.error('Pointer lock failed');
    });
  }

  /**
   * 键盘按下事件
   */
  private onKeyDown(event: KeyboardEvent): void {
    if (!this.isLocked) return;
    
    this.keys[event.code] = true;
    
    // 阻止默认行为
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'Space'].includes(event.code)) {
      event.preventDefault();
    }
  }

  /**
   * 键盘释放事件
   */
  private onKeyUp(event: KeyboardEvent): void {
    this.keys[event.code] = false;
  }

  /**
   * 鼠标移动事件
   */
  private onMouseMove(event: MouseEvent): void {
    if (!this.isLocked) return;

    const movementX = event.movementX || 0;
    const movementY = event.movementY || 0;

    this.euler.setFromQuaternion(this.camera.quaternion);

    this.euler.y -= movementX * this.mouseSensitivity;
    this.euler.x -= movementY * this.mouseSensitivity;

    // 限制俯仰角度
    this.euler.x = Math.max(
      this.minPolarAngle - Math.PI / 2,
      Math.min(this.maxPolarAngle - Math.PI / 2, this.euler.x)
    );

    this.camera.quaternion.setFromEuler(this.euler);
  }

  /**
   * 更新控制器
   */
  public update(deltaTime: number): void {
    if (!this.isLocked) return;

    // 重置速度
    this.velocity.set(0, 0, 0);

    // 获取相机方向
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    
    // 计算右方向
    const right = new THREE.Vector3();
    right.crossVectors(direction, this.camera.up).normalize();

    // 处理移动输入
    if (this.keys['KeyW']) {
      this.velocity.add(direction);
    }
    if (this.keys['KeyS']) {
      this.velocity.sub(direction);
    }
    if (this.keys['KeyA']) {
      this.velocity.sub(right);
    }
    if (this.keys['KeyD']) {
      this.velocity.add(right);
    }

    // 标准化速度向量并应用移动速度
    if (this.velocity.length() > 0) {
      this.velocity.normalize();
      this.velocity.multiplyScalar(this.moveSpeed * deltaTime);
      
      // 应用碰撞检测
      const newPosition = this.camera.position.clone().add(this.velocity);
      
      if (!this.checkCollision(newPosition)) {
        this.camera.position.copy(newPosition);
      }
    }
  }

  /**
   * 碰撞检测
   */
  private checkCollision(newPosition: THREE.Vector3): boolean {
    if (this.collisionObjects.length === 0) return false;

    // 设置射线起点为新位置
    this.raycaster.set(newPosition, this.velocity.clone().normalize());
    
    // 检测碰撞
    const intersections = this.raycaster.intersectObjects(this.collisionObjects, true);
    
    // 如果有交点且距离很近，则发生碰撞
    return intersections.length > 0 && intersections[0].distance < 1.0;
  }

  /**
   * 添加碰撞对象
   */
  public addCollisionObject(object: THREE.Object3D): void {
    this.collisionObjects.push(object);
  }

  /**
   * 移除碰撞对象
   */
  public removeCollisionObject(object: THREE.Object3D): void {
    const index = this.collisionObjects.indexOf(object);
    if (index > -1) {
      this.collisionObjects.splice(index, 1);
    }
  }

  /**
   * 设置移动速度
   */
  public setMoveSpeed(speed: number): void {
    this.moveSpeed = speed;
  }

  /**
   * 设置鼠标灵敏度
   */
  public setMouseSensitivity(sensitivity: number): void {
    this.mouseSensitivity = sensitivity;
  }

  /**
   * 设置相机位置
   */
  public setPosition(x: number, y: number, z: number): void {
    this.camera.position.set(x, y, z);
  }

  /**
   * 设置相机朝向
   */
  public lookAt(x: number, y: number, z: number): void {
    this.camera.lookAt(x, y, z);
    this.euler.setFromQuaternion(this.camera.quaternion);
  }

  /**
   * 获取相机位置
   */
  public getPosition(): THREE.Vector3 {
    return this.camera.position.clone();
  }

  /**
   * 获取相机方向
   */
  public getDirection(): THREE.Vector3 {
    const direction = new THREE.Vector3();
    this.camera.getWorldDirection(direction);
    return direction;
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    document.removeEventListener('keydown', this.onKeyDown.bind(this));
    document.removeEventListener('keyup', this.onKeyUp.bind(this));
    document.removeEventListener('mousemove', this.onMouseMove.bind(this));
  }
}
