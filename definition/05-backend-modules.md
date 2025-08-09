# ⚙️ Backend Modules - Settler App

## Overview
The Settler backend follows **Clean Architecture** principles with **Domain-Driven Design (DDD)**. Each module encapsulates specific business logic with clear boundaries and responsibilities.

## 🏗️ Module Architecture

### Structure Pattern
```
src/
├── modules/
│   ├── auth/
│   │   ├── domain/          # Business entities & rules
│   │   ├── application/     # Use cases & services
│   │   ├── infrastructure/  # External concerns
│   │   └── presentation/    # Controllers & DTOs
│   ├── users/
│   ├── debts/
│   ├── groups/
│   ├── settlements/
│   └── notifications/
├── shared/                  # Cross-cutting concerns
│   ├── domain/
│   ├── infrastructure/
│   └── presentation/
└── main.ts                 # Application entry point
```

---

## 🔐 Authentication Module

### Domain Layer
```typescript
// domain/entities/user.entity.ts
export class User {
  constructor(
    private readonly id: UserId,
    private email: Email,
    private passwordHash: PasswordHash,
    private profile: UserProfile,
    private security: SecuritySettings,
    private readonly createdAt: Date
  ) {}

  public changePassword(
    currentPassword: string,
    newPassword: string,
    passwordService: IPasswordService
  ): void {
    if (!passwordService.verify(currentPassword, this.passwordHash)) {
      throw new InvalidPasswordError();
    }
    
    this.passwordHash = passwordService.hash(newPassword);
    this.raiseEvent(new PasswordChangedEvent(this.id));
  }

  public enableTwoFactor(secret: string): void {
    this.security.enableTwoFactor(secret);
    this.raiseEvent(new TwoFactorEnabledEvent(this.id));
  }

  public verifyTwoFactor(code: string): boolean {
    return this.security.verifyTwoFactor(code);
  }
}

// domain/value-objects/email.vo.ts
export class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new InvalidEmailError(value);
    }
  }

  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  public getValue(): string {
    return this.value;
  }
}
```

### Application Layer
```typescript
// application/use-cases/register-user.use-case.ts
@Injectable()
export class RegisterUserUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly emailService: IEmailService,
    private readonly eventBus: IEventBus
  ) {}

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(command.email);
    if (existingUser) {
      throw new UserAlreadyExistsError(command.email);
    }

    // Create new user
    const hashedPassword = await this.passwordService.hash(command.password);
    const user = User.create({
      email: new Email(command.email),
      passwordHash: new PasswordHash(hashedPassword),
      profile: UserProfile.create({
        firstName: command.firstName,
        lastName: command.lastName
      })
    });

    // Save user
    await this.userRepository.save(user);

    // Send verification email
    await this.emailService.sendVerificationEmail(user.getEmail());

    // Publish events
    await this.eventBus.publishAll(user.getUncommittedEvents());

    return RegisterUserResult.success(user.getId());
  }
}

// application/services/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordService: IPasswordService,
    private readonly jwtService: JwtService,
    private readonly twoFactorService: ITwoFactorService
  ) {}

  async login(request: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new InvalidCredentialsError();
    }

    // Verify password
    const isPasswordValid = await this.passwordService.verify(
      request.password,
      user.getPasswordHash()
    );
    if (!isPasswordValid) {
      throw new InvalidCredentialsError();
    }

    // Check 2FA if enabled
    if (user.isTwoFactorEnabled()) {
      if (!request.twoFactorCode) {
        throw new TwoFactorRequiredError();
      }
      
      const isTwoFactorValid = this.twoFactorService.verify(
        request.twoFactorCode,
        user.getTwoFactorSecret()
      );
      if (!isTwoFactorValid) {
        throw new InvalidTwoFactorCodeError();
      }
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);
    
    // Update last login
    user.updateLastLogin();
    await this.userRepository.save(user);

    return LoginResponse.success(user, tokens);
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload = {
      sub: user.getId().getValue(),
      email: user.getEmail().getValue(),
      role: user.getRole()
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m'
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d'
    });

    return new AuthTokens(accessToken, refreshToken);
  }
}
```

