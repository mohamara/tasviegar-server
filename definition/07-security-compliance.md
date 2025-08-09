# 🔒 امنیت و انطباق - Settler App (ایران)

## نمای کلی
مستندات جامع امنیت و انطباق با قوانین ایران، محافظت از داده‌های کاربران ایرانی، و اجرای استانداردهای امنیتی محلی.

## 🛡️ امنیت سازمانی

### 1. **احراز هویت چندمرحله‌ای (2FA)**
```typescript
// Persian 2FA Implementation
interface Iran2FAConfig {
  smsProvider: 'farapayamak' | 'payam_resan' | 'ippanel';
  backupCodes: string[];
  totpSecret: string;
  recoveryMethods: ('sms' | 'email' | 'backup_codes')[];
}

class Iran2FAService {
  // SMS verification with Iranian providers
  async sendSMSCode(phoneNumber: string): Promise<void> {
    const iranianPhone = this.validateIranianPhone(phoneNumber);
    
    const message = `کد تایید Settler: ${generateCode()}
این کد تا ۵ دقیقه معتبر است.
هرگز این کد را با دیگران به اشتراک نگذارید.`;

    await this.smsProvider.send(iranianPhone, message);
    
    // Log for security audit
    await this.auditLog.record({
      action: 'SMS_2FA_SENT',
      userId: this.userId,
      phoneNumber: this.maskPhoneNumber(iranianPhone),
      timestamp: new Date(),
      ip: this.clientIP
    });
  }

  // Validate Iranian phone numbers
  private validateIranianPhone(phone: string): string {
    // Iranian mobile format: +98 9XX XXX XXXX
    const iranMobilePattern = /^(\+98|0)?9[0-9]{9}$/;
    
    if (!iranMobilePattern.test(phone)) {
      throw new SecurityError('شماره موبایل ایرانی معتبر وارد کنید');
    }
    
    // Convert to international format
    const cleanPhone = phone.replace(/^0/, '+98');
    return cleanPhone.startsWith('+98') ? cleanPhone : `+98${cleanPhone}`;
  }

  // Persian TOTP setup
  async setupTOTP(): Promise<{qrCode: string, backupCodes: string[], instructions: string}> {
    const secret = speakeasy.generateSecret({
      name: `Settler (${this.user.email})`,
      issuer: 'Settler Iran'
    });

    const backupCodes = this.generateBackupCodes();
    
    return {
      qrCode: qrcode.toDataURL(secret.otpauth_url),
      backupCodes,
      instructions: `
۱. اپلیکیشن Google Authenticator یا Authy را نصب کنید
۲. QR کد زیر را اسکن کنید
۳. کد تولید شده را وارد کنید
۴. کدهای پشتیبان را در جای امنی نگهداری کنید
      `
    };
  }
}
```

### 2. **رمزگذاری داده‌ها**
```typescript
// Encryption Service for Iran
class IranEncryptionService {
  private static readonly ENCRYPTION_KEY = process.env.IRAN_ENCRYPTION_KEY;
  private static readonly ALGORITHM = 'aes-256-gcm';

  // Encrypt sensitive Persian data
  static encryptPersianData(data: string): EncryptedData {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipher(this.ALGORITHM, this.ENCRYPTION_KEY);
    cipher.setAAD(Buffer.from('iran-settler-data'));

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      algorithm: this.ALGORITHM
    };
  }

  // Decrypt Persian data
  static decryptPersianData(encryptedData: EncryptedData): string {
    const decipher = crypto.createDecipher(
      encryptedData.algorithm, 
      this.ENCRYPTION_KEY
    );
    
    decipher.setAAD(Buffer.from('iran-settler-data'));
    decipher.setAuthTag(Buffer.from(encryptedData.authTag, 'hex'));

    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Field-level encryption for sensitive data
  static encryptSensitiveFields(userData: any): any {
    const sensitiveFields = ['nationalId', 'phoneNumber', 'bankAccount'];
    
    const encrypted = { ...userData };
    
    sensitiveFields.forEach(field => {
      if (encrypted[field]) {
        encrypted[field] = this.encryptPersianData(encrypted[field]);
      }
    });

    return encrypted;
  }
}
```

## 📋 انطباق با قوانین ایران

