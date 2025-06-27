/**
 * 设置面板管理器
 */
export class SettingsPanel {
  private panel: HTMLElement | null = null;
  private isVisible: boolean = false;
  private settings: GameSettings;
  
  // 回调函数
  private onSettingsChange: ((settings: GameSettings) => void) | null = null;

  constructor(initialSettings: GameSettings) {
    this.settings = { ...initialSettings };
    this.createPanel();
    this.setupEventListeners();
  }

  /**
   * 创建设置面板
   */
  private createPanel(): void {
    this.panel = document.createElement('div');
    this.panel.id = 'settings-panel';
    this.panel.className = 'settings-panel hidden';
    
    this.panel.innerHTML = `
      <div class="settings-content">
        <div class="settings-header">
          <h2>设置</h2>
          <button class="close-btn" id="settings-close">×</button>
        </div>
        
        <div class="settings-body">
          <div class="setting-group">
            <h3>图形设置</h3>
            
            <div class="setting-item">
              <label for="graphics-quality">画质:</label>
              <select id="graphics-quality">
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label for="shadow-quality">阴影质量:</label>
              <select id="shadow-quality">
                <option value="off">关闭</option>
                <option value="low">低</option>
                <option value="medium">中</option>
                <option value="high">高</option>
              </select>
            </div>
            
            <div class="setting-item">
              <label for="fog-enabled">雾效:</label>
              <input type="checkbox" id="fog-enabled">
            </div>
          </div>
          
          <div class="setting-group">
            <h3>音频设置</h3>
            
            <div class="setting-item">
              <label for="master-volume">主音量:</label>
              <input type="range" id="master-volume" min="0" max="100" step="1">
              <span class="volume-value">100%</span>
            </div>
            
            <div class="setting-item">
              <label for="music-volume">音乐音量:</label>
              <input type="range" id="music-volume" min="0" max="100" step="1">
              <span class="volume-value">70%</span>
            </div>
            
            <div class="setting-item">
              <label for="sfx-volume">音效音量:</label>
              <input type="range" id="sfx-volume" min="0" max="100" step="1">
              <span class="volume-value">80%</span>
            </div>
          </div>
          
          <div class="setting-group">
            <h3>控制设置</h3>
            
            <div class="setting-item">
              <label for="mouse-sensitivity">鼠标灵敏度:</label>
              <input type="range" id="mouse-sensitivity" min="0.1" max="3" step="0.1">
              <span class="sensitivity-value">1.0</span>
            </div>
            
            <div class="setting-item">
              <label for="move-speed">移动速度:</label>
              <input type="range" id="move-speed" min="5" max="20" step="1">
              <span class="speed-value">10</span>
            </div>
            
            <div class="setting-item">
              <label for="invert-mouse">反转鼠标Y轴:</label>
              <input type="checkbox" id="invert-mouse">
            </div>
          </div>
          
          <div class="setting-group">
            <h3>显示设置</h3>
            
            <div class="setting-item">
              <label for="show-fps">显示FPS:</label>
              <input type="checkbox" id="show-fps">
            </div>
            
            <div class="setting-item">
              <label for="ui-scale">界面缩放:</label>
              <select id="ui-scale">
                <option value="0.8">小</option>
                <option value="1.0">正常</option>
                <option value="1.2">大</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="settings-footer">
          <button class="btn btn-primary" id="apply-settings">应用</button>
          <button class="btn btn-secondary" id="reset-settings">重置</button>
        </div>
      </div>
    `;
    
    document.body.appendChild(this.panel);
    this.updateUI();
  }

