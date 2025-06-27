/**
 * 简单的测试运行器
 */
export class TestRunner {
  private tests: Test[] = [];
  private results: TestResult[] = [];

  /**
   * 添加测试
   */
  public addTest(name: string, testFn: () => boolean | Promise<boolean>): void {
    this.tests.push({ name, testFn });
  }

  /**
   * 运行所有测试
   */
  public async runTests(): Promise<TestResult[]> {
    console.log('🧪 开始运行测试...');
    this.results = [];

    for (const test of this.tests) {
      const startTime = performance.now();
      let passed = false;
      let error: string | null = null;

      try {
        const result = await test.testFn();
        passed = result;
      } catch (e) {
        error = e instanceof Error ? e.message : String(e);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      const result: TestResult = {
        name: test.name,
        passed,
        duration,
        error
      };

      this.results.push(result);
      
      const status = passed ? '✅' : '❌';
      console.log(`${status} ${test.name} (${duration.toFixed(2)}ms)`);
      
      if (error) {
        console.error(`   Error: ${error}`);
      }
    }

    this.printSummary();
    return this.results;
  }

  /**
   * 打印测试摘要
   */
  private printSummary(): void {
    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;
    const totalTime = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log('\n📊 测试摘要:');
    console.log(`   通过: ${passed}/${total}`);
    console.log(`   总时间: ${totalTime.toFixed(2)}ms`);
    
    if (passed === total) {
      console.log('🎉 所有测试通过！');
    } else {
      console.log('⚠️ 有测试失败');
    }
  }

  /**
   * 获取测试结果
   */
  public getResults(): TestResult[] {
    return [...this.results];
  }
}

/**
 * 测试接口
 */
interface Test {
  name: string;
  testFn: () => boolean | Promise<boolean>;
}

/**
 * 测试结果接口
 */
interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error: string | null;
}

/**
 * 创建应用测试套件
 */
export function createAppTestSuite(): TestRunner {
  const testRunner = new TestRunner();

  // 基础功能测试
  testRunner.addTest('DOM元素存在性检查', () => {
    const canvas = document.getElementById('three-canvas');
    const loadingScreen = document.getElementById('loading-screen');
    const uiOverlay = document.getElementById('ui-overlay');
    
    return !!(canvas && loadingScreen && uiOverlay);
  });

  testRunner.addTest('Three.js库加载检查', () => {
    return typeof THREE !== 'undefined';
  });

  testRunner.addTest('WebGL支持检查', () => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return !!gl;
  });

  testRunner.addTest('本地存储支持检查', () => {
    try {
      const testKey = 'test_storage';
      localStorage.setItem(testKey, 'test');
      const value = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      return value === 'test';
    } catch {
      return false;
    }
  });

  testRunner.addTest('音频上下文支持检查', () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      return !!AudioContext;
    } catch {
      return false;
    }
  });

  testRunner.addTest('指针锁定支持检查', () => {
    const canvas = document.createElement('canvas');
    return !!(canvas.requestPointerLock || (canvas as any).mozRequestPointerLock || (canvas as any).webkitRequestPointerLock);
  });

  testRunner.addTest('CSS自定义属性支持检查', () => {
    return CSS.supports('color', 'var(--test)');
  });

  testRunner.addTest('ES6模块支持检查', () => {
    return typeof Symbol !== 'undefined' && typeof Promise !== 'undefined';
  });

  // 性能测试
  testRunner.addTest('基础渲染性能测试', async () => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let frameCount = 0;
      const targetFrames = 60; // 测试60帧

      function testFrame() {
        frameCount++;
        if (frameCount >= targetFrames) {
          const endTime = performance.now();
          const duration = endTime - startTime;
          const fps = (frameCount * 1000) / duration;
          
          // 如果能达到30FPS以上就认为性能可接受
          resolve(fps >= 30);
        } else {
          requestAnimationFrame(testFrame);
        }
      }

      requestAnimationFrame(testFrame);
    });
  });

  // 内存测试
  testRunner.addTest('内存使用检查', () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1024 / 1024;
      
      // 如果内存使用超过100MB就警告
      if (usedMB > 100) {
        console.warn(`内存使用较高: ${usedMB.toFixed(2)}MB`);
      }
      
      return usedMB < 200; // 200MB以下认为可接受
    }
    return true; // 如果不支持内存API，跳过测试
  });

  return testRunner;
}