### 1. **حفاظت از داده‌های شخصی**
```typescript
// Iranian Personal Data Protection
interface IranianDataProtection {
  consentLevel: 'basic' | 'enhanced' | 'full';
  dataRetentionPeriod: number; // days
  rightToForget: boolean;
  dataLocalization: boolean;
  governmentAccess: boolean;
}

class IranDataProtectionService {
  // User consent management (Persian)
  async requestConsent(userId: string, dataTypes: string[]): Promise<ConsentRecord> {
    const consentText = this.generatePersianConsentText(dataTypes);
    
    const consent = await this.consentManager.create({
      userId,
      consentText,
      dataTypes,
      language: 'fa',
      requestedAt: new Date(),
      ipAddress: this.getClientIP(),
      userAgent: this.getUserAgent()
    });

    // Send consent request in Persian
    await this.notificationService.send({
      userId,
      type: 'CONSENT_REQUEST',
      title: 'درخواست اجازه استفاده از داده‌ها',
      message: consentText,
      action: {
        accept: 'موافقم',
        decline: 'مخالفم',
        moreInfo: 'اطلاعات بیشتر'
      }
    });

    return consent;
  }

  // Data export for Iranian users
  async exportUserData(userId: string): Promise<UserDataExport> {
    const userData = await this.getUserData(userId);
    
    return {
      exportDate: new Date(),
      persianExportDate: PersianDate.format(new Date()),
      user: userData.user,
      debts: userData.debts,
      groups: userData.groups,
      transactions: userData.transactions,
      auditLogs: userData.auditLogs,
      
      // Persian metadata
      metadata: {
        totalRecords: userData.totalRecords,
        dataTypes: ['اطلاعات کاربری', 'بدهی‌ها', 'گروه‌ها', 'تراکنش‌ها'],
        exportFormat: 'JSON',
        language: 'fa-IR'
      }
    };
  }

  // Right to be forgotten (Persian)
  async deleteUserAccount(userId: string, reason?: string): Promise<void> {
    // Verify user identity with 2FA
    await this.verify2FA(userId);

    // Create deletion audit record
    await this.auditLog.record({
      action: 'ACCOUNT_DELETION_REQUESTED',
      userId,
      reason: reason || 'کاربر درخواست حذف حساب کرده',
      timestamp: new Date(),
      iranianDate: PersianDate.format(new Date())
    });

    // Anonymize data (keep for legal requirements)
    await this.anonymizeUserData(userId);
    
    // Soft delete account
    await this.userService.softDelete(userId);

    // Notify user in Persian
    await this.emailService.send({
      to: user.email,
      subject: 'تایید حذف حساب کاربری',
      template: 'account-deletion-confirmation-fa',
      data: {
        firstName: user.firstName,
        deletionDate: PersianDate.format(new Date()),
        contactSupport: 'support@settler.ir'
      }
    });
  }
}
```

### 2. **گزارش‌دهی قانونی**
```typescript
// Legal reporting for Iranian authorities
class IranLegalComplianceService {
  // Generate reports for Iranian financial authorities
  async generateFinancialReport(
    startDate: Date, 
    endDate: Date
  ): Promise<IranFinancialReport> {
    const transactions = await this.getTransactionsInRange(startDate, endDate);
    
    // Filter high-value transactions (above threshold)
    const highValueTransactions = transactions.filter(
      t => t.amount > 50000000 // 5 million toman
    );

    return {
      reportId: `IR-${Date.now()}`,
      generatedAt: new Date(),
      persianGeneratedAt: PersianDate.format(new Date()),
      period: {
        from: PersianDate.format(startDate),
        to: PersianDate.format(endDate)
      },
      
      summary: {
        totalTransactions: transactions.length,
        totalAmount: transactions.reduce((sum, t) => sum + t.amount, 0),
        highValueTransactions: highValueTransactions.length,
        uniqueUsers: new Set(transactions.map(t => t.userId)).size
      },

      transactions: highValueTransactions.map(t => ({
        id: t.id,
        amount: t.amount,
        persianAmount: PersianNumber.formatCurrency(t.amount),
        date: PersianDate.format(t.createdAt),
        description: t.description,
        participants: t.participants,
        status: this.translateStatus(t.status)
      })),

      compliance: {
        amlChecks: 'completed',
        sanctionScreening: 'passed',
        taxReporting: 'pending'
      }
    };
  }

  // Anti-Money Laundering (AML) checks
  async performAMLCheck(transaction: Transaction): Promise<AMLResult> {
    const riskScore = await this.calculateRiskScore(transaction);
    
    const result: AMLResult = {
      transactionId: transaction.id,
      riskScore,
      riskLevel: this.determineRiskLevel(riskScore),
      checks: {
        amountThreshold: transaction.amount > 50000000,
        frequencyCheck: await this.checkTransactionFrequency(transaction.userId),
        patternAnalysis: await this.analyzeTransactionPattern(transaction.userId),
        sanctionScreening: await this.checkSanctions(transaction.participants)
      },
      action: this.determineAction(riskScore),
      notes: 'تراکنش مورد بررسی قرار گرفت'
    };

    // Log AML check
    await this.auditLog.record({
      action: 'AML_CHECK_PERFORMED',
      transactionId: transaction.id,
      riskScore,
      result: result.action,
      timestamp: new Date()
    });

    return result;
  }
}
```

