import './style.css';
import * as THREE from 'three';
import { SceneManager } from './scenes/SceneManager';
import { ChanganCityBuilder } from './scenes/ChanganCityBuilder';
import { FirstPersonControls } from './components/FirstPersonControls';
import { InteractionSystem } from './components/InteractionSystem';
import { AudioManager } from './utils/AudioManager';
import { AnimationManager, AnimationType } from './utils/AnimationManager';
import { TextDisplayManager, POEMS, DESCRIPTIONS } from './utils/TextDisplayManager';
import { SettingsPanel, type GameSettings } from './components/SettingsPanel';
import { HelpPanel } from './components/HelpPanel';
import { FPSMonitor } from './utils/FPSMonitor';
import { PerformanceOptimizer } from './utils/PerformanceOptimizer';
import { createAppTestSuite, runCompatibilityCheck } from './utils/TestRunner';

/**
 * 谪仙风流录 - 主应用类
 */
class ChroniclesApp {
  private sceneManager: SceneManager | null = null;
  private controls: FirstPersonControls | null = null;
  private interactionSystem: InteractionSystem | null = null;
  private audioManager: AudioManager | null = null;
  private animationManager: AnimationManager | null = null;
  private textDisplayManager: TextDisplayManager | null = null;
  private settingsPanel: SettingsPanel | null = null;
  private helpPanel: HelpPanel | null = null;
  private fpsMonitor: FPSMonitor | null = null;
  private performanceOptimizer: PerformanceOptimizer | null = null;

  private canvas: HTMLCanvasElement | null = null;
  private loadingScreen: HTMLElement | null = null;

  private isInitialized: boolean = false;

  constructor() {
    this.init();
  }

  /**
   * 初始化应用
   */
  private async init(): Promise<void> {
    try {
      console.log('正在初始化谪仙风流录...');

      // 获取DOM元素
      this.canvas = document.getElementById('three-canvas') as HTMLCanvasElement;
      this.loadingScreen = document.getElementById('loading-screen');

      if (!this.canvas) {
        throw new Error('Canvas element not found');
      }

      // 初始化核心系统
      await this.initializeSystems();

      // 创建场景内容
      await this.createScene();

      // 隐藏加载界面
      this.hideLoadingScreen();

      // 开始渲染循环
      this.startApplication();

      this.isInitialized = true;
      console.log('谪仙风流录初始化完成！');

    } catch (error) {
      console.error('应用初始化失败:', error);
      this.showError('应用初始化失败，请刷新页面重试。');
    }
  }

  /**
   * 初始化核心系统
   */
  private async initializeSystems(): Promise<void> {
    // 初始化场景管理器
    this.sceneManager = new SceneManager(this.canvas!);

    // 初始化第一人称控制器
    this.controls = new FirstPersonControls(
      this.sceneManager.camera,
      this.canvas!
    );

    // 初始化交互系统
    this.interactionSystem = new InteractionSystem(
      this.sceneManager.camera,
      this.sceneManager.scene,
      this.canvas!
    );

    // 初始化音频管理器
    this.audioManager = new AudioManager();

    // 初始化动画管理器
    this.animationManager = new AnimationManager();

    // 初始化文字显示管理器
    this.textDisplayManager = new TextDisplayManager();

    // 初始化FPS监视器
    this.fpsMonitor = new FPSMonitor();

    // 初始化设置面板
    this.settingsPanel = new SettingsPanel(SettingsPanel.loadSettings());
    this.setupSettingsCallbacks();

    // 初始化帮助面板
    this.helpPanel = new HelpPanel();

    // 初始化性能优化器
    this.performanceOptimizer = new PerformanceOptimizer(
      this.sceneManager.scene,
      this.sceneManager.camera,
      this.sceneManager.renderer
    );

    this.setupUIEventListeners();

    // 设置更新回调
    this.sceneManager.addUpdateCallback(() => {
      if (this.controls) {
        this.controls.update(1/60); // 假设60FPS
      }
      if (this.interactionSystem) {
        this.interactionSystem.update();
      }
      if (this.fpsMonitor) {
        this.fpsMonitor.update();
      }
      if (this.performanceOptimizer) {
        this.performanceOptimizer.update();
      }
    });
  }

