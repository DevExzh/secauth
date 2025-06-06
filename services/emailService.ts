import { Account, EmailAccount, EmailVerification } from '@/types/auth';
import { getLogger } from '@/utils/logger';
import { LoggerScopes } from '@/utils/loggerConfig';

export interface EmailPermissions {
  accessInbox: boolean;
  deleteProcessed: boolean;
  secureConnection: boolean;
}

export interface EmailProvider {
  id: string;
  name: string;
  domain: string;
  imapServer: string;
  imapPort: number;
  smtpServer: string;
  smtpPort: number;
}

export const EMAIL_PROVIDERS: EmailProvider[] = [
  {
    id: 'gmail',
    name: 'Gmail',
    domain: 'gmail.com',
    imapServer: 'imap.gmail.com',
    imapPort: 993,
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
  },
  {
    id: 'outlook',
    name: 'Outlook',
    domain: 'outlook.com',
    imapServer: 'outlook.office365.com',
    imapPort: 993,
    smtpServer: 'smtp.office365.com',
    smtpPort: 587,
  },
  {
    id: 'yahoo',
    name: 'Yahoo',
    domain: 'yahoo.com',
    imapServer: 'imap.mail.yahoo.com',
    imapPort: 993,
    smtpServer: 'smtp.mail.yahoo.com',
    smtpPort: 587,
  },
];

export class EmailService {
  private static readonly logger = getLogger(LoggerScopes.SERVICES.EMAIL);
  private static connectedAccounts: EmailAccount[] = [];
  private static permissions: EmailPermissions = {
    accessInbox: false,
    deleteProcessed: false,
    secureConnection: true,
  };

  static async requestEmailPermissions(): Promise<boolean> {
    // In a real implementation, this would request actual email permissions
    // For now, we'll simulate the permission request
    return new Promise((resolve) => {
      setTimeout(() => {
        this.permissions = {
          accessInbox: true,
          deleteProcessed: true,
          secureConnection: true,
        };
        resolve(true);
      }, 1000);
    });
  }

  static getPermissions(): EmailPermissions {
    return this.permissions;
  }

  static async connectEmailAccount(email: string, password: string): Promise<EmailAccount> {
    // Simulate email account connection
    const provider = this.detectEmailProvider(email);
    
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          const account: EmailAccount = {
            id: Date.now().toString(),
            email,
            provider: provider.id as any,
            isConnected: true,
            lastSync: new Date(),
          };
          
          this.connectedAccounts.push(account);
          resolve(account);
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 2000);
    });
  }

  static async scanEmailsForAccounts(emailAccount: EmailAccount): Promise<Account[]> {
    // Simulate scanning emails for 2FA setup emails
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockAccounts: Account[] = [
          {
            id: 'email-1',
            name: 'Account 1',
            email: 'example@email.com',
            secret: 'JBSWY3DPEHPK3PXP',
            type: 'TOTP',
            category: 'Other',
            issuer: 'Example Service',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'email-2',
            name: 'Account 2',
            email: 'another@email.com',
            secret: 'HXDMVJECJJWSRB3HWIZR4IFUGFTMXBOZ',
            type: 'TOTP',
            category: 'Social',
            issuer: 'Social Platform',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'email-3',
            name: 'Account 3',
            email: 'secure@email.com',
            secret: 'MFRGG43FMZQW4ZZPO5SW45DFMQQGC43F',
            type: 'TOTP',
            category: 'Finance',
            issuer: 'Banking Service',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        resolve(mockAccounts);
      }, 1500);
    });
  }

  static async getEmailVerifications(emailAccount: EmailAccount): Promise<EmailVerification[]> {
    // Simulate getting email verifications
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockVerifications: EmailVerification[] = [
          {
            id: 'verify-1',
            from: 'noreply@service.com',
            subject: 'Verify your email address',
            code: '123456',
            expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
            isConfirmation: false,
            receivedAt: new Date(),
            isCompleted: false,
          },
          {
            id: 'verify-2',
            from: 'security@platform.com',
            subject: 'Confirm your account activation',
            isConfirmation: true,
            actionUrl: 'https://platform.com/confirm?token=abc123',
            receivedAt: new Date(),
            isCompleted: false,
          },
        ];
        resolve(mockVerifications);
      }, 1000);
    });
  }

  static async deleteProcessedEmails(emailIds: string[]): Promise<void> {
    // Simulate deleting processed emails
    this.logger.info('开始删除已处理的邮件', { 
      emailCount: emailIds.length,
      emailIds: emailIds.slice(0, 5) // 只记录前5个ID避免日志过长
    });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.logger.info('已完成邮件删除', { 
          deletedCount: emailIds.length,
          operation: 'delete_processed_emails'
        });
        resolve();
      }, 500);
    });
  }

  static getConnectedAccounts(): EmailAccount[] {
    return this.connectedAccounts;
  }

  private static detectEmailProvider(email: string): EmailProvider {
    const domain = email.split('@')[1]?.toLowerCase();
    return EMAIL_PROVIDERS.find(provider => provider.domain === domain) || EMAIL_PROVIDERS[0];
  }

  static async activateAccount(verificationId: string, actionUrl?: string): Promise<boolean> {
    // Simulate account activation
    this.logger.info('开始激活账户', { 
      verificationId,
      hasActionUrl: !!actionUrl,
      operation: 'activate_account'
    });
    
    return new Promise((resolve) => {
      setTimeout(() => {
        this.logger.info('账户激活成功', { 
          verificationId,
          actionUrl,
          operation: 'activate_account_success'
        });
        resolve(true);
      }, 1000);
    });
  }
} 