## 🚨 تشخیص تقلب

### 1. **تحلیل رفتار کاربر**
```typescript
// Persian Fraud Detection System
class IranFraudDetectionService {
  // Analyze user behavior patterns
  async analyzeUserBehavior(userId: string): Promise<FraudAssessment> {
    const userActivity = await this.getUserActivity(userId);
    const behaviorPatterns = await this.analyzeBehaviorPatterns(userActivity);
    
    const indicators = {
      // Unusual login patterns
      suspiciousLogin: this.checkLoginPatterns(userActivity.logins),
      
      // High-frequency transactions
      highFrequency: this.checkTransactionFrequency(userActivity.transactions),
      
      // Unusual amount patterns  
      unusualAmounts: this.checkAmountPatterns(userActivity.transactions),
      
      // Device/IP changes
      deviceChanges: this.checkDevicePatterns(userActivity.devices),
      
      // Time-based anomalies
      timeAnomalies: this.checkTimePatterns(userActivity.timestamps)
    };

    const riskScore = this.calculateRiskScore(indicators);
    
    return {
      userId,
      riskScore,
      riskLevel: this.categorizeRisk(riskScore),
      indicators,
      recommendation: this.getRecommendation(riskScore),
      message: this.getPersianFraudMessage(riskScore),
      assessedAt: new Date(),
      persianAssessedAt: PersianDate.format(new Date())
    };
  }

  // Real-time transaction monitoring
  async monitorTransaction(transaction: Transaction): Promise<TransactionDecision> {
    const checks = await Promise.all([
      this.checkVelocityLimits(transaction),
      this.checkAmountLimits(transaction),
      this.checkGeolocation(transaction),
      this.checkDeviceFingerprint(transaction),
      this.checkBlacklist(transaction.participants)
    ]);

    const riskFactors = checks.filter(check => check.risk > 0.5);
    const totalRisk = checks.reduce((sum, check) => sum + check.risk, 0) / checks.length;

    let decision: 'approve' | 'decline' | 'review' = 'approve';
    let message = 'تراکنش تایید شد';

    if (totalRisk > 0.8) {
      decision = 'decline';
      message = 'تراکنش به دلیل ریسک بالا رد شد';
    } else if (totalRisk > 0.5) {
      decision = 'review';
      message = 'تراکنش نیاز به بررسی دارد';
    }

    // Log decision
    await this.auditLog.record({
      action: 'TRANSACTION_MONITORED',
      transactionId: transaction.id,
      decision,
      riskScore: totalRisk,
      riskFactors: riskFactors.map(rf => rf.reason),
      timestamp: new Date()
    });

    return {
      decision,
      message,
      riskScore: totalRisk,
      riskFactors,
      requiresManualReview: decision === 'review'
    };
  }
}
```

