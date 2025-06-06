/**
 * 日志系统配置文件
 * 提供应用启动时的日志配置初始化
 */

import { LogLevel, LoggerConfig as LoggerConfigUtils } from './logger';

/**
 * 开发环境配置
 */
const DEVELOPMENT_CONFIG = {
  level: LogLevel.DEBUG,
  enabledScopes: [], // 空数组表示启用所有作用域
  disabledScopes: [], // 可以在这里添加不需要的作用域
  enableTimestamp: true,
  enableJson: true,
};

/**
 * 生产环境配置
 */
const PRODUCTION_CONFIG = {
  level: LogLevel.WARN, // 生产环境只记录警告和错误
  enabledScopes: [], 
  disabledScopes: [
    'debug', // 禁用调试相关的日志
    'development', // 禁用开发相关的日志
  ],
  enableTimestamp: true,
  enableJson: true,
};

/**
 * 测试环境配置
 */
const TEST_CONFIG = {
  level: LogLevel.ERROR, // 测试环境只记录错误
  enabledScopes: [],
  disabledScopes: [],
  enableTimestamp: true,
  enableJson: true,
};

/**
 * 根据环境获取配置
 */
function getConfigForEnvironment() {
  // 在React Native中，__DEV__ 是内置的开发环境标识
  if (__DEV__) {
    return DEVELOPMENT_CONFIG;
  }
  
  // 可以通过环境变量或其他方式来区分测试和生产环境
  if (process.env.NODE_ENV === 'test') {
    return TEST_CONFIG;
  }
  
  return PRODUCTION_CONFIG;
}

/**
 * 初始化日志系统
 * 应该在应用启动时调用
 */
export function initializeLogger(): void {
  const config = getConfigForEnvironment();
  LoggerConfigUtils.updateGlobalConfig(config);
  
  // 如果是开发环境，可以输出一些有用的信息
  if (__DEV__) {
    // 在开发环境下，使用console.log显示初始化信息
    // 避免使用自己的日志系统造成循环依赖
    console.log(`Logger initialized with config: ${JSON.stringify({
      level: config.level,
      enabledScopesCount: config.enabledScopes?.length || 'all',
      disabledScopesCount: config.disabledScopes?.length || 0
    })}`);
    
    const availableLevels = Object.keys(LogLevel).filter(key => isNaN(Number(key)));
    console.log(`Available log levels: ${JSON.stringify(availableLevels)}`);
  }
}

/**
 * 动态调整日志配置的便捷函数
 */
export const LoggerConfigHelper = {
  /**
   * 启用调试模式
   */
  enableDebugMode: () => {
    LoggerConfigUtils.setLevel(LogLevel.DEBUG);
    LoggerConfigUtils.enableAllScopes();
  },

  /**
   * 启用生产模式
   */
  enableProductionMode: () => {
    LoggerConfigUtils.setLevel(LogLevel.WARN);
    LoggerConfigUtils.disableScopes(['debug', 'development']);
  },

  /**
   * 只启用特定服务的日志
   */
  enableOnlyServices: (services: string[]) => {
    const serviceScopes = services.map(service => `services.${service}`);
    LoggerConfigUtils.enableScopes(serviceScopes);
  },

  /**
   * 只启用特定组件的日志
   */
  enableOnlyComponents: (components: string[]) => {
    const componentScopes = components.map(component => `components.${component}`);
    LoggerConfigUtils.enableScopes(componentScopes);
  },

  /**
   * 禁用所有UI组件的日志
   */
  disableUILogs: () => {
    LoggerConfigUtils.disableScopes([
      'components.ui',
      'components.layout',
      'components.account',
      'components.profile',
    ]);
  },

  /**
   * 只保留错误日志
   */
  errorOnlyMode: () => {
    LoggerConfigUtils.setLevel(LogLevel.ERROR);
  },

  /**
   * 获取当前配置状态
   */
  getCurrentStatus: () => {
    const config = LoggerConfigUtils.getGlobalConfig();
    const scopes = LoggerConfigUtils.getAllScopes();
    
    return {
      level: LogLevel[config.level],
      enabledScopes: config.enabledScopes || 'All',
      disabledScopes: config.disabledScopes || 'None',
      activeScopes: scopes,
      totalScopes: scopes.length,
    };
  },

  /**
   * 重置到默认配置
   */
  resetToDefault: () => {
    initializeLogger();
  },
};

/**
 * 预定义的作用域常量
 * 帮助保持一致的命名规范
 */
export const LoggerScopes = {
  // 服务层
  SERVICES: {
    OTP: 'services.otpService',
    ACCOUNT: 'services.accountService', 
    CRYPTO: 'services.cryptoService',
    EMAIL: 'services.emailService',
    AUTH: 'services.biometricAuth',
    AUTO_LOCK: 'services.autoLock',
    BRAND_ICON: 'services.brandIconService',
  },
  
  // 组件层
  COMPONENTS: {
    ACCOUNT_CARD: 'components.account.AccountCard',
    EMAIL_PARSING: 'components.settings.EmailParsing',
    CONTEXT_MENU: 'components.ui.ContextMenu',
    VIEW_EMAIL_MODAL: 'components.ui.ViewEmailModal',
  },
  
  // 页面层
  SCREENS: {
    HOME: 'screens.home',
    ADD: 'screens.add',
    PROFILE: 'screens.profile',
    SETTINGS: 'screens.settings',
  },
  
  // 工具层
  UTILS: {
    I18N: 'utils.i18n',
    TOTP_PARSER: 'utils.totpParser',
    STYLE_HELPERS: 'utils.styleHelpers',
  },
  
  // 原生模块
  NATIVE: {
    CRYPTO: 'native.crypto',
    OTP: 'native.otp',
  },
  
  // Hooks层
  HOOKS: {
    DATA: 'hooks.useData',
    AUTH: 'hooks.useAuth',
    SETTINGS: 'hooks.useSettings',
  },
  
  // 性能监控
  PERFORMANCE: 'performance.monitoring',
}; 