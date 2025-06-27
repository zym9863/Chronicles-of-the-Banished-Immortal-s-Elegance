import * as THREE from 'three';

/**
 * 交互对象接口
 */
export interface InteractableObject {
  object3d: THREE.Object3D;
  name: string;
  description: string;
  onInteract: () => void;
  onHover?: () => void;
  onHoverEnd?: () => void;
  interactionDistance: number;
}

/**
 * 交互系统
 */
export class InteractionSystem {
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private canvas: HTMLCanvasElement;
  
  private raycaster: THREE.Raycaster = new THREE.Raycaster();
  private mouse: THREE.Vector2 = new THREE.Vector2();
  
  private interactableObjects: InteractableObject[] = [];
  private currentHoveredObject: InteractableObject | null = null;
  private interactionPrompt: HTMLElement | null = null;

  constructor(camera: THREE.PerspectiveCamera, scene: THREE.Scene, canvas: HTMLCanvasElement) {
    this.camera = camera;
    this.scene = scene;
    this.canvas = canvas;
    
    this.interactionPrompt = document.getElementById('interaction-prompt');
    
    this.setupEventListeners();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    this.canvas.addEventListener('click', this.onCanvasClick.bind(this));
    this.canvas.addEventListener('mousemove', this.onCanvasMouseMove.bind(this));
  }

  /**
   * 画布点击事件
   */
  private onCanvasClick(event: MouseEvent): void {
    // 检查是否有指针锁定
    if (document.pointerLockElement !== this.canvas) return;

    // 使用屏幕中心进行射线检测
    this.mouse.set(0, 0);
    this.updateRaycaster();
    
    const intersectedObject = this.getIntersectedInteractableObject();
    if (intersectedObject) {
      intersectedObject.onInteract();
    }
  }

  /**
   * 画布鼠标移动事件
   */
  private onCanvasMouseMove(event: MouseEvent): void {
    // 检查是否有指针锁定
    if (document.pointerLockElement !== this.canvas) return;

    // 使用屏幕中心进行射线检测
    this.mouse.set(0, 0);
    this.updateRaycaster();
    
    const intersectedObject = this.getIntersectedInteractableObject();
    
    // 处理悬停状态变化
    if (intersectedObject !== this.currentHoveredObject) {
      // 结束之前的悬停
      if (this.currentHoveredObject && this.currentHoveredObject.onHoverEnd) {
        this.currentHoveredObject.onHoverEnd();
      }
      
      // 开始新的悬停
      this.currentHoveredObject = intersectedObject;
      if (this.currentHoveredObject && this.currentHoveredObject.onHover) {
        this.currentHoveredObject.onHover();
      }
      
      // 更新交互提示
      this.updateInteractionPrompt();
    }
  }

  /**
   * 更新射线投射器
   */
  private updateRaycaster(): void {
    this.raycaster.setFromCamera(this.mouse, this.camera);
  }

  /**
   * 获取相交的可交互对象
   */
  private getIntersectedInteractableObject(): InteractableObject | null {
    const intersects = this.raycaster.intersectObjects(
      this.interactableObjects.map(obj => obj.object3d),
      true
    );

    for (const intersect of intersects) {
      // 找到对应的可交互对象
      const interactableObject = this.interactableObjects.find(obj => {
        return this.isChildOf(intersect.object, obj.object3d);
      });

      if (interactableObject) {
        // 检查距离
        const distance = intersect.distance;
        if (distance <= interactableObject.interactionDistance) {
          return interactableObject;
        }
      }
    }

    return null;
  }

  /**
   * 检查对象是否是另一个对象的子对象
   */
  private isChildOf(child: THREE.Object3D, parent: THREE.Object3D): boolean {
    if (child === parent) return true;
    
    let current = child.parent;
    while (current) {
      if (current === parent) return true;
      current = current.parent;
    }
    
    return false;
  }

  /**
   * 更新交互提示
   */
  private updateInteractionPrompt(): void {
    if (!this.interactionPrompt) return;

    if (this.currentHoveredObject) {
      this.interactionPrompt.textContent = `点击交互: ${this.currentHoveredObject.description}`;
      this.interactionPrompt.classList.add('visible');
    } else {
      this.interactionPrompt.classList.remove('visible');
    }
  }

  /**
   * 添加可交互对象
   */
  public addInteractableObject(interactableObject: InteractableObject): void {
    this.interactableObjects.push(interactableObject);
    
    // 为对象添加一个标识，便于调试
    interactableObject.object3d.userData.interactable = true;
    interactableObject.object3d.userData.interactionName = interactableObject.name;
  }

  /**
   * 移除可交互对象
   */
  public removeInteractableObject(interactableObject: InteractableObject): void {
    const index = this.interactableObjects.indexOf(interactableObject);
    if (index > -1) {
      this.interactableObjects.splice(index, 1);
      
      // 如果当前悬停的对象被移除，清除悬停状态
      if (this.currentHoveredObject === interactableObject) {
        this.currentHoveredObject = null;
        this.updateInteractionPrompt();
      }
    }
  }

  /**
   * 根据名称查找可交互对象
   */
  public findInteractableObjectByName(name: string): InteractableObject | null {
    return this.interactableObjects.find(obj => obj.name === name) || null;
  }

  /**
   * 获取所有可交互对象
   */
  public getAllInteractableObjects(): InteractableObject[] {
    return [...this.interactableObjects];
  }

  /**
   * 更新系统（每帧调用）
   */
  public update(): void {
    // 这里可以添加需要每帧更新的逻辑
    // 比如检查距离变化等
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    this.canvas.removeEventListener('click', this.onCanvasClick.bind(this));
    this.canvas.removeEventListener('mousemove', this.onCanvasMouseMove.bind(this));
    
    this.interactableObjects.length = 0;
    this.currentHoveredObject = null;
  }
}

/**
 * 创建可交互对象的辅助函数
 */
export function createInteractableObject(
  object3d: THREE.Object3D,
  name: string,
  description: string,
  onInteract: () => void,
  interactionDistance: number = 5,
  onHover?: () => void,
  onHoverEnd?: () => void
): InteractableObject {
  return {
    object3d,
    name,
    description,
    onInteract,
    onHover,
    onHoverEnd,
    interactionDistance
  };
}