### 2. **محافظت از حساب**
```typescript
// Account Protection Service
class IranAccountProtectionService {
  // Suspicious activity detection
  async detectSuspiciousActivity(userId: string): Promise<SecurityAlert[]> {
    const alerts: SecurityAlert[] = [];
    const recentActivity = await this.getRecentActivity(userId, 24); // Last 24 hours

    // Check for multiple failed login attempts
    const failedLogins = recentActivity.filter(a => a.type === 'FAILED_LOGIN');
    if (failedLogins.length > 5) {
      alerts.push({
        type: 'MULTIPLE_FAILED_LOGINS',
        severity: 'high',
        message: 'تلاش‌های متعدد ورود ناموفق شناسایی شد',
        recommendation: 'تغییر رمز عبور توصیه می‌شود',
        detectedAt: new Date()
      });
    }

    // Check for unusual device access
    const deviceLogins = recentActivity.filter(a => a.type === 'DEVICE_LOGIN');
    const newDevices = deviceLogins.filter(d => d.isNewDevice);
    if (newDevices.length > 0) {
      alerts.push({
        type: 'NEW_DEVICE_ACCESS',
        severity: 'medium',
        message: 'ورود از دستگاه جدید شناسایی شد',
        recommendation: 'در صورت عدم اطلاع، رمز عبور را تغییر دهید',
        detectedAt: new Date()
      });
    }

    // Check for unusual location
    const locationLogins = recentActivity.filter(a => a.location);
    const unusualLocations = await this.detectUnusualLocations(userId, locationLogins);
    if (unusualLocations.length > 0) {
      alerts.push({
        type: 'UNUSUAL_LOCATION',
        severity: 'medium',
        message: 'ورود از مکان غیرمعمول شناسایی شد',
        recommendation: 'اگر شما بوده‌اید، نادیده بگیرید',
        detectedAt: new Date()
      });
    }

    return alerts;
  }

  // Account lockdown
  async lockdownAccount(userId: string, reason: string): Promise<void> {
    await this.userService.lockAccount(userId, {
      reason,
      lockedAt: new Date(),
      lockedBy: 'SECURITY_SYSTEM',
      requiresAdminUnlock: true
    });

    // Notify user in Persian
    await this.notificationService.send({
      userId,
      type: 'ACCOUNT_LOCKED',
      title: 'حساب کاربری قفل شد',
      message: `حساب شما به دلیل ${reason} موقتاً قفل شده است. لطفاً با پشتیبانی تماس بگیرید.`,
      priority: 'high',
      channels: ['sms', 'email']
    });

    // Create security incident
    await this.incidentService.create({
      type: 'ACCOUNT_LOCKDOWN',
      userId,
      reason,
      severity: 'high',
      status: 'open',
      assignedTo: 'security-team',
      createdAt: new Date()
    });
  }
}
```

## 📊 نظارت و Audit

### 1. **ثبت کامل فعالیت‌ها**
```typescript
// Comprehensive Audit Logging
class IranAuditService {
  // Persian audit log entry
  async logActivity(activity: AuditActivity): Promise<void> {
    const auditEntry = {
      id: generateId(),
      userId: activity.userId,
      action: activity.action,
      actionDescription: this.translateAction(activity.action),
      
      // Persian timestamps
      timestamp: new Date(),
      persianTimestamp: PersianDate.format(new Date(), 'YYYY/MM/DD HH:mm:ss'),
      jalaliDate: PersianDate.format(new Date(), 'dddd، DD MMMM YYYY'),
      
      // Request details
      ipAddress: activity.ipAddress,
      userAgent: activity.userAgent,
      geolocation: activity.geolocation,
      
      // Data changes
      beforeData: activity.beforeData,
      afterData: activity.afterData,
      
      // Security context
      sessionId: activity.sessionId,
      deviceId: activity.deviceId,
      
      // Compliance fields
      dataCategory: activity.dataCategory,
      legalBasis: activity.legalBasis,
      retentionPeriod: this.calculateRetentionPeriod(activity.action)
    };

    await this.auditRepository.create(auditEntry);
    
    // Real-time monitoring
    if (this.isHighRiskActivity(activity)) {
      await this.alertSecurityTeam(auditEntry);
    }
  }

  // Generate compliance report
  async generateComplianceReport(
    startDate: Date, 
    endDate: Date
  ): Promise<ComplianceReport> {
    const activities = await this.getAuditLogs(startDate, endDate);
    
    return {
      reportId: `AUDIT-${Date.now()}`,
      period: {
        from: PersianDate.format(startDate),
        to: PersianDate.format(endDate)
      },
      
      summary: {
        totalActivities: activities.length,
        uniqueUsers: new Set(activities.map(a => a.userId)).size,
        highRiskActivities: activities.filter(a => this.isHighRiskActivity(a)).length,
        dataModifications: activities.filter(a => a.afterData).length
      },

      categoryBreakdown: this.categorizeActivities(activities),
      
      securityIncidents: activities.filter(a => a.severity === 'high'),
      
      complianceStatus: {
        dataRetention: 'compliant',
        auditTrail: 'complete',
        encryptionStatus: 'active',
        accessControls: 'enforced'
      },

      generatedAt: new Date(),
      persianGeneratedAt: PersianDate.format(new Date()),
      language: 'fa-IR'
    };
  }
}
```