### Infrastructure Layer
```typescript
// infrastructure/repositories/user.repository.ts
@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mapper: UserMapper
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        securitySettings: true
      }
    });

    return userData ? this.mapper.toDomain(userData) : null;
  }

  async save(user: User): Promise<void> {
    const data = this.mapper.toPersistence(user);
    
    await this.prisma.user.upsert({
      where: { id: data.id },
      create: data,
      update: data
    });
  }

  async findById(id: UserId): Promise<User | null> {
    const userData = await this.prisma.user.findUnique({
      where: { id: id.getValue() },
      include: {
        profile: true,
        securitySettings: true
      }
    });

    return userData ? this.mapper.toDomain(userData) : null;
  }
}

// infrastructure/services/password.service.ts
@Injectable()
export class PasswordService implements IPasswordService {
  private readonly saltRounds = 12;

  async hash(password: string): Promise<string> {
    return bcrypt.hash(password, this.saltRounds);
  }

  async verify(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  validateStrength(password: string): PasswordValidationResult {
    const checks = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    const score = Object.values(checks).filter(Boolean).length;
    const strength = score < 3 ? 'weak' : score < 5 ? 'medium' : 'strong';

    return new PasswordValidationResult(checks, strength);
  }
}
```

### Presentation Layer
```typescript
// presentation/controllers/auth.controller.ts
@Controller('auth')
@ApiTags('Authentication')
export class AuthController {
  constructor(
    private readonly registerUserUseCase: RegisterUserUseCase,
    private readonly authService: AuthService
  ) {}

  @Post('register')
  @ApiOperation({ summary: 'Register new user' })
  @ApiResponse({ status: 201, type: RegisterUserResponseDto })
  async register(@Body() dto: RegisterUserDto): Promise<RegisterUserResponseDto> {
    const command = new RegisterUserCommand(
      dto.email,
      dto.password,
      dto.firstName,
      dto.lastName,
      dto.phone
    );

    const result = await this.registerUserUseCase.execute(command);
    
    return RegisterUserResponseDto.fromResult(result);
  }

  @Post('login')
  @ApiOperation({ summary: 'User login' })
  @ApiResponse({ status: 200, type: LoginResponseDto })
  async login(@Body() dto: LoginDto): Promise<LoginResponseDto> {
    const request = new LoginRequest(
      dto.email,
      dto.password,
      dto.twoFactorCode
    );

    const response = await this.authService.login(request);
    
    return LoginResponseDto.fromResponse(response);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token' })
  async refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokensDto> {
    const tokens = await this.authService.refreshTokens(dto.refreshToken);
    return AuthTokensDto.fromTokens(tokens);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout user' })
  async logout(@Request() req): Promise<{ message: string }> {
    await this.authService.logout(req.user.sub);
    return { message: 'Logout successful' };
  }
}

// presentation/dtos/register-user.dto.ts
export class RegisterUserDto {
  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SecurePassword123!' })
  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain uppercase, lowercase and number'
  })
  password: string;

  @ApiProperty({ example: 'John' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;
}
```

---

## 💰 Debt Management Module