  /**
   * 设置事件监听器
   */
  private setupEventListeners(): void {
    if (!this.panel) return;

    // 关闭按钮
    const closeBtn = this.panel.querySelector('#settings-close') as HTMLButtonElement;
    closeBtn?.addEventListener('click', () => this.hide());

    // 应用按钮
    const applyBtn = this.panel.querySelector('#apply-settings') as HTMLButtonElement;
    applyBtn?.addEventListener('click', () => this.applySettings());

    // 重置按钮
    const resetBtn = this.panel.querySelector('#reset-settings') as HTMLButtonElement;
    resetBtn?.addEventListener('click', () => this.resetSettings());

    // 音量滑块实时更新显示
    const volumeSliders = this.panel.querySelectorAll('input[type="range"]');
    volumeSliders.forEach(slider => {
      slider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.updateSliderDisplay(target);
      });
    });

    // ESC键关闭面板
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.hide();
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
   * 更新滑块显示值
   */
  private updateSliderDisplay(slider: HTMLInputElement): void {
    const value = parseFloat(slider.value);
    let displayValue = '';
    let targetElement: HTMLElement | null = null;

    switch (slider.id) {
      case 'master-volume':
      case 'music-volume':
      case 'sfx-volume':
        displayValue = `${Math.round(value)}%`;
        targetElement = slider.parentElement?.querySelector('.volume-value') as HTMLElement;
        break;
      case 'mouse-sensitivity':
        displayValue = value.toFixed(1);
        targetElement = slider.parentElement?.querySelector('.sensitivity-value') as HTMLElement;
        break;
      case 'move-speed':
        displayValue = Math.round(value).toString();
        targetElement = slider.parentElement?.querySelector('.speed-value') as HTMLElement;
        break;
    }

    if (targetElement) {
      targetElement.textContent = displayValue;
    }
  }

  /**
   * 更新UI显示当前设置
   */
  private updateUI(): void {
    if (!this.panel) return;

    // 图形设置
    (this.panel.querySelector('#graphics-quality') as HTMLSelectElement).value = this.settings.graphics.quality;
    (this.panel.querySelector('#shadow-quality') as HTMLSelectElement).value = this.settings.graphics.shadowQuality;
    (this.panel.querySelector('#fog-enabled') as HTMLInputElement).checked = this.settings.graphics.fogEnabled;

    // 音频设置
    const masterVolume = this.panel.querySelector('#master-volume') as HTMLInputElement;
    masterVolume.value = (this.settings.audio.masterVolume * 100).toString();
    this.updateSliderDisplay(masterVolume);

    const musicVolume = this.panel.querySelector('#music-volume') as HTMLInputElement;
    musicVolume.value = (this.settings.audio.musicVolume * 100).toString();
    this.updateSliderDisplay(musicVolume);

    const sfxVolume = this.panel.querySelector('#sfx-volume') as HTMLInputElement;
    sfxVolume.value = (this.settings.audio.sfxVolume * 100).toString();
    this.updateSliderDisplay(sfxVolume);

    // 控制设置
    const mouseSensitivity = this.panel.querySelector('#mouse-sensitivity') as HTMLInputElement;
    mouseSensitivity.value = this.settings.controls.mouseSensitivity.toString();
    this.updateSliderDisplay(mouseSensitivity);

    const moveSpeed = this.panel.querySelector('#move-speed') as HTMLInputElement;
    moveSpeed.value = this.settings.controls.moveSpeed.toString();
    this.updateSliderDisplay(moveSpeed);

    (this.panel.querySelector('#invert-mouse') as HTMLInputElement).checked = this.settings.controls.invertMouse;

    // 显示设置
    (this.panel.querySelector('#show-fps') as HTMLInputElement).checked = this.settings.display.showFPS;
    (this.panel.querySelector('#ui-scale') as HTMLSelectElement).value = this.settings.display.uiScale.toString();
  }

  /**
   * 应用设置
   */
  private applySettings(): void {
    if (!this.panel) return;

    // 读取所有设置值
    this.settings.graphics.quality = (this.panel.querySelector('#graphics-quality') as HTMLSelectElement).value as 'low' | 'medium' | 'high';
    this.settings.graphics.shadowQuality = (this.panel.querySelector('#shadow-quality') as HTMLSelectElement).value as 'off' | 'low' | 'medium' | 'high';
    this.settings.graphics.fogEnabled = (this.panel.querySelector('#fog-enabled') as HTMLInputElement).checked;

    this.settings.audio.masterVolume = parseFloat((this.panel.querySelector('#master-volume') as HTMLInputElement).value) / 100;
    this.settings.audio.musicVolume = parseFloat((this.panel.querySelector('#music-volume') as HTMLInputElement).value) / 100;
    this.settings.audio.sfxVolume = parseFloat((this.panel.querySelector('#sfx-volume') as HTMLInputElement).value) / 100;

    this.settings.controls.mouseSensitivity = parseFloat((this.panel.querySelector('#mouse-sensitivity') as HTMLInputElement).value);
    this.settings.controls.moveSpeed = parseFloat((this.panel.querySelector('#move-speed') as HTMLInputElement).value);
    this.settings.controls.invertMouse = (this.panel.querySelector('#invert-mouse') as HTMLInputElement).checked;

    this.settings.display.showFPS = (this.panel.querySelector('#show-fps') as HTMLInputElement).checked;
    this.settings.display.uiScale = parseFloat((this.panel.querySelector('#ui-scale') as HTMLSelectElement).value);

    // 保存到本地存储
    this.saveSettings();

    // 触发回调
    if (this.onSettingsChange) {
      this.onSettingsChange(this.settings);
    }

    console.log('设置已应用');
  }

  /**
   * 重置设置
   */
  private resetSettings(): void {
    this.settings = getDefaultSettings();
    this.updateUI();
    this.applySettings();
  }

  /**
   * 保存设置到本地存储
   */
  private saveSettings(): void {
    localStorage.setItem('chronicles_settings', JSON.stringify(this.settings));
  }

  /**
   * 从本地存储加载设置
   */
  public static loadSettings(): GameSettings {
    const saved = localStorage.getItem('chronicles_settings');
    if (saved) {
      try {
        return { ...getDefaultSettings(), ...JSON.parse(saved) };
      } catch (error) {
        console.warn('Failed to load settings:', error);
      }
    }
    return getDefaultSettings();
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
   * 设置变更回调
   */
  public setOnSettingsChange(callback: (settings: GameSettings) => void): void {
    this.onSettingsChange = callback;
  }

  /**
   * 获取当前设置
   */
  public getSettings(): GameSettings {
    return { ...this.settings };
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

/**
 * 游戏设置接口
 */
export interface GameSettings {
  graphics: {
    quality: 'low' | 'medium' | 'high';
    shadowQuality: 'off' | 'low' | 'medium' | 'high';
    fogEnabled: boolean;
  };
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
  };
  controls: {
    mouseSensitivity: number;
    moveSpeed: number;
    invertMouse: boolean;
  };
  display: {
    showFPS: boolean;
    uiScale: number;
  };
}

/**
 * 获取默认设置
 */
export function getDefaultSettings(): GameSettings {
  return {
    graphics: {
      quality: 'medium',
      shadowQuality: 'medium',
      fogEnabled: true
    },
    audio: {
      masterVolume: 1.0,
      musicVolume: 0.7,
      sfxVolume: 0.8
    },
    controls: {
      mouseSensitivity: 1.0,
      moveSpeed: 10,
      invertMouse: false
    },
    display: {
      showFPS: false,
      uiScale: 1.0
    }
  };
}
