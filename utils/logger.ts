/**
 * 统一日志中间件系统
 * 提供分层级、分作用域的日志记录功能
 */

/**
 * 日志等级枚举
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4, // 禁用所有日志
}

/**
 * 日志配置接口
 */
export interface LoggerConfig {
  level: LogLevel;
  enabledScopes?: string[]; // 启用的作用域列表，空数组表示全部启用
  disabledScopes?: string[]; // 禁用的作用域列表
  enableTimestamp?: boolean; // 是否启用时间戳，默认true
  enableJson?: boolean; // 是否使用JSON格式，默认true
}

/**
 * 日志条目接口
 */
interface LogEntry {
  timestamp: string;
  level: string;
  scope: string;
  message: string;
  data?: any;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

/**
 * Logger类 - 单个作用域的日志记录器
 */
export class Logger {
  private scope: string;
  private config: LoggerConfig;

  constructor(scope: string, config: LoggerConfig) {
    this.scope = scope;
    this.config = config;
  }

  /**
   * 检查当前作用域是否应该记录日志
   */
  private shouldLog(level: LogLevel): boolean {
    // 检查日志等级
    if (level < this.config.level) {
      return false;
    }

    // 检查作用域配置
    if (this.config.disabledScopes?.includes(this.scope)) {
      return false;
    }

    if (this.config.enabledScopes && this.config.enabledScopes.length > 0) {
      return this.config.enabledScopes.includes(this.scope);
    }

    return true;
  }

  /**
   * 格式化日志条目
   */
  private formatLogEntry(level: LogLevel, message: string, data?: any, error?: Error): string {
    const levelName = LogLevel[level];
    const timestamp = new Date().toISOString();

    const logEntry: LogEntry = {
      timestamp,
      level: levelName,
      scope: this.scope,
      message,
    };

    if (data !== undefined) {
      logEntry.data = data;
    }

    if (error) {
      logEntry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (this.config.enableJson !== false) {
      return JSON.stringify(logEntry);
    } else {
      // 简单文本格式
      let logMessage = `[${timestamp}] [${levelName}] [${this.scope}] ${message}`;
      if (data !== undefined) {
        logMessage += ` | Data: ${JSON.stringify(data)}`;
      }
      if (error) {
        logMessage += ` | Error: ${error.message}`;
      }
      return logMessage;
    }
  }

  /**
   * 根据日志级别输出到相应的console方法
   */
  private output(level: LogLevel, logMessage: string): void {
    switch (level) {
      case LogLevel.DEBUG:
        // 使用console.debug，如果不存在则降级到console.log
        if (console.debug) {
          console.debug(logMessage);
        } else {
          console.log(logMessage);
        }
        break;
      case LogLevel.INFO:
        console.info(logMessage);
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.ERROR:
        console.error(logMessage);
        break;
      default:
        console.log(logMessage);
        break;
    }
  }

  /**
   * 记录日志的通用方法
   */
  private log(level: LogLevel, message: string, data?: any, error?: Error): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logMessage = this.formatLogEntry(level, message, data, error);
    this.output(level, logMessage);
  }

  /**
   * DEBUG级别日志
   */
  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  /**
   * INFO级别日志
   */
  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  /**
   * WARN级别日志
   */
  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  /**
   * ERROR级别日志
   */
  error(message: string, error?: Error, data?: any): void {
    this.log(LogLevel.ERROR, message, data, error);
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前作用域
   */
  getScope(): string {
    return this.scope;
  }
}

/**
 * LoggerManager - 管理所有Logger实例的单例类
 */
class LoggerManager {
  private static instance: LoggerManager;
  private loggers: Map<string, Logger> = new Map();
  private globalConfig: LoggerConfig = {
    level: LogLevel.INFO,
    enableTimestamp: true,
    enableJson: true,
  };

  private constructor() {}

  /**
   * 获取LoggerManager单例
   */
  static getInstance(): LoggerManager {
    if (!LoggerManager.instance) {
      LoggerManager.instance = new LoggerManager();
    }
    return LoggerManager.instance;
  }

  /**
   * 获取指定作用域的Logger
   */
  getLogger(scope: string): Logger {
    if (!this.loggers.has(scope)) {
      const logger = new Logger(scope, { ...this.globalConfig });
      this.loggers.set(scope, logger);
    }
    return this.loggers.get(scope)!;
  }

  /**
   * 更新全局配置
   */
  updateGlobalConfig(config: Partial<LoggerConfig>): void {
    this.globalConfig = { ...this.globalConfig, ...config };
    
    // 更新所有现有Logger的配置
    this.loggers.forEach(logger => {
      logger.updateConfig(this.globalConfig);
    });
  }

  /**
   * 更新特定作用域的配置
   */
  updateScopeConfig(scope: string, config: Partial<LoggerConfig>): void {
    const logger = this.getLogger(scope);
    logger.updateConfig(config);
  }

  /**
   * 设置日志等级
   */
  setLogLevel(level: LogLevel): void {
    this.updateGlobalConfig({ level });
  }

  /**
   * 启用特定作用域
   */
  enableScopes(scopes: string[]): void {
    this.updateGlobalConfig({ enabledScopes: scopes });
  }

  /**
   * 禁用特定作用域
   */
  disableScopes(scopes: string[]): void {
    this.updateGlobalConfig({ disabledScopes: scopes });
  }

  /**
   * 清除所有作用域限制
   */
  enableAllScopes(): void {
    this.updateGlobalConfig({ enabledScopes: [], disabledScopes: [] });
  }

  /**
   * 获取所有已创建的Logger作用域
   */
  getAllScopes(): string[] {
    return Array.from(this.loggers.keys());
  }

  /**
   * 获取当前全局配置
   */
  getGlobalConfig(): LoggerConfig {
    return { ...this.globalConfig };
  }
}

/**
 * 导出便捷的获取Logger的函数
 */
export function getLogger(scope: string): Logger {
  return LoggerManager.getInstance().getLogger(scope);
}

/**
 * 导出LoggerManager实例
 */
export const loggerManager = LoggerManager.getInstance();

/**
 * 导出便捷的配置函数
 */
export const LoggerConfig = {
  setLevel: (level: LogLevel) => loggerManager.setLogLevel(level),
  enableScopes: (scopes: string[]) => loggerManager.enableScopes(scopes),
  disableScopes: (scopes: string[]) => loggerManager.disableScopes(scopes),
  enableAllScopes: () => loggerManager.enableAllScopes(),
  updateGlobalConfig: (config: Partial<LoggerConfig>) => loggerManager.updateGlobalConfig(config),
  getGlobalConfig: () => loggerManager.getGlobalConfig(),
  getAllScopes: () => loggerManager.getAllScopes(),
}; 