/**
 * 运行兼容性检查
 */
export function runCompatibilityCheck(): CompatibilityReport {
  const report: CompatibilityReport = {
    browser: getBrowserInfo(),
    webgl: checkWebGLSupport(),
    audio: checkAudioSupport(),
    storage: checkStorageSupport(),
    pointerLock: checkPointerLockSupport(),
    performance: checkPerformanceSupport(),
    overall: 'unknown'
  };

  // 计算总体兼容性
  const scores = [
    report.webgl.score,
    report.audio.score,
    report.storage.score,
    report.pointerLock.score,
    report.performance.score
  ];

  const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;

  if (averageScore >= 0.8) {
    report.overall = 'excellent';
  } else if (averageScore >= 0.6) {
    report.overall = 'good';
  } else if (averageScore >= 0.4) {
    report.overall = 'fair';
  } else {
    report.overall = 'poor';
  }

  return report;
}

/**
 * 获取浏览器信息
 */
function getBrowserInfo(): BrowserInfo {
  const userAgent = navigator.userAgent;
  
  let name = 'Unknown';
  let version = 'Unknown';

  if (userAgent.includes('Chrome')) {
    name = 'Chrome';
    const match = userAgent.match(/Chrome\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Firefox')) {
    name = 'Firefox';
    const match = userAgent.match(/Firefox\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Safari')) {
    name = 'Safari';
    const match = userAgent.match(/Version\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  } else if (userAgent.includes('Edge')) {
    name = 'Edge';
    const match = userAgent.match(/Edge\/(\d+)/);
    version = match ? match[1] : 'Unknown';
  }

  return { name, version, userAgent };
}

/**
 * 检查WebGL支持
 */
function checkWebGLSupport(): FeatureSupport {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    
    if (!gl) {
      return { supported: false, score: 0, details: 'WebGL not supported' };
    }

    const renderer = gl.getParameter(gl.RENDERER);
    const vendor = gl.getParameter(gl.VENDOR);
    
    return {
      supported: true,
      score: 1,
      details: `${vendor} ${renderer}`
    };
  } catch (error) {
    return {
      supported: false,
      score: 0,
      details: `Error: ${error}`
    };
  }
}

/**
 * 检查音频支持
 */
function checkAudioSupport(): FeatureSupport {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      return { supported: false, score: 0, details: 'AudioContext not supported' };
    }

    return { supported: true, score: 1, details: 'AudioContext supported' };
  } catch (error) {
    return { supported: false, score: 0, details: `Error: ${error}` };
  }
}

/**
 * 检查存储支持
 */
function checkStorageSupport(): FeatureSupport {
  try {
    const testKey = 'compatibility_test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return { supported: true, score: 1, details: 'localStorage supported' };
  } catch (error) {
    return { supported: false, score: 0, details: `localStorage error: ${error}` };
  }
}

/**
 * 检查指针锁定支持
 */
function checkPointerLockSupport(): FeatureSupport {
  const canvas = document.createElement('canvas');
  const supported = !!(canvas.requestPointerLock || 
                      (canvas as any).mozRequestPointerLock || 
                      (canvas as any).webkitRequestPointerLock);
  
  return {
    supported,
    score: supported ? 1 : 0.5, // 不是必需的，所以给0.5分
    details: supported ? 'Pointer Lock supported' : 'Pointer Lock not supported'
  };
}

/**
 * 检查性能API支持
 */
function checkPerformanceSupport(): FeatureSupport {
  const hasPerformance = 'performance' in window;
  const hasNow = hasPerformance && 'now' in performance;
  const hasMemory = hasPerformance && 'memory' in performance;
  
  let score = 0;
  if (hasNow) score += 0.5;
  if (hasMemory) score += 0.5;
  
  return {
    supported: hasPerformance,
    score,
    details: `Performance API: ${hasNow ? 'now' : ''} ${hasMemory ? 'memory' : ''}`
  };
}

// 接口定义
interface CompatibilityReport {
  browser: BrowserInfo;
  webgl: FeatureSupport;
  audio: FeatureSupport;
  storage: FeatureSupport;
  pointerLock: FeatureSupport;
  performance: FeatureSupport;
  overall: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
}

interface BrowserInfo {
  name: string;
  version: string;
  userAgent: string;
}

interface FeatureSupport {
  supported: boolean;
  score: number;
  details: string;
}
