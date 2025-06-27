import * as THREE from 'three';

/**
 * 动画类型枚举
 */
export enum AnimationType {
  FLOAT = 'float',
  ROTATE = 'rotate',
  PULSE = 'pulse',
  GLOW = 'glow',
  BOUNCE = 'bounce'
}

/**
 * 动画配置接口
 */
export interface AnimationConfig {
  type: AnimationType;
  duration: number;
  amplitude?: number;
  speed?: number;
  loop?: boolean;
  autoStart?: boolean;
}

/**
 * 动画实例接口
 */
interface AnimationInstance {
  object: THREE.Object3D;
  config: AnimationConfig;
  startTime: number;
  isActive: boolean;
  originalPosition?: THREE.Vector3;
  originalRotation?: THREE.Euler;
  originalScale?: THREE.Vector3;
  originalEmissive?: THREE.Color;
}

/**
 * 动画管理器
 */
export class AnimationManager {
  private animations: Map<string, AnimationInstance> = new Map();
  private clock: THREE.Clock;
  private isRunning: boolean = false;

  constructor() {
    this.clock = new THREE.Clock();
  }

  /**
   * 添加动画
   */
  public addAnimation(
    id: string,
    object: THREE.Object3D,
    config: AnimationConfig
  ): void {
    // 保存原始状态
    const originalPosition = object.position.clone();
    const originalRotation = object.rotation.clone();
    const originalScale = object.scale.clone();
    
    let originalEmissive: THREE.Color | undefined;
    if (object instanceof THREE.Mesh && object.material instanceof THREE.MeshPhongMaterial) {
      originalEmissive = object.material.emissive.clone();
    }

    const animation: AnimationInstance = {
      object,
      config: {
        loop: true,
        autoStart: true,
        ...config
      },
      startTime: this.clock.getElapsedTime(),
      isActive: config.autoStart !== false,
      originalPosition,
      originalRotation,
      originalScale,
      originalEmissive
    };

    this.animations.set(id, animation);

    if (!this.isRunning && animation.isActive) {
      this.start();
    }
  }

  /**
   * 移除动画
   */
  public removeAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      // 恢复原始状态
      if (animation.originalPosition) {
        animation.object.position.copy(animation.originalPosition);
      }
      if (animation.originalRotation) {
        animation.object.rotation.copy(animation.originalRotation);
      }
      if (animation.originalScale) {
        animation.object.scale.copy(animation.originalScale);
      }
      if (animation.originalEmissive && 
          animation.object instanceof THREE.Mesh && 
          animation.object.material instanceof THREE.MeshPhongMaterial) {
        animation.object.material.emissive.copy(animation.originalEmissive);
      }