### Domain Layer
```typescript
// domain/entities/debt.entity.ts
export class Debt extends AggregateRoot {
  constructor(
    private readonly id: DebtId,
    private readonly creditorId: UserId,
    private readonly debtorId: UserId,
    private amount: Money,
    private description: Description,
    private status: DebtStatus,
    private readonly createdAt: Date,
    private dueDate?: Date,
    private category?: DebtCategory,
    private groupId?: GroupId
  ) {
    super();
    this.validateParties();
  }

  private validateParties(): void {
    if (this.creditorId.equals(this.debtorId)) {
      throw new CannotOweYourselfError();
    }
  }

  public acknowledge(userId: UserId): void {
    if (!this.debtorId.equals(userId)) {
      throw new UnauthorizedActionError('Only debtor can acknowledge');
    }
    
    if (this.status !== DebtStatus.PENDING) {
      throw new InvalidStatusTransitionError(this.status, DebtStatus.ACKNOWLEDGED);
    }

    this.status = DebtStatus.ACKNOWLEDGED;
    this.raiseEvent(new DebtAcknowledgedEvent(this.id, userId));
  }

  public dispute(userId: UserId, reason: string): void {
    if (!this.debtorId.equals(userId)) {
      throw new UnauthorizedActionError('Only debtor can dispute');
    }

    this.status = DebtStatus.DISPUTED;
    this.raiseEvent(new DebtDisputedEvent(this.id, userId, reason));
  }

  public settle(settlement: Settlement): void {
    if (this.status === DebtStatus.SETTLED) {
      throw new DebtAlreadySettledError(this.id);
    }

    if (!settlement.getAmount().equals(this.amount)) {
      // Partial settlement logic
      this.handlePartialSettlement(settlement);
    } else {
      this.status = DebtStatus.SETTLED;
      this.raiseEvent(new DebtSettledEvent(this.id, settlement.getId()));
    }
  }

  private handlePartialSettlement(settlement: Settlement): void {
    const remainingAmount = this.amount.subtract(settlement.getAmount());
    this.amount = remainingAmount;
    
    this.raiseEvent(new PartialSettlementAppliedEvent(
      this.id,
      settlement.getId(),
      settlement.getAmount(),
      remainingAmount
    ));
  }

  public canBeEditedBy(userId: UserId): boolean {
    return this.creditorId.equals(userId) && 
           this.status === DebtStatus.PENDING;
  }

  public isOverdue(): boolean {
    return this.dueDate && 
           this.dueDate < new Date() && 
           this.status === DebtStatus.PENDING;
  }
}

// domain/value-objects/money.vo.ts
export class Money {
  constructor(
    private readonly amount: number,
    private readonly currency: Currency
  ) {
    if (amount < 0) {
      throw new InvalidAmountError('Amount cannot be negative');
    }
    if (!this.isValidPrecision(amount)) {
      throw new InvalidAmountError('Invalid decimal precision');
    }
  }

  private isValidPrecision(amount: number): boolean {
    const decimals = (amount.toString().split('.')[1] || '').length;
    return decimals <= 2;
  }

  public add(other: Money): Money {
    this.ensureSameCurrency(other);
    return new Money(this.amount + other.amount, this.currency);
  }

  public subtract(other: Money): Money {
    this.ensureSameCurrency(other);
    const result = this.amount - other.amount;
    if (result < 0) {
      throw new InsufficientAmountError();
    }
    return new Money(result, this.currency);
  }

  public equals(other: Money): boolean {
    return this.amount === other.amount && 
           this.currency.equals(other.currency);
  }

  private ensureSameCurrency(other: Money): void {
    if (!this.currency.equals(other.currency)) {
      throw new CurrencyMismatchError(this.currency, other.currency);
    }
  }
}
```