### 2. **نظارت Real-time**
```typescript
// Real-time Security Monitoring
class IranSecurityMonitoringService {
  private alerts: SecurityAlert[] = [];
  private metrics: SecurityMetrics = new SecurityMetrics();

  // Monitor security events
  async monitorSecurityEvents(): Promise<void> {
    // Set up real-time event listeners
    this.eventBus.on('user.login', this.handleLoginEvent.bind(this));
    this.eventBus.on('transaction.created', this.handleTransactionEvent.bind(this));
    this.eventBus.on('data.accessed', this.handleDataAccessEvent.bind(this));
    this.eventBus.on('permission.changed', this.handlePermissionEvent.bind(this));

    // Periodic security scans
    setInterval(() => {
      this.performSecurityScan();
    }, 60000); // Every minute

    // Daily security report
    setInterval(() => {
      this.generateDailySecurityReport();
    }, 24 * 60 * 60 * 1000); // Every 24 hours
  }

  // Handle login events
  private async handleLoginEvent(event: LoginEvent): Promise<void> {
    // Check for suspicious login patterns
    const suspiciousFactors = [];

    // Unusual time
    const hour = new Date().getHours();
    if (hour < 6 || hour > 23) {
      suspiciousFactors.push('ورود در ساعت غیرمعمول');
    }

    // New device
    if (event.isNewDevice) {
      suspiciousFactors.push('ورود از دستگاه جدید');
    }

    // Unusual location
    if (await this.isUnusualLocation(event.userId, event.geolocation)) {
      suspiciousFactors.push('ورود از مکان غیرمعمول');
    }

    if (suspiciousFactors.length > 0) {
      await this.createSecurityAlert({
        type: 'SUSPICIOUS_LOGIN',
        userId: event.userId,
        severity: suspiciousFactors.length > 2 ? 'high' : 'medium',
        factors: suspiciousFactors,
        message: `ورود مشکوک: ${suspiciousFactors.join('، ')}`,
        timestamp: new Date()
      });
    }
  }

  // Security metrics dashboard
  async getSecurityDashboard(): Promise<SecurityDashboard> {
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    return {
      timestamp: PersianDate.format(new Date()),
      
      authentication: {
        totalLogins: await this.countLogins(last24Hours),
        failedLogins: await this.countFailedLogins(last24Hours),
        suspiciousLogins: await this.countSuspiciousLogins(last24Hours),
        twoFactorEnabled: await this.count2FAEnabledUsers()
      },

      transactions: {
        totalTransactions: await this.countTransactions(last24Hours),
        flaggedTransactions: await this.countFlaggedTransactions(last24Hours),
        highValueTransactions: await this.countHighValueTransactions(last24Hours)
      },

      dataAccess: {
        sensitiveDataAccess: await this.countSensitiveDataAccess(last24Hours),
        unauthorizedAttempts: await this.countUnauthorizedAttempts(last24Hours),
        dataExports: await this.countDataExports(last24Hours)
      },

      alerts: {
        activeAlerts: this.alerts.filter(a => a.status === 'open').length,
        highSeverityAlerts: this.alerts.filter(a => a.severity === 'high').length,
        resolvedToday: await this.countResolvedAlerts(last24Hours)
      }
    };
  }
}
```

## 🤖 AI Prompt برای امنیت

```
شما مسئول پیاده‌سازی امنیت Settler برای ایران هستید. از این راهنماها استفاده کنید:

**امنیت احراز هویت:**
- پیاده‌سازی 2FA با پیامک ایرانی
- پشتیبانی از کیبورد فارسی در رمز عبور
- پیام‌های امنیتی به زبان فارسی
- تشخیص الگوهای مشکوک ایرانی

**حفاظت از داده:**
- رمزگذاری داده‌های فارسی
- نگهداری داده در ایران (data residency)
- انطباق با قوانین حریم خصوصی ایران
- backup امن با رمزگذاری

**تشخیص تقلب:**
- تحلیل الگوهای تراکنش ایرانی
- تشخیص فعالیت‌های مشکوک
- نظارت بر تراکنش‌های پرمبلغ
- هشدارهای فوری به فارسی

**انطباق قانونی:**
- گزارش‌دهی به مراجع ایرانی
- audit trail کامل
- حفظ داده‌ها طبق قوانین ایران
- پاسخ به درخواست‌های قانونی

**نظارت امنیتی:**
- monitoring 24/7
- dashboard امنیتی فارسی
- alert system هوشمند
- incident response plan

کد تولید شده باید با استانداردهای امنیتی بین‌المللی و قوانین ایران مطابقت داشته باشد.
``` 