      this.animations.delete(id);
    }

    // 如果没有活动动画，停止更新
    if (this.animations.size === 0) {
      this.stop();
    }
  }

  /**
   * 播放动画
   */
  public playAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.isActive = true;
      animation.startTime = this.clock.getElapsedTime();
      
      if (!this.isRunning) {
        this.start();
      }
    }
  }

  /**
   * 暂停动画
   */
  public pauseAnimation(id: string): void {
    const animation = this.animations.get(id);
    if (animation) {
      animation.isActive = false;
    }
  }

  /**
   * 开始动画更新循环
   */
  public start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.update();
  }

  /**
   * 停止动画更新循环
   */
  public stop(): void {
    this.isRunning = false;
  }

  /**
   * 更新所有动画
   */
  private update(): void {
    if (!this.isRunning) return;

    const currentTime = this.clock.getElapsedTime();

    for (const [id, animation] of this.animations.entries()) {
      if (!animation.isActive) continue;

      const elapsed = currentTime - animation.startTime;
      const progress = (elapsed % animation.config.duration) / animation.config.duration;

      this.updateAnimation(animation, progress, elapsed);
    }

    // 继续下一帧
    requestAnimationFrame(() => this.update());
  }

  /**
   * 更新单个动画
   */
  private updateAnimation(animation: AnimationInstance, progress: number, elapsed: number): void {
    const { object, config, originalPosition, originalRotation, originalScale } = animation;

    switch (config.type) {
      case AnimationType.FLOAT:
        this.updateFloatAnimation(object, originalPosition!, config, progress);
        break;

      case AnimationType.ROTATE:
        this.updateRotateAnimation(object, originalRotation!, config, elapsed);
        break;

      case AnimationType.PULSE:
        this.updatePulseAnimation(object, originalScale!, config, progress);
        break;

      case AnimationType.GLOW:
        this.updateGlowAnimation(object, animation.originalEmissive, config, progress);
        break;

      case AnimationType.BOUNCE:
        this.updateBounceAnimation(object, originalPosition!, config, progress);
        break;
    }
  }

  /**
   * 更新浮动动画
   */
  private updateFloatAnimation(
    object: THREE.Object3D,
    originalPosition: THREE.Vector3,
    config: AnimationConfig,
    progress: number
  ): void {
    const amplitude = config.amplitude || 1;
    const offset = Math.sin(progress * Math.PI * 2) * amplitude;
    
    object.position.copy(originalPosition);
    object.position.y += offset;
  }

  /**
   * 更新旋转动画
   */
  private updateRotateAnimation(
    object: THREE.Object3D,
    originalRotation: THREE.Euler,
    config: AnimationConfig,
    elapsed: number
  ): void {
    const speed = config.speed || 1;
    
    object.rotation.copy(originalRotation);
    object.rotation.y += elapsed * speed;
  }

  /**
   * 更新脉冲动画
   */
  private updatePulseAnimation(
    object: THREE.Object3D,
    originalScale: THREE.Vector3,
    config: AnimationConfig,
    progress: number
  ): void {
    const amplitude = config.amplitude || 0.2;
    const scale = 1 + Math.sin(progress * Math.PI * 2) * amplitude;
    
    object.scale.copy(originalScale);
    object.scale.multiplyScalar(scale);
  }

  /**
   * 更新发光动画
   */
  private updateGlowAnimation(
    object: THREE.Object3D,
    originalEmissive: THREE.Color | undefined,
    config: AnimationConfig,
    progress: number
  ): void {
    if (!(object instanceof THREE.Mesh) || 
        !(object.material instanceof THREE.MeshPhongMaterial) ||
        !originalEmissive) {
      return;
    }

    const intensity = (Math.sin(progress * Math.PI * 2) + 1) * 0.5;
    const amplitude = config.amplitude || 0.3;
    
    const glowColor = originalEmissive.clone();
    glowColor.multiplyScalar(intensity * amplitude);
    
    object.material.emissive.copy(glowColor);
  }

  /**
   * 更新弹跳动画
   */
  private updateBounceAnimation(
    object: THREE.Object3D,
    originalPosition: THREE.Vector3,
    config: AnimationConfig,
    progress: number
  ): void {
    const amplitude = config.amplitude || 2;
    
    // 使用抛物线函数创建弹跳效果
    let bounceProgress = progress * 2;
    if (bounceProgress > 1) bounceProgress = 2 - bounceProgress;
    
    const height = 4 * bounceProgress * (1 - bounceProgress) * amplitude;
    
    object.position.copy(originalPosition);
    object.position.y += height;
  }

  /**
   * 获取所有动画ID
   */
  public getAnimationIds(): string[] {
    return Array.from(this.animations.keys());
  }

  /**
   * 检查动画是否存在
   */
  public hasAnimation(id: string): boolean {
    return this.animations.has(id);
  }

  /**
   * 检查动画是否正在播放
   */
  public isAnimationActive(id: string): boolean {
    const animation = this.animations.get(id);
    return animation ? animation.isActive : false;
  }

  /**
   * 清除所有动画
   */
  public clearAll(): void {
    for (const id of this.animations.keys()) {
      this.removeAnimation(id);
    }
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    this.clearAll();
    this.stop();
  }
}