### Application Layer
```typescript
// application/use-cases/create-debt.use-case.ts
@Injectable()
export class CreateDebtUseCase {
  constructor(
    private readonly debtRepository: IDebtRepository,
    private readonly userRepository: IUserRepository,
    private readonly notificationService: INotificationService,
    private readonly eventBus: IEventBus
  ) {}

  async execute(command: CreateDebtCommand): Promise<CreateDebtResult> {
    // Validate users exist
    const [creditor, debtor] = await Promise.all([
      this.userRepository.findById(command.creditorId),
      this.userRepository.findById(command.debtorId)
    ]);

    if (!creditor || !debtor) {
      throw new UserNotFoundError();
    }

    // Create debt
    const debt = Debt.create({
      creditorId: command.creditorId,
      debtorId: command.debtorId,
      amount: new Money(command.amount, new Currency(command.currency)),
      description: new Description(command.description),
      dueDate: command.dueDate,
      category: command.category ? new DebtCategory(command.category) : undefined,
      groupId: command.groupId
    });

    // Save debt
    await this.debtRepository.save(debt);

    // Send notification to debtor
    await this.notificationService.notifyDebtCreated(debt);

    // Publish events
    await this.eventBus.publishAll(debt.getUncommittedEvents());

    return CreateDebtResult.success(debt.getId());
  }
}

// application/services/debt.service.ts
@Injectable()
export class DebtService {
  constructor(
    private readonly debtRepository: IDebtRepository,
    private readonly settlementService: ISettlementService
  ) {}

  async getUserDebts(
    userId: UserId,
    filters: DebtFilters
  ): Promise<UserDebtsResult> {
    const debts = await this.debtRepository.findByUser(userId, filters);
    
    const summary = this.calculateUserDebtSummary(debts, userId);
    
    return new UserDebtsResult(debts, summary);
  }

  private calculateUserDebtSummary(
    debts: Debt[],
    userId: UserId
  ): DebtSummary {
    let totalOwedToMe = Money.zero();
    let totalIOwe = Money.zero();

    debts.forEach(debt => {
      if (debt.getCreditorId().equals(userId)) {
        totalOwedToMe = totalOwedToMe.add(debt.getAmount());
      } else {
        totalIOwe = totalIOwe.add(debt.getAmount());
      }
    });

    return new DebtSummary(
      totalOwedToMe,
      totalIOwe,
      totalOwedToMe.subtract(totalIOwe)
    );
  }

  async getOverdueDebts(): Promise<Debt[]> {
    return this.debtRepository.findOverdue();
  }

  async sendReminders(): Promise<void> {
    const overdueDebts = await this.getOverdueDebts();
    
    for (const debt of overdueDebts) {
      await this.notificationService.sendDebtReminder(debt);
    }
  }
}
```

---

## 👥 Group Management Module