  /**
   * 创建场景内容
   */
  private async createScene(): Promise<void> {
    if (!this.sceneManager) return;

    // 使用长安城构建器创建完整的城市场景
    const cityBuilder = new ChanganCityBuilder(this.sceneManager.scene);
    const cityObjects = cityBuilder.buildCity();

    // 将城市对象添加到碰撞检测
    cityObjects.forEach(obj => {
      if (obj.name !== 'tree' && !obj.name.startsWith('tree_') &&
          !obj.name.startsWith('lantern_') && !obj.name.startsWith('mountain_')) {
        this.controls?.addCollisionObject(obj);
      }
    });

    // 创建交互物品
    this.createInteractableItems();

    // 设置初始相机位置 - 在城市中心的一个高点
    this.controls?.setPosition(0, 8, 15);
    this.controls?.lookAt(0, 5, 0);
  }



  /**
   * 创建交互物品
   */
  private createInteractableItems(): void {
    if (!this.sceneManager || !this.interactionSystem) return;

    // 创建玉笛
    this.createJadeFlute();

    // 创建酒盏
    this.createWineCup();

    // 创建长剑
    this.createSword();

    // 创建箜篌
    this.createHarp();
  }

  /**
   * 创建玉笛
   */
  private createJadeFlute(): void {
    if (!this.sceneManager || !this.interactionSystem || !this.animationManager) return;

    const geometry = new THREE.CylinderGeometry(0.1, 0.1, 2);
    const material = new THREE.MeshPhongMaterial({
      color: 0x90EE90,
      shininess: 100,
      emissive: 0x002200
    });

    const flute = new THREE.Mesh(geometry, material);
    flute.position.set(-5, 2, 0);
    flute.rotation.z = Math.PI / 4;

    this.sceneManager.scene.add(flute);

    // 添加浮动和发光动画
    this.animationManager.addAnimation('flute_float', flute, {
      type: AnimationType.FLOAT,
      duration: 3,
      amplitude: 0.5
    });

    this.animationManager.addAnimation('flute_glow', flute, {
      type: AnimationType.GLOW,
      duration: 2,
      amplitude: 0.8
    });

    // 添加交互
    this.interactionSystem.addInteractableObject({
      object3d: flute,
      name: 'jade_flute',
      description: '玉笛 - 清音袅袅，如诉如泣',
      interactionDistance: 3,
      onInteract: () => {
        console.log('玉笛被触碰，清音响起...');
        this.playFluteSound();
        // 触发弹跳动画
        this.animationManager?.addAnimation('flute_bounce', flute, {
          type: AnimationType.BOUNCE,
          duration: 1,
          amplitude: 1,
          loop: false
        });
      },
      onHover: () => {
        // 增强发光效果
        this.animationManager?.removeAnimation('flute_glow');
        this.animationManager?.addAnimation('flute_glow_hover', flute, {
          type: AnimationType.GLOW,
          duration: 1,
          amplitude: 1.5
        });
      },
      onHoverEnd: () => {
        // 恢复正常发光
        this.animationManager?.removeAnimation('flute_glow_hover');
        this.animationManager?.addAnimation('flute_glow', flute, {
          type: AnimationType.GLOW,
          duration: 2,
          amplitude: 0.8
        });
      }
    });
  }

