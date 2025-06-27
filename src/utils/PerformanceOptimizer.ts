import * as THREE from 'three';

/**
 * 性能优化器
 */
export class PerformanceOptimizer {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  
  // 性能监控
  private frameCount: number = 0;
  private lastTime: number = 0;
  private averageFPS: number = 60;
  private performanceLevel: 'high' | 'medium' | 'low' = 'high';
  
  // LOD系统
  private lodObjects: Map<THREE.Object3D, LODConfig> = new Map();
  
  // 优化设置
  private optimizationSettings = {
    enableLOD: true,
    enableFrustumCulling: true,
    enableOcclusion: false,
    maxShadowDistance: 100,
    shadowMapSize: 2048
  };

  constructor(scene: THREE.Scene, camera: THREE.Camera, renderer: THREE.WebGLRenderer) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.lastTime = performance.now();
    
    this.setupPerformanceMonitoring();
  }

  /**
   * 设置性能监控
   */
  private setupPerformanceMonitoring(): void {
    // 每秒检查一次性能
    setInterval(() => {
      this.updatePerformanceLevel();
      this.adjustQualitySettings();
    }, 1000);
  }

  /**
   * 更新性能等级
   */
  private updatePerformanceLevel(): void {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    
    if (deltaTime >= 1000) {
      this.averageFPS = (this.frameCount * 1000) / deltaTime;
      this.frameCount = 0;
      this.lastTime = currentTime;
      
      // 根据FPS调整性能等级
      if (this.averageFPS >= 50) {
        this.performanceLevel = 'high';
      } else if (this.averageFPS >= 30) {
        this.performanceLevel = 'medium';
      } else {
        this.performanceLevel = 'low';
      }
    }
    
    this.frameCount++;
  }

  /**
   * 根据性能等级调整质量设置
   */
  private adjustQualitySettings(): void {
    switch (this.performanceLevel) {
      case 'low':
        this.applyLowQualitySettings();
        break;
      case 'medium':
        this.applyMediumQualitySettings();
        break;
      case 'high':
        this.applyHighQualitySettings();
        break;
    }
  }

  /**
   * 应用低质量设置
   */
  private applyLowQualitySettings(): void {
    // 降低阴影质量
    this.renderer.shadowMap.type = THREE.BasicShadowMap;
    this.optimizationSettings.shadowMapSize = 512;
    this.optimizationSettings.maxShadowDistance = 50;
    
    // 禁用一些效果
    this.scene.fog = null;
    
    console.log('应用低质量设置');
  }

  /**
   * 应用中等质量设置
   */
  private applyMediumQualitySettings(): void {
    // 中等阴影质量
    this.renderer.shadowMap.type = THREE.PCFShadowMap;
    this.optimizationSettings.shadowMapSize = 1024;
    this.optimizationSettings.maxShadowDistance = 75;
    
    // 启用雾效
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 150);
    
    console.log('应用中等质量设置');
  }

  /**
   * 应用高质量设置
   */
  private applyHighQualitySettings(): void {
    // 高质量阴影
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.optimizationSettings.shadowMapSize = 2048;
    this.optimizationSettings.maxShadowDistance = 100;
    
    // 启用所有效果
    this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
    
    console.log('应用高质量设置');
  }

  /**
   * 添加LOD对象
   */
  public addLODObject(object: THREE.Object3D, config: LODConfig): void {
    this.lodObjects.set(object, config);
  }

  /**
   * 更新LOD系统
   */
  public updateLOD(): void {
    if (!this.optimizationSettings.enableLOD) return;

    const cameraPosition = this.camera.position;

    for (const [object, config] of this.lodObjects.entries()) {
      const distance = cameraPosition.distanceTo(object.position);
      
      // 根据距离调整细节级别
      if (distance > config.farDistance) {
        // 远距离 - 隐藏或使用最低细节
        object.visible = false;
      } else if (distance > config.mediumDistance) {
        // 中距离 - 中等细节
        object.visible = true;
        this.applyMediumLOD(object);
      } else {
        // 近距离 - 高细节
        object.visible = true;
        this.applyHighLOD(object, config);
      }
    }
  }

  /**
   * 应用中等LOD
   */
  private applyMediumLOD(object: THREE.Object3D): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // 降低材质质量
        if (child.material instanceof THREE.MeshPhongMaterial) {
          child.material.shininess = Math.min(child.material.shininess, 50);
        }
        
        // 禁用阴影投射（对于远距离对象）
        child.castShadow = false;
      }
    });
  }

  /**
   * 应用高LOD
   */
  private applyHighLOD(object: THREE.Object3D, config: LODConfig): void {
    object.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        // 恢复材质质量
        if (child.material instanceof THREE.MeshPhongMaterial) {
          child.material.shininess = config.originalShininess || 100;
        }
        
        // 启用阴影投射
        child.castShadow = config.castShadow !== false;
      }
    });
  }

  /**
   * 视锥体剔除
   */
  public updateFrustumCulling(): void {
    if (!this.optimizationSettings.enableFrustumCulling) return;

    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4();
    
    if (this.camera instanceof THREE.PerspectiveCamera) {
      matrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
      frustum.setFromProjectionMatrix(matrix);

      this.scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          // 检查对象是否在视锥体内
          const boundingSphere = object.geometry.boundingSphere;
          if (boundingSphere) {
            const worldSphere = boundingSphere.clone();
            worldSphere.applyMatrix4(object.matrixWorld);
            object.visible = frustum.intersectsSphere(worldSphere);
          }
        }
      });
    }
  }

  /**
   * 优化材质
   */
  public optimizeMaterials(): void {
    this.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const material = object.material;
        
        if (Array.isArray(material)) {
          material.forEach(mat => this.optimizeSingleMaterial(mat));
        } else {
          this.optimizeSingleMaterial(material);
        }
      }
    });
  }

  /**
   * 优化单个材质
   */
  private optimizeSingleMaterial(material: THREE.Material): void {
    // 根据性能等级调整材质设置
    if (material instanceof THREE.MeshPhongMaterial) {
      switch (this.performanceLevel) {
        case 'low':
          material.shininess = Math.min(material.shininess, 30);
          break;
        case 'medium':
          material.shininess = Math.min(material.shininess, 60);
          break;
        // high级别保持原始设置
      }
    }
  }

  /**
   * 更新优化器（每帧调用）
   */
  public update(): void {
    this.updateLOD();
    this.updateFrustumCulling();
  }

  /**
   * 获取性能统计
   */
  public getPerformanceStats(): PerformanceStats {
    return {
      fps: this.averageFPS,
      performanceLevel: this.performanceLevel,
      lodObjectsCount: this.lodObjects.size,
      visibleObjects: this.getVisibleObjectsCount()
    };
  }

  /**
   * 获取可见对象数量
   */
  private getVisibleObjectsCount(): number {
    let count = 0;
    this.scene.traverse((object) => {
      if (object.visible && object instanceof THREE.Mesh) {
        count++;
      }
    });
    return count;
  }

  /**
   * 设置优化选项
   */
  public setOptimizationSettings(settings: Partial<typeof this.optimizationSettings>): void {
    Object.assign(this.optimizationSettings, settings);
  }

  /**
   * 获取当前性能等级
   */
  public getPerformanceLevel(): 'high' | 'medium' | 'low' {
    return this.performanceLevel;
  }
}

/**
 * LOD配置接口
 */
export interface LODConfig {
  nearDistance: number;
  mediumDistance: number;
  farDistance: number;
  castShadow?: boolean;
  originalShininess?: number;
}

/**
 * 性能统计接口
 */
export interface PerformanceStats {
  fps: number;
  performanceLevel: 'high' | 'medium' | 'low';
  lodObjectsCount: number;
  visibleObjects: number;
}