### Domain Layer
```typescript
// domain/entities/group.entity.ts
export class Group extends AggregateRoot {
  private members: Map<UserId, GroupMember> = new Map();

  constructor(
    private readonly id: GroupId,
    private name: GroupName,
    private readonly createdBy: UserId,
    private groupType: GroupType,
    private settings: GroupSettings,
    private readonly createdAt: Date
  ) {
    super();
    // Creator is automatically admin
    this.addMember(createdBy, GroupRole.ADMIN);
  }

  public addMember(userId: UserId, role: GroupRole = GroupRole.MEMBER): void {
    if (this.members.has(userId)) {
      throw new UserAlreadyInGroupError(userId, this.id);
    }

    const member = new GroupMember(userId, role, new Date());
    this.members.set(userId, member);
    
    this.raiseEvent(new MemberAddedToGroupEvent(this.id, userId, role));
  }

  public removeMember(userId: UserId, removedBy: UserId): void {
    if (!this.members.has(userId)) {
      throw new UserNotInGroupError(userId, this.id);
    }

    const remover = this.members.get(removedBy);
    if (!remover?.hasPermission(GroupPermission.REMOVE_MEMBERS)) {
      throw new InsufficientPermissionsError();
    }

    this.members.delete(userId);
    this.raiseEvent(new MemberRemovedFromGroupEvent(this.id, userId, removedBy));
  }

  public addExpense(expense: GroupExpense, addedBy: UserId): void {
    const member = this.members.get(addedBy);
    if (!member?.hasPermission(GroupPermission.ADD_EXPENSES)) {
      throw new InsufficientPermissionsError();
    }

    // Create individual debts for each member
    const splits = this.calculateExpenseSplits(expense);
    
    splits.forEach(split => {
      if (!split.userId.equals(addedBy)) {
        const debt = this.createDebtFromSplit(expense, split, addedBy);
        this.raiseEvent(new DebtCreatedFromGroupExpenseEvent(debt));
      }
    });

    this.raiseEvent(new GroupExpenseAddedEvent(this.id, expense, addedBy));
  }

  private calculateExpenseSplits(expense: GroupExpense): ExpenseSplit[] {
    const activeMembers = Array.from(this.members.values())
      .filter(member => member.isActive());
    
    switch (expense.getSplitType()) {
      case SplitType.EQUAL:
        return this.splitEqually(expense, activeMembers);
      case SplitType.PERCENTAGE:
        return this.splitByPercentage(expense, activeMembers);
      case SplitType.CUSTOM:
        return expense.getCustomSplits();
      default:
        throw new UnsupportedSplitTypeError(expense.getSplitType());
    }
  }

  public getMemberBalance(userId: UserId): Money {
    // Calculate net balance for member within group
    // This would involve summing all group-related debts
    return this.calculateMemberBalance(userId);
  }

  public getFinancialSummary(): GroupFinancialSummary {
    const totalExpenses = this.calculateTotalExpenses();
    const settledAmount = this.calculateSettledAmount();
    const pendingAmount = totalExpenses.subtract(settledAmount);

    return new GroupFinancialSummary(
      totalExpenses,
      settledAmount,
      pendingAmount,
      this.members.size
    );
  }
}

// domain/entities/group-member.entity.ts
export class GroupMember {
  constructor(
    private readonly userId: UserId,
    private role: GroupRole,
    private readonly joinedAt: Date,
    private permissions: Set<GroupPermission> = new Set()
  ) {
    this.initializePermissions();
  }

  private initializePermissions(): void {
    switch (this.role) {
      case GroupRole.ADMIN:
        this.permissions = new Set([
          GroupPermission.ADD_EXPENSES,
          GroupPermission.REMOVE_MEMBERS,
          GroupPermission.INVITE_MEMBERS,
          GroupPermission.EDIT_GROUP,
          GroupPermission.SETTLE_DEBTS
        ]);
        break;
      case GroupRole.MEMBER:
        this.permissions = new Set([
          GroupPermission.ADD_EXPENSES,
          GroupPermission.SETTLE_DEBTS
        ]);
        break;
      case GroupRole.VIEWER:
        this.permissions = new Set();
        break;
    }
  }

  public hasPermission(permission: GroupPermission): boolean {
    return this.permissions.has(permission);
  }

  public isActive(): boolean {
    return this.status === MemberStatus.ACTIVE;
  }

  public promoteToAdmin(): void {
    this.role = GroupRole.ADMIN;
    this.initializePermissions();
  }
}
```

---

## 💳 Settlement Module

