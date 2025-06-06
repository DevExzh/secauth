/**
 * 服务层日志集成示例
 * 展示如何在各种服务类中集成日志系统
 */

import { getLogger } from '@/utils/logger';
import { LoggerScopes } from '@/utils/loggerConfig';

// 模拟的Account类型
interface Account {
  id: string;
  name: string;
  secret: string;
  type: 'TOTP' | 'HOTP' | 'mOTP' | 'Steam';
}

/**
 * OTP服务使用示例
 */
export class OTPServiceExample {
  private static readonly logger = getLogger(LoggerScopes.SERVICES.OTP);

  static async generateTOTP(secret: string, timestamp?: number): Promise<string> {
    this.logger.info('开始生成TOTP', { 
      hasSecret: !!secret,
      timestamp: timestamp || Date.now(),
      operation: 'generateTOTP'
    });

    try {
      // 模拟OTP生成逻辑
      const code = this.simulateOTPGeneration(secret, timestamp);
      
      this.logger.debug('TOTP生成成功', { 
        codeLength: code.length,
        generatedAt: new Date().toISOString(),
        secretLength: secret.length
      });

      return code;
    } catch (error) {
      this.logger.error('TOTP生成失败', error as Error, { 
        secret: secret ? 'has_secret' : 'no_secret',
        timestamp,
        operation: 'generateTOTP'
      });
      throw error;
    }
  }

  private static simulateOTPGeneration(secret: string, timestamp?: number): string {
    this.logger.debug('执行OTP算法', { 
      algorithm: 'TOTP', 
      period: 30,
      secretProvided: !!secret
    });
    
    // 模拟生成6位数字代码
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static validateOTP(code: string, secret: string): boolean {
    this.logger.info('验证OTP代码', { 
      codeLength: code.length,
      hasSecret: !!secret
    });
    
    if (!code || code.length !== 6) {
      this.logger.warn('OTP代码格式无效', { 
        code: code ? `${code.length}位` : 'empty',
        expected: '6位数字'
      });
      return false;
    }

    // 模拟验证逻辑
    const isValid = /^\d{6}$/.test(code);
    
    if (isValid) {
      this.logger.info('OTP验证成功', { codeFormat: 'valid' });
    } else {
      this.logger.warn('OTP验证失败', { 
        reason: '格式不匹配',
        pattern: '^\\d{6}$'
      });
    }

    return isValid;
  }
}

/**
 * 账户服务使用示例
 */
export class AccountServiceExample {
  private static readonly logger = getLogger(LoggerScopes.SERVICES.ACCOUNT);

  static async addAccount(accountData: Partial<Account>): Promise<Account> {
    this.logger.info('添加新账户', { 
      name: accountData.name,
      type: accountData.type,
      hasSecret: !!accountData.secret,
      operation: 'addAccount'
    });

    try {
      this.validateAccountData(accountData);
      const account = await this.saveAccount(accountData);
      
      this.logger.info('账户添加成功', { 
        accountId: account.id,
        name: account.name,
        type: account.type
      });
      
      return account;
    } catch (error) {
      this.logger.error('账户添加失败', error as Error, {
        providedData: {
          hasName: !!accountData.name,
          hasSecret: !!accountData.secret,
          type: accountData.type
        }
      });
      throw error;
    }
  }

  private static validateAccountData(data: Partial<Account>): void {
    this.logger.debug('验证账户数据', {
      fieldsProvided: Object.keys(data),
      validation: 'starting'
    });
    
    if (!data.name) {
      const error = new Error('账户名称不能为空');
      this.logger.warn('账户验证失败', { 
        reason: 'missing_name',
        field: 'name'
      });
      throw error;
    }

    if (!data.secret) {
      const error = new Error('密钥不能为空');
      this.logger.warn('账户验证失败', { 
        reason: 'missing_secret',
        field: 'secret'
      });
      throw error;
    }

    this.logger.debug('账户数据验证通过', {
      nameLength: data.name.length,
      secretLength: data.secret.length,
      type: data.type
    });
  }

