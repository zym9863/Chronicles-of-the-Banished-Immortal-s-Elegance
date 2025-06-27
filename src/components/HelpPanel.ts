/**
 * 帮助面板
 */
export class HelpPanel {
  private panel: HTMLElement | null = null;
  private isVisible: boolean = false;

  constructor() {
    this.createPanel();
    this.setupEventListeners();
  }

  /**
   * 创建帮助面板
   */
  private createPanel(): void {
    this.panel = document.createElement('div');
    this.panel.id = 'help-panel';
    this.panel.className = 'help-panel hidden';
    
    this.panel.innerHTML = `
      <div class="help-content">
        <div class="help-header">
          <h2>游戏帮助</h2>
          <button class="close-btn" id="help-close">×</button>
        </div>
        
        <div class="help-body">
          <div class="help-section">
            <h3>🎮 基本操作</h3>
            <div class="help-item">
              <strong>WASD</strong> - 移动角色
            </div>
            <div class="help-item">
              <strong>鼠标移动</strong> - 控制视角
            </div>
            <div class="help-item">
              <strong>鼠标左键</strong> - 与物品交互
            </div>
            <div class="help-item">
              <strong>ESC</strong> - 打开/关闭设置面板
            </div>
            <div class="help-item">
              <strong>h</strong> - 打开/关闭帮助面板
            </div>
          </div>
          
          <div class="help-section">
            <h3>🏛️ 场景探索</h3>
            <div class="help-item">
              <strong>长安城</strong> - 探索古代长安城的壮丽建筑
            </div>
            <div class="help-item">
              <strong>巍巍高楼</strong> - 登高远眺，感受古都风貌
            </div>
            <div class="help-item">
              <strong>红楼</strong> - 体验古典建筑的精美
            </div>
            <div class="help-item">
              <strong>远山如黛</strong> - 欣赏远处的山峦美景
            </div>
          </div>
          
          <div class="help-section">
            <h3>🎵 交互物品</h3>
            <div class="help-item">
              <strong>玉笛</strong> - 点击聆听清音袅袅，感受谪仙的风雅
            </div>
            <div class="help-item">
              <strong>酒盏</strong> - 举杯邀明月，体验诗人的豪情
            </div>
            <div class="help-item">
              <strong>长剑</strong> - 感受侠客的豪情壮志
            </div>
            <div class="help-item">
              <strong>箜篌</strong> - 聆听天籁之音，感受古典音乐之美
            </div>
          </div>
          
          <div class="help-section">
            <h3>✨ 特殊效果</h3>
            <div class="help-item">
              <strong>发光动画</strong> - 可交互物品会发出柔和的光芒
            </div>
            <div class="help-item">
              <strong>浮动效果</strong> - 物品轻柔地上下浮动
            </div>
            <div class="help-item">
              <strong>诗词显示</strong> - 交互时会显示相关的古诗词
            </div>
            <div class="help-item">
              <strong>古风音效</strong> - 沉浸式的音频体验（开发中）
            </div>
          </div>
          
          <div class="help-section">
            <h3>⚙️ 设置选项</h3>
            <div class="help-item">
              <strong>画质设置</strong> - 调整渲染质量以适应设备性能
            </div>
            <div class="help-item">
              <strong>音频控制</strong> - 调整音量和音效设置
            </div>
            <div class="help-item">
              <strong>控制设置</strong> - 自定义鼠标灵敏度和移动速度
            </div>
            <div class="help-item">
              <strong>显示选项</strong> - 开启FPS显示和界面缩放
            </div>
          </div>
          
          <div class="help-section">
            <h3>🎨 关于作品</h3>
            <div class="help-item">
              <strong>主题</strong> - 以李白为原型的谪仙风流录
            </div>
            <div class="help-item">
              <strong>技术</strong> - 基于Three.js的3D交互式体验
            </div>
            <div class="help-item">
              <strong>风格</strong> - 古风主题，诗意盎然
            </div>
            <div class="help-item">
              <strong>体验</strong> - 沉浸式的古代文化探索
            </div>
          </div>
        </div>
        
        <div class="help-footer">
          <p>愿君在此古风世界中，感受谪仙的风流雅韵 ✨</p>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.panel);
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.panel) return;

    // 关闭按钮
    const closeBtn = this.panel.querySelector('#help-close') as HTMLButtonElement;
    closeBtn?.addEventListener('click', () => this.hide());

    // h键打开帮助
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h') {
        e.preventDefault();
        this.toggle();
      }
    });

    // 点击面板外部关闭
    this.panel.addEventListener('click', (e) => {
      if (e.target === this.panel) {
        this.hide();
      }
    });
  }

  /**
   * 显示面板
   */
  public show(): void {
    if (this.panel) {
      this.panel.classList.remove('hidden');
      this.isVisible = true;
    }
  }

  /**
   * 隐藏面板
   */
  public hide(): void {
    if (this.panel) {
      this.panel.classList.add('hidden');
      this.isVisible = false;
    }
  }

  /**
   * 切换面板显示状态
   */
  public toggle(): void {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show();
    }
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    if (this.panel && this.panel.parentNode) {
      this.panel.parentNode.removeChild(this.panel);
      this.panel = null;
    }
  }
}