### Domain Layer
```typescript
// domain/entities/settlement.entity.ts
export class Settlement extends AggregateRoot {
  constructor(
    private readonly id: SettlementId,
    private readonly debtId: DebtId,
    private readonly amount: Money,
    private readonly settlementMethod: SettlementMethod,
    private status: SettlementStatus = SettlementStatus.PENDING,
    private confirmations: Map<UserId, SettlementConfirmation> = new Map(),
    private readonly createdAt: Date = new Date()
  ) {
    super();
  }

  public confirm(userId: UserId, confirmationCode?: string): void {
    if (this.status !== SettlementStatus.PENDING) {
      throw new InvalidSettlementStatusError(this.status);
    }

    const confirmation = new SettlementConfirmation(
      userId,
      new Date(),
      confirmationCode
    );

    this.confirmations.set(userId, confirmation);

    // Check if all required parties have confirmed
    if (this.areAllPartiesConfirmed()) {
      this.status = SettlementStatus.CONFIRMED;
      this.raiseEvent(new SettlementConfirmedEvent(this.id, this.debtId));
    } else {
      this.raiseEvent(new SettlementPartiallyConfirmedEvent(this.id, userId));
    }
  }

  private areAllPartiesConfirmed(): boolean {
    // Both creditor and debtor must confirm
    return this.confirmations.size >= 2;
  }

  public dispute(userId: UserId, reason: string): void {
    this.status = SettlementStatus.DISPUTED;
    this.raiseEvent(new SettlementDisputedEvent(this.id, userId, reason));
  }

  public generateReceipt(): SettlementReceipt {
    if (this.status !== SettlementStatus.CONFIRMED) {
      throw new CannotGenerateReceiptError('Settlement not confirmed');
    }

    return new SettlementReceipt(
      this.id,
      this.debtId,
      this.amount,
      this.settlementMethod,
      this.confirmations,
      new Date()
    );
  }

  public addPaymentProof(proofUrl: string): void {
    this.paymentProofUrl = proofUrl;
    this.raiseEvent(new PaymentProofAddedEvent(this.id, proofUrl));
  }
}

// domain/services/receipt-generator.service.ts
export class ReceiptGeneratorService {
  constructor(
    private readonly pdfGenerator: IPdfGenerator,
    private readonly digitalSignature: IDigitalSignatureService
  ) {}

  async generateLegalReceipt(settlement: Settlement): Promise<LegalReceipt> {
    const receiptData = this.prepareReceiptData(settlement);
    const pdfBuffer = await this.pdfGenerator.generate(receiptData);
    
    // Add digital signature for legal validity
    const signature = await this.digitalSignature.sign(pdfBuffer);
    
    return new LegalReceipt(
      settlement.getId(),
      pdfBuffer,
      signature,
      new Date()
    );
  }

  private prepareReceiptData(settlement: Settlement): ReceiptData {
    return {
      settlementId: settlement.getId().getValue(),
      amount: settlement.getAmount(),
      date: settlement.getConfirmedAt(),
      parties: settlement.getConfirmations(),
      method: settlement.getSettlementMethod(),
      digitalHash: this.calculateHash(settlement)
    };
  }
}
```

---

## 🔔 Notification Module

### Domain Layer
```typescript
// domain/entities/notification.entity.ts
export class Notification {
  constructor(
    private readonly id: NotificationId,
    private readonly userId: UserId,
    private readonly type: NotificationType,
    private readonly title: string,
    private readonly message: string,
    private readonly data: NotificationData,
    private isRead: boolean = false,
    private readonly createdAt: Date = new Date()
  ) {}

  public markAsRead(): void {
    if (this.isRead) {
      throw new NotificationAlreadyReadError(this.id);
    }
    
    this.isRead = true;
    this.readAt = new Date();
  }

  public isExpired(): boolean {
    const expiryDays = this.getExpiryDays();
    const expiryDate = new Date(this.createdAt);
    expiryDate.setDate(expiryDate.getDate() + expiryDays);
    
    return new Date() > expiryDate;
  }

  private getExpiryDays(): number {
    switch (this.type) {
      case NotificationType.DEBT_REMINDER:
        return 30;
      case NotificationType.SETTLEMENT_REQUEST:
        return 14;
      default:
        return 7;
    }
  }
}

// domain/services/notification-template.service.ts
export class NotificationTemplateService {
  private templates: Map<NotificationType, NotificationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    this.templates.set(
      NotificationType.DEBT_CREATED,
      new NotificationTemplate(
        'New debt added',
        '{creditor} says you owe {amount} for {description}',
        ['creditor', 'amount', 'description']
      )
    );

    this.templates.set(
      NotificationType.SETTLEMENT_REQUEST,
      new NotificationTemplate(
        'Settlement request',
        '{debtor} wants to settle {amount} for {description}',
        ['debtor', 'amount', 'description']
      )
    );

    this.templates.set(
      NotificationType.DEBT_REMINDER,
      new NotificationTemplate(
        'Payment reminder',
        'Your {amount} payment to {creditor} is overdue',
        ['amount', 'creditor']
      )
    );
  }

  public getTemplate(type: NotificationType): NotificationTemplate {
    const template = this.templates.get(type);
    if (!template) {
      throw new TemplateNotFoundError(type);
    }
    return template;
  }

  public renderNotification(
    type: NotificationType,
    variables: Record<string, string>
  ): RenderedNotification {
    const template = this.getTemplate(type);
    return template.render(variables);
  }
}
```

