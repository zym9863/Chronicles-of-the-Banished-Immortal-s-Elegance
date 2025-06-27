/**
 * 音频管理器
 */
export class AudioManager {
  private audioContext: AudioContext | null = null;
  private sounds: Map<string, AudioBuffer> = new Map();
  private sources: Map<string, AudioBufferSourceNode> = new Map();
  private gainNodes: Map<string, GainNode> = new Map();
  
  private masterVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private sfxVolume: number = 0.8;
  
  private isInitialized: boolean = false;

  constructor() {
    // 音频上下文需要用户交互后才能创建
    this.setupUserInteractionListener();
  }

  /**
   * 设置用户交互监听器
   */
  private setupUserInteractionListener(): void {
    const initAudio = () => {
      if (!this.isInitialized) {
        this.initAudioContext();
        document.removeEventListener('click', initAudio);
        document.removeEventListener('keydown', initAudio);
      }
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);
  }

  /**
   * 初始化音频上下文
   */
  private initAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.isInitialized = true;
      console.log('AudioManager initialized');
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }
  }

  /**
   * 加载音频文件
   */
  public async loadSound(name: string, url: string): Promise<void> {
    if (!this.audioContext) {
      console.warn('AudioContext not initialized');
      return;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      this.sounds.set(name, audioBuffer);
      console.log(`Sound loaded: ${name}`);
    } catch (error) {
      console.error(`Failed to load sound ${name}:`, error);
    }
  }

  /**
   * 播放音效
   */
  public playSound(name: string, loop: boolean = false, volume: number = 1.0): void {
    if (!this.audioContext || !this.sounds.has(name)) {
      console.warn(`Sound not found: ${name}`);
      return;
    }

    // 停止之前播放的同名音频
    this.stopSound(name);

    const audioBuffer = this.sounds.get(name)!;
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = audioBuffer;
    source.loop = loop;
    
    // 设置音量
    gainNode.gain.value = volume * this.sfxVolume * this.masterVolume;
    
    // 连接音频节点
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // 保存引用
    this.sources.set(name, source);
    this.gainNodes.set(name, gainNode);
    
    // 播放
    source.start();
    
    // 如果不是循环播放，播放结束后清理
    if (!loop) {
      source.onended = () => {
        this.cleanupSound(name);
      };
    }
  }

  /**
   * 播放背景音乐
   */
  public playMusic(name: string, volume: number = 1.0): void {
    if (!this.audioContext || !this.sounds.has(name)) {
      console.warn(`Music not found: ${name}`);
      return;
    }

    // 停止之前的背景音乐
    this.stopMusic();

    const audioBuffer = this.sounds.get(name)!;
    const source = this.audioContext.createBufferSource();
    const gainNode = this.audioContext.createGain();

    source.buffer = audioBuffer;
    source.loop = true;
    
    // 设置音量
    gainNode.gain.value = volume * this.musicVolume * this.masterVolume;
    
    // 连接音频节点
    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    // 保存引用（使用特殊的music键）
    this.sources.set('__background_music__', source);
    this.gainNodes.set('__background_music__', gainNode);
    
    // 播放
    source.start();
  }

  /**
   * 停止音效
   */
  public stopSound(name: string): void {
    const source = this.sources.get(name);
    if (source) {
      try {
        source.stop();
      } catch (error) {
        // 忽略已经停止的音频的错误
      }
      this.cleanupSound(name);
    }
  }

  /**
   * 停止背景音乐
   */
  public stopMusic(): void {
    this.stopSound('__background_music__');
  }

  /**
   * 停止所有音频
   */
  public stopAllSounds(): void {
    for (const name of this.sources.keys()) {
      this.stopSound(name);
    }
  }

  /**
   * 清理音频资源
   */
  private cleanupSound(name: string): void {
    this.sources.delete(name);
    this.gainNodes.delete(name);
  }

  /**
   * 设置主音量
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * 设置音效音量
   */
  public setSFXVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  /**
   * 设置音乐音量
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    // 更新背景音乐音量
    const musicGainNode = this.gainNodes.get('__background_music__');
    if (musicGainNode) {
      musicGainNode.gain.value = this.musicVolume * this.masterVolume;
    }
  }

  /**
   * 更新所有音频的音量
   */
  private updateAllVolumes(): void {
    for (const [name, gainNode] of this.gainNodes.entries()) {
      if (name === '__background_music__') {
        gainNode.gain.value = this.musicVolume * this.masterVolume;
      } else {
        gainNode.gain.value = this.sfxVolume * this.masterVolume;
      }
    }
  }

  /**
   * 获取主音量
   */
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * 获取音效音量
   */
  public getSFXVolume(): number {
    return this.sfxVolume;
  }

  /**
   * 获取音乐音量
   */
  public getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * 检查音频是否正在播放
   */
  public isPlaying(name: string): boolean {
    return this.sources.has(name);
  }

  /**
   * 检查是否有背景音乐在播放
   */
  public isMusicPlaying(): boolean {
    return this.isPlaying('__background_music__');
  }

  /**
   * 释放资源
   */
  public dispose(): void {
    this.stopAllSounds();
    
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.sounds.clear();
    this.isInitialized = false;
    
    console.log('AudioManager disposed');
  }
}
