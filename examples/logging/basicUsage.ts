/**
 * 基本日志使用示例
 * 展示如何使用不同日志等级和数据格式
 */

import { getLogger } from '@/utils/logger';

/**
 * 基本日志记录示例
 */
export class BasicLoggingExample {
  private logger = getLogger('examples.basicUsage');

  /**
   * 演示各种日志等级的使用
   */
  demonstrateLogLevels(): void {
    // DEBUG：调试信息，开发环境可见
    this.logger.debug('调试信息', { 
      variable: 'value',
      state: 'debugging'
    });

    // INFO：一般信息，记录程序运行状态
    this.logger.info('操作完成', { 
      operation: 'data_processing',
      duration: '100ms',
      itemsProcessed: 42
    });

    // WARN：警告信息，需要注意但不影响程序运行
    this.logger.warn('配置项缺失，使用默认值', { 
      missingConfig: 'timeout',
      defaultValue: 5000,
      recommendation: 'Please set timeout in config'
    });

    // ERROR：错误信息，记录异常和错误
    this.logger.error('操作失败', new Error('Network timeout'), { 
      retryCount: 3,
      lastAttempt: new Date().toISOString(),
      endpoint: '/api/data'
    });
  }

  /**
   * 演示结构化数据记录
   */
  demonstrateStructuredLogging(): void {
    // 记录用户操作
    this.logger.info('用户登录', {
      userId: 'user-123',
      loginMethod: 'biometric',
      timestamp: Date.now(),
      deviceInfo: {
        platform: 'ios',
        version: '15.0',
        model: 'iPhone 13'
      }
    });

    // 记录业务数据
    this.logger.info('账户添加成功', {
      accountType: 'TOTP',
      serviceName: 'GitHub',
      encrypted: true,
      metadata: {
        digits: 6,
        period: 30,
        algorithm: 'SHA1'
      }
    });

    // 记录性能数据
    this.logger.debug('性能指标', {
      operationName: 'generateOTP',
      executionTime: 15,
      memoryUsage: '2.5MB',
      cacheHit: true
    });
  }

  /**
   * 演示条件日志记录
   */
  demonstrateConditionalLogging(): void {
    const isDebugMode = true;
    const complexData = { /* 复杂的计算结果 */ };

    // 只在调试模式下记录详细信息
    if (isDebugMode) {
      this.logger.debug('详细调试信息', {
        complexData,
        calculationSteps: [
          'step1: validation',
          'step2: transformation', 
          'step3: output'
        ]
      });
    }

    // 记录关键操作（始终记录）
    this.logger.info('关键操作执行');
  }

  /**
   * 演示错误处理的最佳实践
   */
  demonstrateErrorHandling(): void {
    try {
      // 模拟可能出错的操作
      this.riskyOperation();
    } catch (error) {
      // 记录详细的错误信息
      this.logger.error('风险操作失败', error as Error, {
        operation: 'riskyOperation',
        context: 'basic_usage_example',
        additionalInfo: 'This is expected in the example'
      });
    }
  }

  private riskyOperation(): void {
    throw new Error('这是一个示例错误');
  }
}

/**
 * 运行基本示例
 */
export function runBasicExample(): void {
  console.log('=== 基本日志使用示例 ===');
  
  const example = new BasicLoggingExample();
  
  console.log('\n1. 演示日志等级：');
  example.demonstrateLogLevels();
  
  console.log('\n2. 演示结构化日志：');
  example.demonstrateStructuredLogging();
  
  console.log('\n3. 演示条件日志：');
  example.demonstrateConditionalLogging();
  
  console.log('\n4. 演示错误处理：');
  example.demonstrateErrorHandling();
} 