### Application Layer
```typescript
// application/services/notification.service.ts
@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: INotificationRepository,
    private readonly pushNotificationService: IPushNotificationService,
    private readonly emailService: IEmailService,
    private readonly smsService: ISmsService,
    private readonly templateService: NotificationTemplateService
  ) {}

  async notifyDebtCreated(debt: Debt): Promise<void> {
    const [creditor, debtor] = await Promise.all([
      this.userRepository.findById(debt.getCreditorId()),
      this.userRepository.findById(debt.getDebtorId())
    ]);

    const variables = {
      creditor: creditor.getFullName(),
      amount: debt.getAmount().format(),
      description: debt.getDescription().getValue()
    };

    const rendered = this.templateService.renderNotification(
      NotificationType.DEBT_CREATED,
      variables
    );

    const notification = Notification.create({
      userId: debt.getDebtorId(),
      type: NotificationType.DEBT_CREATED,
      title: rendered.title,
      message: rendered.message,
      data: new NotificationData({
        debtId: debt.getId().getValue(),
        creditorId: debt.getCreditorId().getValue()
      })
    });

    // Save notification
    await this.notificationRepository.save(notification);

    // Send push notification
    await this.pushNotificationService.send(
      debtor.getDeviceTokens(),
      rendered.title,
      rendered.message,
      { debtId: debt.getId().getValue() }
    );

    // Send email if user prefers
    if (debtor.getNotificationPreferences().emailEnabled) {
      await this.emailService.sendDebtNotification(debtor.getEmail(), rendered);
    }
  }

  async sendBulkReminders(): Promise<void> {
    const overdueDebts = await this.debtRepository.findOverdue();
    
    const reminders = overdueDebts.map(debt => 
      this.createReminderNotification(debt)
    );

    await Promise.all([
      this.notificationRepository.saveMany(reminders),
      this.sendBulkPushNotifications(reminders),
      this.sendBulkEmails(reminders)
    ]);
  }

  private async sendBulkPushNotifications(
    notifications: Notification[]
  ): Promise<void> {
    const pushMessages = notifications.map(notification => ({
      token: notification.getUserDeviceToken(),
      title: notification.getTitle(),
      body: notification.getMessage(),
      data: notification.getData()
    }));

    await this.pushNotificationService.sendBulk(pushMessages);
  }
}
```

---

## 🤖 AI Implementation Prompt

```
You are tasked with implementing the Settler app backend modules. Use the following guidelines:

1. **Domain-Driven Design**:
   - Create rich domain entities with business logic
   - Implement value objects for complex types
   - Use domain events for cross-module communication
   - Add proper domain validation and business rules

2. **Clean Architecture**:
   - Separate domain, application, infrastructure, and presentation layers
   - Use dependency inversion for external dependencies
   - Implement proper interfaces and abstractions
   - Add comprehensive error handling

3. **NestJS Implementation**:
   - Create proper module structure with clear boundaries
   - Use dependency injection throughout
   - Implement proper middleware and guards
   - Add comprehensive logging and monitoring

4. **Business Logic**:
   - Implement all debt lifecycle management
   - Add proper settlement confirmation flows
   - Create group expense splitting algorithms
   - Add notification delivery strategies

5. **Data Consistency**:
   - Use database transactions for multi-entity operations
   - Implement proper event sourcing where needed
   - Add idempotency for critical operations
   - Create proper audit trails

6. **Performance Optimization**:
   - Implement proper caching strategies
   - Add database query optimization
   - Use bulk operations where appropriate
   - Add proper indexing strategies

7. **Security & Validation**:
   - Implement proper authorization at service level
   - Add input validation and sanitization
   - Create proper audit logging
   - Add rate limiting for expensive operations

8. **Testing Strategy**:
   - Add unit tests for all domain logic
   - Create integration tests for use cases
   - Add repository tests with database
   - Implement end-to-end testing

Generate production-ready backend implementation that follows these specifications exactly.
``` 