/**
 * FPS监视器
 */
export class FPSMonitor {
  private fpsElement: HTMLElement | null = null;
  private frameCount: number = 0;
  private lastTime: number = 0;
  private fps: number = 0;
  private isVisible: boolean = false;
  private updateInterval: number = 500; // 更新间隔（毫秒）

  constructor() {
    this.createFPSElement();
    this.lastTime = performance.now();
  }

  /**
   * 创建FPS显示元素
   */
  private createFPSElement(): void {
    this.fpsElement = document.createElement('div');
    this.fpsElement.id = 'fps-monitor';
    this.fpsElement.style.cssText = `
      position: fixed;
      top: 20px;
      left: 20px;
      background: rgba(0, 0, 0, 0.8);
      color: #00ff00;
      padding: 8px 12px;
      border-radius: 8px;
      font-family: 'Courier New', monospace;
      font-size: 14px;
      font-weight: bold;
      z-index: 1000;
      border: 1px solid #00ff00;
      box-shadow: 0 2px 10px rgba(0, 255, 0, 0.3);
      backdrop-filter: blur(5px);
      display: none;
      min-width: 80px;
      text-align: center;
    `;
    
    this.fpsElement.textContent = 'FPS: --';
    document.body.appendChild(this.fpsElement);
  }

  /**
   * 更新FPS计算
   */
  public update(): void {
    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    // 每隔指定时间更新一次显示
    if (deltaTime >= this.updateInterval) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.updateDisplay();
      
      this.frameCount = 0;
      this.lastTime = currentTime;
    }
  }

  /**
   * 更新显示
   */
  private updateDisplay(): void {
    if (!this.fpsElement || !this.isVisible) return;

    this.fpsElement.textContent = `FPS: ${this.fps}`;
    
    // 根据FPS值改变颜色
    if (this.fps >= 60) {
      this.fpsElement.style.color = '#00ff00'; // 绿色 - 良好
      this.fpsElement.style.borderColor = '#00ff00';
      this.fpsElement.style.boxShadow = '0 2px 10px rgba(0, 255, 0, 0.3)';
    } else if (this.fps >= 30) {
      this.fpsElement.style.color = '#ffff00'; // 黄色 - 一般
      this.fpsElement.style.borderColor = '#ffff00';
      this.fpsElement.style.boxShadow = '0 2px 10px rgba(255, 255, 0, 0.3)';
    } else {
      this.fpsElement.style.color = '#ff0000'; // 红色 - 较差
      this.fpsElement.style.borderColor = '#ff0000';
      this.fpsElement.style.boxShadow = '0 2px 10px rgba(255, 0, 0, 0.3)';
    }
  }

  /**
   * 显示FPS监视器
   */
  public show(): void {
    if (this.fpsElement) {
      this.fpsElement.style.display = 'block';
      this.isVisible = true;
    }
  }

  /**
   * 隐藏FPS监视器
   */
  public hide(): void {
    if (this.fpsElement) {
      this.fpsElement.style.display = 'none';
      this.isVisible = false;
    }
  }

  /**
   * 切换显示状态
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 设置显示状态
   */
  public setVisible(visible: boolean): void {
    if (visible) {
      this.show();
    } else {
      this.hide();
    }
  }

  /**
   * 获取当前FPS
   */
  public getCurrentFPS(): number {
    return this.fps;
  }

  /**
   * 获取显示状态
   */
  public getVisible(): boolean {
    return this.isVisible;
  }

  /**
   * 设置更新间隔
   */
  public setUpdateInterval(interval: number): void {
    this.updateInterval = Math.max(100, interval); // 最小100ms
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    if (this.fpsElement && this.fpsElement.parentNode) {
      this.fpsElement.parentNode.removeChild(this.fpsElement);
      this.fpsElement = null;
    }
  }
}