  /**
   * 创建酒盏
   */
  private createWineCup(): void {
    if (!this.sceneManager || !this.interactionSystem || !this.animationManager) return;

    const geometry = new THREE.CylinderGeometry(0.5, 0.3, 0.3);
    const material = new THREE.MeshPhongMaterial({
      color: 0xFFD700,
      shininess: 100,
      emissive: 0x332200
    });

    const cup = new THREE.Mesh(geometry, material);
    cup.position.set(5, 2, 0);

    this.sceneManager.scene.add(cup);

    // 添加旋转和脉冲动画
    this.animationManager.addAnimation('cup_rotate', cup, {
      type: AnimationType.ROTATE,
      duration: 4,
      speed: 0.5
    });

    this.animationManager.addAnimation('cup_pulse', cup, {
      type: AnimationType.PULSE,
      duration: 2.5,
      amplitude: 0.1
    });

    // 添加交互
    this.interactionSystem.addInteractableObject({
      object3d: cup,
      name: 'wine_cup',
      description: '酒盏 - 金樽清酒斗十千',
      interactionDistance: 3,
      onInteract: () => {
        console.log('举杯邀明月，对影成三人...');
        this.playWineSound();
        // 触发强烈的脉冲效果
        this.animationManager?.removeAnimation('cup_pulse');
        this.animationManager?.addAnimation('cup_pulse_strong', cup, {
          type: AnimationType.PULSE,
          duration: 0.5,
          amplitude: 0.5,
          loop: false
        });
        // 恢复正常脉冲
        setTimeout(() => {
          this.animationManager?.removeAnimation('cup_pulse_strong');
          this.animationManager?.addAnimation('cup_pulse', cup, {
            type: AnimationType.PULSE,
            duration: 2.5,
            amplitude: 0.1
          });
        }, 500);
      },
      onHover: () => {
        // 加快旋转速度
        this.animationManager?.removeAnimation('cup_rotate');
        this.animationManager?.addAnimation('cup_rotate_fast', cup, {
          type: AnimationType.ROTATE,
          duration: 2,
          speed: 1.5
        });
      },
      onHoverEnd: () => {
        // 恢复正常旋转
        this.animationManager?.removeAnimation('cup_rotate_fast');
        this.animationManager?.addAnimation('cup_rotate', cup, {
          type: AnimationType.ROTATE,
          duration: 4,
          speed: 0.5
        });
      }
    });
  }