  private static async saveAccount(data: Partial<Account>): Promise<Account> {
    this.logger.debug('保存账户到存储', {
      operation: 'save_to_storage',
      dataType: 'encrypted'
    });
    
    // 模拟异步保存操作
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const account: Account = {
      id: `account_${Date.now()}`,
      name: data.name!,
      secret: data.secret!,
      type: data.type || 'TOTP'
    };
    
    this.logger.debug('账户保存完成', {
      accountId: account.id,
      storageOperation: 'success'
    });
    
    return account;
  }

  static async deleteAccount(accountId: string): Promise<void> {
    this.logger.info('删除账户', { 
      accountId,
      operation: 'deleteAccount'
    });

    try {
      // 模拟删除操作
      await new Promise(resolve => setTimeout(resolve, 50));
      
      this.logger.info('账户删除成功', { accountId });
    } catch (error) {
      this.logger.error('账户删除失败', error as Error, { accountId });
      throw error;
    }
  }
}

/**
 * 加密服务使用示例
 */
export class CryptoServiceExample {
  private static readonly logger = getLogger(LoggerScopes.SERVICES.CRYPTO);

  static async encryptData(data: string): Promise<string> {
    this.logger.info('开始数据加密', {
      dataLength: data.length,
      operation: 'encrypt'
    });

    try {
      // 模拟加密过程
      this.logger.debug('执行加密算法', {
        algorithm: 'AES-256',
        mode: 'GCM'
      });

      const encrypted = Buffer.from(data).toString('base64');
      
      this.logger.debug('数据加密完成', {
        originalLength: data.length,
        encryptedLength: encrypted.length,
        compressionRatio: (encrypted.length / data.length).toFixed(2)
      });

      return encrypted;
    } catch (error) {
      this.logger.error('数据加密失败', error as Error, {
        dataLength: data.length,
        algorithm: 'AES-256'
      });
      throw error;
    }
  }

  static async decryptData(encryptedData: string): Promise<string> {
    this.logger.info('开始数据解密', {
      encryptedLength: encryptedData.length,
      operation: 'decrypt'
    });

    try {
      // 模拟解密过程
      this.logger.debug('执行解密算法');

      const decrypted = Buffer.from(encryptedData, 'base64').toString();
      
      this.logger.debug('数据解密完成', {
        decryptedLength: decrypted.length
      });

      return decrypted;
    } catch (error) {
      this.logger.error('数据解密失败', error as Error, {
        encryptedLength: encryptedData.length
      });
      throw error;
    }
  }
}

/**
 * 运行服务集成示例
 */
export async function runServiceIntegrationExample(): Promise<void> {
  console.log('=== 服务层日志集成示例 ===');

  // OTP服务示例
  console.log('\n1. OTP服务示例：');
  try {
    const code = await OTPServiceExample.generateTOTP('JBSWY3DPEHPK3PXP');
    const isValid = OTPServiceExample.validateOTP(code, 'JBSWY3DPEHPK3PXP');
    console.log(`生成的代码: ${code}, 验证结果: ${isValid}`);
  } catch (error) {
    console.log('OTP服务示例出错:', error);
  }

  // 账户服务示例
  console.log('\n2. 账户服务示例：');
  try {
    const account = await AccountServiceExample.addAccount({
      name: '测试账户',
      secret: 'JBSWY3DPEHPK3PXP',
      type: 'TOTP'
    });
    console.log('创建的账户:', account);
    
    await AccountServiceExample.deleteAccount(account.id);
  } catch (error) {
    console.log('账户服务示例出错:', error);
  }

  // 加密服务示例
  console.log('\n3. 加密服务示例：');
  try {
    const originalData = '这是需要加密的敏感数据';
    const encrypted = await CryptoServiceExample.encryptData(originalData);
    const decrypted = await CryptoServiceExample.decryptData(encrypted);
    console.log(`原始数据: ${originalData}`);
    console.log(`解密数据: ${decrypted}`);
  } catch (error) {
    console.log('加密服务示例出错:', error);
  }
} 