# 日志系统使用示例

本目录包含了SecAuth统一日志中间件系统的使用示例代码。

## 文件说明

- `basicUsage.ts` - 基本日志记录用法示例
- `serviceIntegration.ts` - 服务层集成示例
- `componentIntegration.ts` - React组件集成示例  
- `errorHandling.ts` - 错误处理和异常日志示例
- `performanceMonitoring.ts` - 性能监控日志示例

## 快速开始

### 1. 基本使用

```typescript
import { getLogger } from '@/utils/logger';

const logger = getLogger('examples.basic');

logger.debug('调试信息', { variable: 'value' });
logger.info('操作完成', { duration: '100ms' });
logger.warn('警告信息', { reason: 'missing_config' });
logger.error('错误信息', new Error('Something went wrong'));
```

### 2. 在服务中使用

```typescript
import { getLogger } from '@/utils/logger';
import { LoggerScopes } from '@/utils/loggerConfig';

class MyService {
  private static readonly logger = getLogger(LoggerScopes.SERVICES.OTP);
  
  static async processData(data: any): Promise<any> {
    this.logger.info('开始处理数据', { itemCount: data.length });
    
    try {
      const result = await this.performProcessing(data);
      this.logger.info('数据处理完成', { resultCount: result.length });
      return result;
    } catch (error) {
      this.logger.error('数据处理失败', error as Error, { 
        originalData: data.length 
      });
      throw error;
    }
  }
}
```

### 3. 在React组件中使用

```typescript
import { getLogger } from '@/utils/logger';

const MyComponent: React.FC = () => {
  const logger = getLogger('components.myComponent');
  
  useEffect(() => {
    logger.info('组件已挂载');
    
    return () => {
      logger.debug('组件即将卸载');
    };
  }, []);
  
  const handleAction = () => {
    logger.info('用户触发操作');
    // 业务逻辑
  };
  
  return <button onClick={handleAction}>操作</button>;
};
```

## 配置示例

### 调整日志等级

```typescript
import { LoggerConfig } from '@/utils/loggerConfig';
import { LogLevel } from '@/utils/logger';

// 只显示警告和错误
LoggerConfig.setLevel(LogLevel.WARN);

// 只显示错误
LoggerConfig.setLevel(LogLevel.ERROR);

// 显示所有日志（包括调试信息）
LoggerConfig.setLevel(LogLevel.DEBUG);
```

### 作用域过滤

```typescript
// 只启用特定服务的日志
LoggerConfig.enableScopes(['services.otpService', 'services.accountService']);

// 禁用特定组件的日志
LoggerConfig.disableScopes(['components.ui', 'debug']);

// 启用所有作用域
LoggerConfig.enableAllScopes();
```

## 输出格式

日志系统根据不同级别使用相应的console方法输出：

- **DEBUG**: 使用 `console.debug()` (如果不支持则降级到 `console.log()`)
- **INFO**: 使用 `console.info()`  
- **WARN**: 使用 `console.warn()`
- **ERROR**: 使用 `console.error()`

所有日志都以JSON格式输出，包含以下字段：
- `timestamp`: ISO格式的时间戳
- `level`: 日志级别 (DEBUG, INFO, WARN, ERROR)
- `scope`: 作用域标识
- `message`: 日志消息
- `data`: 附加数据 (可选)
- `error`: 错误信息 (可选，包含name, message, stack)

示例输出：
```json
{"timestamp":"2025-06-06T19:15:00.000Z","level":"INFO","scope":"services.otpService","message":"生成TOTP码","data":{"accountId":"123","algorithm":"SHA1"}}
```

## 最佳实践

1. **使用预定义作用域**：优先使用`LoggerScopes`中定义的标准作用域
2. **结构化数据**：使用数据对象而不是字符串拼接
3. **错误上下文**：为错误日志提供完整的上下文信息
4. **性能考虑**：避免在日志消息中进行复杂计算
5. **一致性**：在同一模块中保持一致的日志风格
6. **开发工具友好**：利用不同console方法在开发工具中更好地过滤和查看日志

## 运行示例

每个示例文件都可以独立运行，导入相应的类或函数即可：

```typescript
import { OTPServiceExample } from './serviceIntegration';
import { AccountCardExample } from './componentIntegration';
import { ErrorHandlingExample } from './errorHandling';

// 创建实例并测试
const otpService = new OTPServiceExample();
const accountCard = new AccountCardExample();
const errorHandler = new ErrorHandlingExample();
``` 