  /**
   * 创建长剑
   */
  private createSword(): void {
    if (!this.sceneManager || !this.interactionSystem || !this.animationManager) return;

    const bladeGeometry = new THREE.BoxGeometry(0.1, 3, 0.05);
    const bladeMaterial = new THREE.MeshPhongMaterial({
      color: 0xC0C0C0,
      shininess: 100,
      emissive: 0x111111
    });

    const handleGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.8);
    const handleMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B4513
    });

    const sword = new THREE.Group();

    const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
    blade.position.y = 1.5;

    const handle = new THREE.Mesh(handleGeometry, handleMaterial);
    handle.position.y = 0.4;

    sword.add(blade);
    sword.add(handle);
    sword.position.set(0, 2, -5);
    sword.rotation.z = Math.PI / 6;

    this.sceneManager.scene.add(sword);

    // 添加浮动和发光动画
    this.animationManager.addAnimation('sword_float', sword, {
      type: AnimationType.FLOAT,
      duration: 4,
      amplitude: 0.3
    });

    this.animationManager.addAnimation('sword_glow', blade, {
      type: AnimationType.GLOW,
      duration: 1.5,
      amplitude: 0.6
    });

    // 添加交互
    this.interactionSystem.addInteractableObject({
      object3d: sword,
      name: 'sword',
      description: '长剑 - 十步杀一人，千里不留行',
      interactionDistance: 3,
      onInteract: () => {
        console.log('剑气纵横三万里，一剑光寒十九州...');
        this.playSwordSound();
        // 触发快速旋转效果
        this.animationManager?.addAnimation('sword_spin', sword, {
          type: AnimationType.ROTATE,
          duration: 1,
          speed: 8,
          loop: false
        });
      },
      onHover: () => {
        // 增强剑刃发光
        this.animationManager?.removeAnimation('sword_glow');
        this.animationManager?.addAnimation('sword_glow_intense', blade, {
          type: AnimationType.GLOW,
          duration: 0.8,
          amplitude: 1.2
        });
      },
      onHoverEnd: () => {
        // 恢复正常发光
        this.animationManager?.removeAnimation('sword_glow_intense');
        this.animationManager?.addAnimation('sword_glow', blade, {
          type: AnimationType.GLOW,
          duration: 1.5,
          amplitude: 0.6
        });
      }
    });
  }

  /**
   * 创建箜篌
   */
  private createHarp(): void {
    if (!this.sceneManager || !this.interactionSystem || !this.animationManager) return;

    const frameGeometry = new THREE.BoxGeometry(0.2, 2, 1.5);
    const frameMaterial = new THREE.MeshPhongMaterial({
      color: 0x8B4513,
      emissive: 0x221100
    });

    const harp = new THREE.Mesh(frameGeometry, frameMaterial);
    harp.position.set(0, 2, 5);

    this.sceneManager.scene.add(harp);

    // 添加琴弦
    const stringMaterial = new THREE.MeshBasicMaterial({ color: 0xFFD700 });
    for (let i = 0; i < 8; i++) {
      const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, 1.8);
      const string = new THREE.Mesh(stringGeometry, stringMaterial);
      string.position.set(0.05, 0, -0.6 + i * 0.15);
      harp.add(string);
    }

    // 添加脉冲和发光动画
    this.animationManager.addAnimation('harp_pulse', harp, {
      type: AnimationType.PULSE,
      duration: 3,
      amplitude: 0.05
    });

    this.animationManager.addAnimation('harp_glow', harp, {
      type: AnimationType.GLOW,
      duration: 2.5,
      amplitude: 0.4
    });

    // 添加交互
    this.interactionSystem.addInteractableObject({
      object3d: harp,
      name: 'harp',
      description: '箜篌 - 此曲只应天上有，人间能得几回闻',
      interactionDistance: 3,
      onInteract: () => {
        console.log('箜篌声起，余音绕梁...');
        this.playHarpSound();
        // 触发琴弦振动效果
        harp.children.forEach((string, index) => {
          if (string instanceof THREE.Mesh) {
            this.animationManager?.addAnimation(`string_${index}`, string, {
              type: AnimationType.PULSE,
              duration: 0.3,
              amplitude: 0.3,
              loop: false
            });
          }
        });
      },
      onHover: () => {
        // 增强发光和脉冲
        this.animationManager?.removeAnimation('harp_glow');
        this.animationManager?.removeAnimation('harp_pulse');
        this.animationManager?.addAnimation('harp_glow_hover', harp, {
          type: AnimationType.GLOW,
          duration: 1.5,
          amplitude: 0.8
        });
        this.animationManager?.addAnimation('harp_pulse_hover', harp, {
          type: AnimationType.PULSE,
          duration: 1.5,
          amplitude: 0.15
        });
      },
      onHoverEnd: () => {
        // 恢复正常动画
        this.animationManager?.removeAnimation('harp_glow_hover');
        this.animationManager?.removeAnimation('harp_pulse_hover');
        this.animationManager?.addAnimation('harp_glow', harp, {
          type: AnimationType.GLOW,
          duration: 2.5,
          amplitude: 0.4
        });
        this.animationManager?.addAnimation('harp_pulse', harp, {
          type: AnimationType.PULSE,
          duration: 3,
          amplitude: 0.05
        });
      }
    });
  }

  /**
   * 播放笛声音效
   */
  private playFluteSound(): void {
    console.log('🎵 玉笛清音响起...');
    // this.audioManager?.playSound('flute');

    // 显示诗词
    this.textDisplayManager?.showPoem(POEMS.flute, 4000);

    // 延迟显示描述
    setTimeout(() => {
      this.textDisplayManager?.showDescription(DESCRIPTIONS.flute, 3000);
    }, 4500);
  }

  /**
   * 播放酒杯音效
   */
  private playWineSound(): void {
    console.log('🍷 酒香阵阵...');
    // this.audioManager?.playSound('wine');

    // 显示诗词
    this.textDisplayManager?.showPoem(POEMS.wine, 4000);

    // 延迟显示描述
    setTimeout(() => {
      this.textDisplayManager?.showDescription(DESCRIPTIONS.wine, 3000);
    }, 4500);
  }

  /**
   * 播放剑鸣音效
   */
  private playSwordSound(): void {
    console.log('⚔️ 剑气凌厉...');
    // this.audioManager?.playSound('sword');

    // 显示诗词
    this.textDisplayManager?.showPoem(POEMS.sword, 4000);

    // 延迟显示描述
    setTimeout(() => {
      this.textDisplayManager?.showDescription(DESCRIPTIONS.sword, 3000);
    }, 4500);
  }

  /**
   * 播放箜篌音效
   */
  private playHarpSound(): void {
    console.log('🎶 箜篌悠扬...');
    // this.audioManager?.playSound('harp');

    // 显示诗词
    this.textDisplayManager?.showPoem(POEMS.harp, 4000);

    // 延迟显示描述
    setTimeout(() => {
      this.textDisplayManager?.showDescription(DESCRIPTIONS.harp, 3000);
    }, 4500);
  }

  /**
   * 隐藏加载界面
   */
  private hideLoadingScreen(): void {
    if (this.loadingScreen) {
      this.loadingScreen.classList.add('loading-hidden');

      // 延迟移除元素
      setTimeout(() => {
        if (this.loadingScreen && this.loadingScreen.parentNode) {
          this.loadingScreen.parentNode.removeChild(this.loadingScreen);
        }
      }, 1000);
    }
  }

  /**
   * 显示错误信息
   */
  private showError(message: string): void {
    if (this.loadingScreen) {
      const loadingContent = this.loadingScreen.querySelector('.loading-content');
      if (loadingContent) {
        loadingContent.innerHTML = `
          <h1>谪仙风流录</h1>
          <div style="color: #ff6b6b; margin: 2rem 0;">
            <p>❌ ${message}</p>
          </div>
        `;
      }
    }
  }

  /**
   * 开始应用
   */
  private startApplication(): void {
    if (this.sceneManager) {
      this.sceneManager.startRenderLoop();
    }

    // 应用初始设置
    if (this.settingsPanel) {
      this.applySettings(this.settingsPanel.getSettings());
    }

    // 运行兼容性检查
    this.runCompatibilityCheck();

    // 在开发模式下运行测试
    if (import.meta.env.DEV) {
      this.runDevelopmentTests();
    }

    console.log('🎮 谪仙风流录已启动！');
    console.log('💡 点击画面锁定鼠标，使用WASD移动，鼠标控制视角');
    console.log('🎯 靠近发光的物品并点击进行交互');
    console.log('⚙️ 按ESC或点击右上角齿轮图标打开设置');
  }

  /**
   * 运行兼容性检查
   */
  private runCompatibilityCheck(): void {
    const report = runCompatibilityCheck();

    console.log('🔍 兼容性检查结果:');
    console.log(`   浏览器: ${report.browser.name} ${report.browser.version}`);
    console.log(`   WebGL: ${report.webgl.supported ? '✅' : '❌'} ${report.webgl.details}`);
    console.log(`   音频: ${report.audio.supported ? '✅' : '❌'} ${report.audio.details}`);
    console.log(`   存储: ${report.storage.supported ? '✅' : '❌'} ${report.storage.details}`);
    console.log(`   指针锁定: ${report.pointerLock.supported ? '✅' : '❌'} ${report.pointerLock.details}`);
    console.log(`   性能API: ${report.performance.supported ? '✅' : '❌'} ${report.performance.details}`);
    console.log(`   总体评级: ${this.getCompatibilityEmoji(report.overall)} ${report.overall}`);

    if (report.overall === 'poor') {
      console.warn('⚠️ 您的浏览器兼容性较差，可能影响应用体验');
    }
  }

  /**
   * 获取兼容性等级对应的表情符号
   */
  private getCompatibilityEmoji(level: string): string {
    switch (level) {
      case 'excellent': return '🌟';
      case 'good': return '👍';
      case 'fair': return '👌';
      case 'poor': return '⚠️';
      default: return '❓';
    }
  }

  /**
   * 运行开发测试
   */
  private async runDevelopmentTests(): Promise<void> {
    console.log('🧪 运行开发测试...');

    const testSuite = createAppTestSuite();
    const results = await testSuite.runTests();

    const failedTests = results.filter(r => !r.passed);
    if (failedTests.length > 0) {
      console.warn('⚠️ 有测试失败，请检查控制台输出');
    }
  }

  /**
   * 设置回调函数
   */
  private setupSettingsCallbacks(): void {
    if (!this.settingsPanel) return;

    this.settingsPanel.setOnSettingsChange((settings: GameSettings) => {
      this.applySettings(settings);
    });
  }

  /**
   * 设置UI事件监听器
   */
  private setupUIEventListeners(): void {
    // 设置按钮点击事件
    const settingsToggle = document.getElementById('settings-toggle');
    if (settingsToggle) {
      settingsToggle.addEventListener('click', () => {
        this.settingsPanel?.toggle();
      });
    }

    // 帮助按钮点击事件
    const helpToggle = document.getElementById('help-toggle');
    if (helpToggle) {
      helpToggle.addEventListener('click', () => {
        this.helpPanel?.toggle();
      });
    }

    // 键盘事件
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.settingsPanel) {
          this.settingsPanel.toggle();
        }
      } else if (e.key === 'F1') {
        e.preventDefault();
        if (this.helpPanel) {
          this.helpPanel.toggle();
        }
      }
    });
  }

  /**
   * 应用设置
   */
  private applySettings(settings: GameSettings): void {
    console.log('应用新设置:', settings);

    // 应用音频设置
    if (this.audioManager) {
      this.audioManager.setMasterVolume(settings.audio.masterVolume);
      this.audioManager.setMusicVolume(settings.audio.musicVolume);
      this.audioManager.setSFXVolume(settings.audio.sfxVolume);
    }

    // 应用控制设置
    if (this.controls) {
      this.controls.setMouseSensitivity(settings.controls.mouseSensitivity * 0.002);
      this.controls.setMoveSpeed(settings.controls.moveSpeed);
    }

    // 应用显示设置
    if (this.fpsMonitor) {
      this.fpsMonitor.setVisible(settings.display.showFPS);
    }

    // 应用图形设置
    if (this.sceneManager) {
      // 雾效设置
      if (settings.graphics.fogEnabled) {
        this.sceneManager.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
      } else {
        this.sceneManager.scene.fog = null;
      }

      // 阴影质量设置
      this.applyShadowQuality(settings.graphics.shadowQuality);
    }

    // UI缩放设置
    this.applyUIScale(settings.display.uiScale);
  }

  /**
   * 应用阴影质量设置
   */
  private applyShadowQuality(quality: 'off' | 'low' | 'medium' | 'high'): void {
    if (!this.sceneManager) return;

    const renderer = this.sceneManager.renderer;

    switch (quality) {
      case 'off':
        renderer.shadowMap.enabled = false;
        break;
      case 'low':
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.BasicShadowMap;
        break;
      case 'medium':
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFShadowMap;
        break;
      case 'high':
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        break;
    }
  }

  /**
   * 应用UI缩放
   */
  private applyUIScale(scale: number): void {
    document.documentElement.style.fontSize = `${16 * scale}px`;
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    this.sceneManager?.dispose();
    this.controls?.dispose();
    this.interactionSystem?.dispose();
    this.audioManager?.dispose();
    this.animationManager?.dispose();
    this.textDisplayManager?.dispose();
    this.settingsPanel?.dispose();
    this.helpPanel?.dispose();
    this.fpsMonitor?.dispose();
    // 性能优化器不需要特殊清理

    console.log('应用已清理');
  }
}

// 启动应用
const app = new ChroniclesApp();

// 页面卸载时清理资源
window.addEventListener('beforeunload', () => {
  app.dispose();
});
