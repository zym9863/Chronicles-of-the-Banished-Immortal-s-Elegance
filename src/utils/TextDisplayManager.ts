/**
 * 文字显示管理器
 */
export class TextDisplayManager {
  private container: HTMLElement | null = null;
  private currentMessage: HTMLElement | null = null;
  private hideTimeout: number | null = null;

  constructor() {
    this.createContainer();
  }

  /**
   * 创建文字显示容器
   */
  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.id = 'text-display-container';
    this.container.style.cssText = `
      position: fixed;
      top: 20%;
      left: 50%;
      transform: translateX(-50%);
      z-index: 200;
      pointer-events: none;
      font-family: 'Noto Serif SC', serif;
      text-align: center;
      max-width: 80%;
    `;
    
    document.body.appendChild(this.container);
  }

  /**
   * 显示文字消息
   */
  public showMessage(
    text: string,
    duration: number = 3000,
    style: 'poem' | 'description' | 'title' = 'description'
  ): void {
    // 清除之前的消息
    this.clearMessage();

    // 创建新消息元素
    this.currentMessage = document.createElement('div');
    this.currentMessage.className = `text-message text-message-${style}`;
    
    // 设置样式
    this.setMessageStyle(this.currentMessage, style);
    
    // 设置文本内容
    if (style === 'poem') {
      // 诗词格式，支持换行
      this.currentMessage.innerHTML = text.replace(/\n/g, '<br>');
    } else {
      this.currentMessage.textContent = text;
    }
    
    // 添加到容器
    if (this.container) {
      this.container.appendChild(this.currentMessage);
    }
    
    // 添加显示动画
    requestAnimationFrame(() => {
      if (this.currentMessage) {
        this.currentMessage.style.opacity = '1';
        this.currentMessage.style.transform = 'translateY(0) scale(1)';
      }
    });
    
    // 设置自动隐藏
    if (duration > 0) {
      this.hideTimeout = window.setTimeout(() => {
        this.hideMessage();
      }, duration);
    }
  }

  /**
   * 设置消息样式
   */
  private setMessageStyle(element: HTMLElement, style: string): void {
    const baseStyle = `
      opacity: 0;
      transform: translateY(-20px) scale(0.9);
      transition: all 0.5s ease-out;
      padding: 20px;
      border-radius: 15px;
      backdrop-filter: blur(10px);
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      margin-bottom: 10px;
      border: 2px solid;
    `;

    switch (style) {
      case 'poem':
        element.style.cssText = baseStyle + `
          background: linear-gradient(135deg, rgba(139, 69, 19, 0.9), rgba(160, 82, 45, 0.9));
          color: #F5DEB3;
          font-size: 1.4rem;
          line-height: 2;
          border-color: #DAA520;
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
          font-weight: 500;
          letter-spacing: 2px;
        `;
        break;
        
      case 'title':
        element.style.cssText = baseStyle + `
          background: linear-gradient(135deg, rgba(218, 165, 32, 0.9), rgba(205, 133, 63, 0.9));
          color: #2F1B14;
          font-size: 2rem;
          font-weight: 700;
          border-color: #8B4513;
          text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.3);
          letter-spacing: 3px;
        `;
        break;
        
      default: // description
        element.style.cssText = baseStyle + `
          background: linear-gradient(135deg, rgba(47, 27, 20, 0.9), rgba(139, 69, 19, 0.9));
          color: #F5DEB3;
          font-size: 1.2rem;
          border-color: #D2B48C;
          text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
          letter-spacing: 1px;
        `;
        break;
    }
  }

  /**
   * 隐藏当前消息
   */
  public hideMessage(): void {
    if (this.currentMessage) {
      this.currentMessage.style.opacity = '0';
      this.currentMessage.style.transform = 'translateY(-20px) scale(0.9)';
      
      setTimeout(() => {
        this.clearMessage();
      }, 500);
    }
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  /**
   * 清除当前消息
   */
  private clearMessage(): void {
    if (this.currentMessage && this.container) {
      this.container.removeChild(this.currentMessage);
      this.currentMessage = null;
    }
    
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  /**
   * 显示诗词
   */
  public showPoem(poem: string, duration: number = 5000): void {
    this.showMessage(poem, duration, 'poem');
  }

  /**
   * 显示标题
   */
  public showTitle(title: string, duration: number = 3000): void {
    this.showMessage(title, duration, 'title');
  }

  /**
   * 显示描述
   */
  public showDescription(description: string, duration: number = 3000): void {
    this.showMessage(description, duration, 'description');
  }

  /**
   * 检查是否有消息正在显示
   */
  public isShowingMessage(): boolean {
    return this.currentMessage !== null;
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    this.clearMessage();
    
    if (this.container && this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
      this.container = null;
    }
  }
}

/**
 * 预定义的诗词内容
 */
export const POEMS = {
  flute: `玉笛横吹一曲长\n清音袅袅透心房\n谪仙醉卧花间梦\n此声只应天上响`,
  wine: `金樽清酒斗十千\n玉盘珍羞直万钱\n停杯投箸不能食\n拔剑四顾心茫然`,
  sword: `十步杀一人\n千里不留行\n事了拂衣去\n深藏身与名`,
  harp: `箜篌一曲醉人心\n此曲只应天上闻\n人间能得几回听\n不似霓裳羽衣音`
};

/**
 * 预定义的描述文本
 */
export const DESCRIPTIONS = {
  flute: '清风徐来，玉笛声起。仿佛能听到远古的吟唱，诉说着谪仙的风流往事。',
  wine: '金樽美酒，香气扑鼻。举杯邀明月，对影成三人，此刻正是人生得意时。',
  sword: '寒光闪闪，剑气如虹。这把长剑见证了多少江湖恩怨，承载着侠客的豪情壮志。',
  harp: '琴弦轻颤，余音绕梁。箜篌声中蕴含着无尽的诗意，如天籁之音般动人心弦。'
};
