# 🎨 UI/UX مشخصات طراحی - Settler App (ایران)

## نمای کلی
طراحی رابط کاربری مناسب برای کاربران ایرانی با پشتیبانی کامل از زبان فارسی، چیدمان راست به چپ، و فرهنگ بومی.

## 🎯 Design System برای ایران

### 1. **پالت رنگی ایرانی**
```scss
// Primary Colors (الهام از هنر ایرانی)
$persian-blue: #1976d2;      // آبی فیروزه‌ای
$persian-green: #4caf50;     // سبز طبیعی
$saffron-gold: #ff9800;      // زعفرانی طلایی
$pomegranate-red: #f44336;   // قرمز انار

// Neutral Colors
$white: #ffffff;
$light-gray: #f5f5f5;
$medium-gray: #9e9e9e;
$dark-gray: #424242;
$text-dark: #212121;

// Status Colors
$success: #4caf50;           // موفقیت
$warning: #ff9800;           // هشدار
$error: #f44336;             // خطا
$info: #2196f3;              // اطلاعات

// Cultural Colors
$nowruz-green: #8bc34a;      // سبز نوروز
$ramadan-purple: #9c27b0;    // بنفش ماه رمضان
```

### 2. **تایپوگرافی فارسی**
```scss
// Persian Font Stack
@font-face {
  font-family: 'Vazir';
  src: url('./assets/fonts/Vazir-Regular.woff2') format('woff2');
  font-weight: 400;
  font-display: swap;
}

@font-face {
  font-family: 'Vazir';
  src: url('./assets/fonts/Vazir-Bold.woff2') format('woff2');
  font-weight: 700;
  font-display: swap;
}

// Typography Scale
$font-scale: (
  h1: (size: 32px, weight: 700, line-height: 1.2),
  h2: (size: 28px, weight: 600, line-height: 1.3),
  h3: (size: 24px, weight: 600, line-height: 1.4),
  h4: (size: 20px, weight: 600, line-height: 1.4),
  h5: (size: 18px, weight: 500, line-height: 1.5),
  body-large: (size: 16px, weight: 400, line-height: 1.6),
  body: (size: 14px, weight: 400, line-height: 1.5),
  body-small: (size: 12px, weight: 400, line-height: 1.4),
  caption: (size: 10px, weight: 400, line-height: 1.3)
);

// RTL-specific Typography
.persian-text {
  font-family: 'Vazir', 'Tahoma', sans-serif;
  direction: rtl;
  text-align: right;
  unicode-bidi: embed;
}

.persian-number {
  font-family: 'Vazir-FD', 'Vazir', monospace;
  font-variant-numeric: tabular-nums;
}
```

### 3. **Spacing & Layout (RTL)**
```scss
// Spacing System
$spacing: (
  xs: 4px,
  sm: 8px,
  md: 16px,
  lg: 24px,
  xl: 32px,
  xxl: 48px
);

// RTL-aware spacing mixins
@mixin margin-start($size) {
  margin-right: map-get($spacing, $size);
  
  [dir="ltr"] & {
    margin-right: 0;
    margin-left: map-get($spacing, $size);
  }
}

@mixin padding-start($size) {
  padding-right: map-get($spacing, $size);
  
  [dir="ltr"] & {
    padding-right: 0;
    padding-left: map-get($spacing, $size);
  }
}

// Grid System (RTL-aware)
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  direction: rtl;
  
  .row {
    display: flex;
    flex-wrap: wrap;
    margin: 0 -8px;
  }
  
  .col {
    padding: 0 8px;
    flex: 1;
  }
}
```

## 📱 Mobile App Design (React Native)

### 1. **صفحات اصلی**
```typescript
// Main Screens Layout
interface ScreenLayout {
  header: HeaderConfig;
  body: BodyConfig;
  navigation: NavigationConfig;
}

// Dashboard Screen (صفحه اصلی)
const DashboardScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Header with Persian greeting */}
      <View style={styles.header}>
        <Text style={styles.greeting}>
          {getPersianGreeting()} {user.firstName} عزیز
        </Text>
        <Text style={styles.date}>
          {PersianDate.today()}
        </Text>
      </View>

      {/* Quick Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="کل بدهی‌ها"
          value={formatPersianCurrency(totalDebts)}
          icon="account-balance-wallet"
          color={colors.warning}
        />
        <StatCard
          title="طلب‌ها"
          value={formatPersianCurrency(totalCredits)}
          icon="trending-up"
          color={colors.success}
        />
      </View>

      {/* Recent Activities */}
      <SectionHeader title="فعالیت‌های اخیر" />
      <RecentActivitiesList />

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <QuickActionButton
          title="بدهی جدید"
          icon="add"
          onPress={() => navigation.navigate('CreateDebt')}
        />
        <QuickActionButton
          title="گروه جدید"
          icon="group-add"
          onPress={() => navigation.navigate('CreateGroup')}
        />
      </View>
    </ScrollView>
  );
};

// Debt List Screen (لیست بدهی‌ها)
const DebtListScreen = () => {
  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <TabView
        selectedIndex={selectedTab}
        onSelect={setSelectedTab}
      >
        <Tab title="همه">
          <DebtList filter="all" />
        </Tab>
        <Tab title="بدهکاری">
          <DebtList filter="debtor" />
        </Tab>
        <Tab title="طلبکاری">
          <DebtList filter="creditor" />
        </Tab>
        <Tab title="تسویه شده">
          <DebtList filter="settled" />
        </Tab>
      </TabView>
    </View>
  );
};

// Debt Card Component
const DebtCard = ({ debt }: { debt: Debt }) => {
  const isCreditor = debt.creditorId === currentUser.id;
  
  return (
    <TouchableOpacity 
      style={[styles.debtCard, isCreditor && styles.creditCard]}
      onPress={() => navigation.navigate('DebtDetails', { debtId: debt.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.userInfo}>
          <Avatar
            source={{ uri: getOtherUser(debt).avatar }}
            size={40}
          />
          <Text style={styles.userName}>
            {getOtherUser(debt).firstName} {getOtherUser(debt).lastName}
          </Text>
        </View>
        <StatusBadge status={debt.status} />
      </View>

      <Text style={styles.description}>
        {debt.description}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={[styles.amount, isCreditor && styles.creditAmount]}>
          {formatPersianCurrency(debt.amount)}
        </Text>
        <Text style={styles.date}>
          {PersianDate.format(debt.dueDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
```

### 2. **فرم‌های فارسی**
```typescript
// Create Debt Form (فرم ایجاد بدهی)
const CreateDebtForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    dueDate: new Date(),
    category: '',
    otherUserId: '',
    isCreditor: true
  });

  return (
    <ScrollView style={styles.formContainer}>
      <Text style={styles.formTitle}>
        ایجاد بدهی جدید
      </Text>

      {/* User Selection */}
      <FormField label="طرف حساب">
        <UserSearchInput
          placeholder="نام یا شماره موبایل را وارد کنید"
          onUserSelect={(user) => setFormData({...formData, otherUserId: user.id})}
        />
      </FormField>

      {/* Debt Type Toggle */}
      <FormField label="نوع بدهی">
        <ToggleButtonGroup
          selectedIndex={formData.isCreditor ? 0 : 1}
          onSelect={(index) => setFormData({...formData, isCreditor: index === 0})}
        >
          <ToggleButton title="من طلبکارم" />
          <ToggleButton title="من بدهکارم" />
        </ToggleButtonGroup>
      </FormField>

      {/* Amount Input */}
      <FormField label="مبلغ (تومان)">
        <PersianAmountInput
          value={formData.amount}
          onChangeText={(amount) => setFormData({...formData, amount})}
          placeholder="مبلغ را وارد کنید"
        />
      </FormField>

      {/* Description */}
      <FormField label="توضیحات">
        <TextInput
          style={styles.persianInput}
          value={formData.description}
          onChangeText={(description) => setFormData({...formData, description})}
          placeholder="بابت چه چیزی؟"
          multiline
          numberOfLines={3}
        />
      </FormField>

      {/* Due Date */}
      <FormField label="تاریخ سررسید">
        <PersianDatePicker
          date={formData.dueDate}
          onDateChange={(date) => setFormData({...formData, dueDate: date})}
        />
      </FormField>

      {/* Category */}
      <FormField label="دسته‌بندی">
        <CategoryPicker
          selectedCategory={formData.category}
          onCategorySelect={(category) => setFormData({...formData, category})}
        />
      </FormField>

      {/* Submit Button */}
      <PrimaryButton
        title="ایجاد بدهی"
        onPress={handleSubmit}
        loading={isSubmitting}
        style={styles.submitButton}
      />
    </ScrollView>
  );
};

// Persian Form Components
const FormField = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <View style={styles.formField}>
    <Text style={styles.fieldLabel}>{label}</Text>
    {children}
  </View>
);

const PersianAmountInput = ({ value, onChangeText, placeholder }: any) => {
  const [displayValue, setDisplayValue] = useState(value);

  const handleChange = (input: string) => {
    const numericValue = PersianNumber.toEnglish(input.replace(/[^\d۰-۹]/g, ''));
    const formattedValue = PersianNumber.formatCurrency(parseInt(numericValue) || 0);
    
    setDisplayValue(formattedValue);
    onChangeText(numericValue);
  };

  return (
    <TextInput
      style={styles.persianInput}
      value={displayValue}
      onChangeText={handleChange}
      placeholder={placeholder}
      keyboardType="numeric"
      textAlign="right"
    />
  );
};

const PersianDatePicker = ({ date, onDateChange }: any) => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        style={styles.datePickerButton}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.dateText}>
          {PersianDate.format(date)}
        </Text>
        <Icon name="calendar-today" size={24} color="#666" />
      </TouchableOpacity>

      <DateTimePickerModal
        isVisible={visible}
        mode="date"
        onConfirm={(selectedDate) => {
          onDateChange(selectedDate);
          setVisible(false);
        }}
        onCancel={() => setVisible(false)}
        locale="fa-IR"
        headerTextIOS="انتخاب تاریخ"
        confirmTextIOS="تایید"
        cancelTextIOS="لغو"
      />
    </>
  );
};
```

### 3. **Navigation فارسی**
```typescript
// Bottom Tab Navigation
const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'داشبورد',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Debts"
        component={DebtListScreen}
        options={{
          title: 'بدهی‌ها',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="account-balance-wallet" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Groups"
        component={GroupListScreen}
        options={{
          title: 'گروه‌ها',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="group" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'پروفایل',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigation with Persian headers
const MainStackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: colors.primary,
        headerTitleAlign: 'center',
      }}
    >
      <Stack.Screen
        name="Main"
        component={BottomTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="CreateDebt"
        component={CreateDebtScreen}
        options={{
          title: 'ایجاد بدهی جدید',
          headerBackTitle: 'بازگشت',
        }}
      />
      <Stack.Screen
        name="DebtDetails"
        component={DebtDetailsScreen}
        options={{
          title: 'جزئیات بدهی',
          headerRight: () => (
            <HeaderButton
              title="ویرایش"
              onPress={() => {/* Navigate to edit */}}
            />
          ),
        }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          title: 'ایجاد گروه جدید',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'تنظیمات',
        }}
      />
    </Stack.Navigator>
  );
};
```

## 🌐 Web App Design (React)

### 1. **Admin Dashboard**
```typescript
// Admin Layout for Web
const AdminLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="admin-layout rtl">
      <Sidebar />
      <main className="main-content">
        <Header />
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

// Persian Sidebar
const Sidebar = () => {
  const menuItems = [
    { icon: 'dashboard', label: 'داشبورد', path: '/admin' },
    { icon: 'people', label: 'کاربران', path: '/admin/users' },
    { icon: 'account_balance_wallet', label: 'بدهی‌ها', path: '/admin/debts' },
    { icon: 'group', label: 'گروه‌ها', path: '/admin/groups' },
    { icon: 'receipt', label: 'تراکنش‌ها', path: '/admin/transactions' },
    { icon: 'analytics', label: 'گزارشات', path: '/admin/reports' },
    { icon: 'settings', label: 'تنظیمات', path: '/admin/settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src="/logo.png" alt="Settler" className="logo" />
        <h2>پنل مدیریت</h2>
      </div>
      
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className="nav-item"
            activeClassName="active"
          >
            <MaterialIcon name={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

// Data Table with Persian headers
const DebtTable = ({ debts }: { debts: Debt[] }) => {
  const columns = [
    { key: 'id', label: 'شناسه', sortable: true },
    { key: 'creditor', label: 'طلبکار', sortable: true },
    { key: 'debtor', label: 'بدهکار', sortable: true },
    { key: 'amount', label: 'مبلغ (تومان)', sortable: true },
    { key: 'description', label: 'توضیحات', sortable: false },
    { key: 'status', label: 'وضعیت', sortable: true },
    { key: 'dueDate', label: 'سررسید', sortable: true },
    { key: 'actions', label: 'عملیات', sortable: false },
  ];

  return (
    <div className="data-table-container">
      <DataTable
        columns={columns}
        data={debts}
        rtl
        persianNumbers
        onSort={handleSort}
        onRowClick={handleRowClick}
      />
    </div>
  );
};
```

### 2. **Responsive Design**
```scss
// Persian Responsive Design
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 16px;
  direction: rtl;

  // Mobile First
  @media (max-width: 768px) {
    padding: 0 12px;
    
    .persian-text {
      font-size: 14px;
      line-height: 1.6;
    }
    
    .amount-display {
      font-size: 18px;
      font-weight: 600;
    }
  }

  // Tablet
  @media (min-width: 769px) and (max-width: 1024px) {
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
  }

  // Desktop
  @media (min-width: 1025px) {
    .grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;
    }
    
    .sidebar {
      width: 280px;
      position: fixed;
      right: 0;
      top: 0;
      height: 100vh;
    }
    
    .main-content {
      margin-right: 280px;
    }
  }
}

// RTL-specific animations
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.slide-in-rtl {
  animation: slideInRight 0.3s ease-out;
}

// Persian Number styling
.persian-amount {
  font-family: 'Vazir-FD', monospace;
  font-weight: 600;
  letter-spacing: 0.5px;
  
  &.positive {
    color: $success;
    
    &::before {
      content: '+';
      color: $success;
    }
  }
  
  &.negative {
    color: $error;
    
    &::before {
      content: '-';
      color: $error;
    }
  }
}
```

## 🎨 Iranian Cultural Elements

### 1. **Visual Design Patterns**
```scss
// Persian patterns and decorations
.persian-card {
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border: 2px solid transparent;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(90deg, $persian-blue, $saffron-gold);
  }
  
  &.success {
    &::before {
      background: $success;
    }
  }
  
  &.warning {
    &::before {
      background: $warning;
    }
  }
}

// Persian geometric patterns (subtle)
.pattern-background {
  background-image: url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f0f0f0' fill-opacity='0.05'%3E%3Cpath d='M20 20c0 11.046-8.954 20-20 20v-40c11.046 0 20 8.954 20 20z'/%3E%3C/g%3E%3C/svg%3E");
}

// Status indicators with Persian styling
.status-badge {
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 500;
  
  &.pending {
    background-color: rgba(255, 152, 0, 0.1);
    color: $warning;
    border: 1px solid rgba(255, 152, 0, 0.3);
    
    &::before {
      content: '⏳';
      margin-left: 4px;
    }
  }
  
  &.settled {
    background-color: rgba(76, 175, 80, 0.1);
    color: $success;
    border: 1px solid rgba(76, 175, 80, 0.3);
    
    &::before {
      content: '✅';
      margin-left: 4px;
    }
  }
  
  &.overdue {
    background-color: rgba(244, 67, 54, 0.1);
    color: $error;
    border: 1px solid rgba(244, 67, 54, 0.3);
    
    &::before {
      content: '⚠️';
      margin-left: 4px;
    }
  }
}
```

### 2. **Cultural UI Components**
```typescript
// Persian Greeting Component
const PersianGreeting = ({ user }: { user: User }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    
    if (hour < 6) return 'شب بخیر';
    if (hour < 12) return 'صبح بخیر';
    if (hour < 17) return 'ظهر بخیر';
    if (hour < 20) return 'عصر بخیر';
    return 'شب بخیر';
  };

  return (
    <View style={styles.greetingContainer}>
      <Text style={styles.greetingText}>
        {getGreeting()}، {user.firstName} عزیز
      </Text>
      <Text style={styles.dateText}>
        {PersianDate.format(new Date(), 'dddd، DD MMMM YYYY')}
      </Text>
    </View>
  );
};

// Iranian Holiday Banner
const HolidayBanner = () => {
  const currentHoliday = PersianCultureService.getCurrentHoliday();
  
  if (!currentHoliday) return null;

  return (
    <View style={[styles.holidayBanner, { backgroundColor: currentHoliday.color }]}>
      <Text style={styles.holidayEmoji}>{currentHoliday.emoji}</Text>
      <View style={styles.holidayContent}>
        <Text style={styles.holidayTitle}>{currentHoliday.name}</Text>
        <Text style={styles.holidayMessage}>{currentHoliday.message}</Text>
      </View>
    </View>
  );
};

// Persian Currency Display
const CurrencyDisplay = ({ amount, showBoth = false }: { amount: number; showBoth?: boolean }) => {
  return (
    <View style={styles.currencyContainer}>
      <Text style={styles.mainAmount}>
        {PersianNumber.formatCurrency(amount, 'toman')}
      </Text>
      {showBoth && (
        <Text style={styles.subAmount}>
          ({PersianNumber.formatCurrency(amount * 10, 'rial')})
        </Text>
      )}
    </View>
  );
};

// Relationship Type Selector
const RelationshipSelector = ({ selectedType, onSelect }: any) => {
  const relationships = [
    { id: 'family', name: 'خانواده', icon: '👨‍👩‍👧‍👦', color: '#4caf50' },
    { id: 'friends', name: 'دوستان', icon: '👥', color: '#2196f3' },
    { id: 'colleagues', name: 'همکاران', icon: '💼', color: '#ff9800' },
    { id: 'neighbors', name: 'همسایه‌ها', icon: '🏠', color: '#9c27b0' },
    { id: 'business', name: 'کسب‌وکار', icon: '🏢', color: '#607d8b' },
  ];

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.relationshipContainer}>
        {relationships.map((rel) => (
          <TouchableOpacity
            key={rel.id}
            style={[
              styles.relationshipButton,
              selectedType === rel.id && styles.relationshipButtonActive,
              { borderColor: rel.color }
            ]}
            onPress={() => onSelect(rel.id)}
          >
            <Text style={styles.relationshipIcon}>{rel.icon}</Text>
            <Text style={styles.relationshipName}>{rel.name}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};
```

## 📊 Accessibility (دسترسی‌پذیری)

### 1. **Screen Reader Support**
```typescript
// Persian accessibility labels
const accessibilityLabels = {
  navigation: {
    dashboard: 'داشبورد، صفحه اصلی',
    debts: 'بدهی‌ها، لیست تمام بدهی‌ها',
    groups: 'گروه‌ها، مدیریت گروه‌ها',
    profile: 'پروفایل، تنظیمات کاربری',
  },
  
  actions: {
    createDebt: 'ایجاد بدهی جدید',
    settleDebt: 'تسویه بدهی',
    editDebt: 'ویرایش بدهی',
    deleteDebt: 'حذف بدهی',
  },
  
  amounts: (amount: number) => `مبلغ ${PersianNumber.formatCurrency(amount)}`,
  dates: (date: Date) => `تاریخ ${PersianDate.format(date)}`,
  status: {
    pending: 'وضعیت: در انتظار',
    settled: 'وضعیت: تسویه شده',
    overdue: 'وضعیت: عقب‌افتاده',
  }
};

// Accessible components
const AccessibleButton = ({ title, onPress, accessibilityHint }: any) => (
  <TouchableOpacity
    onPress={onPress}
    accessible={true}
    accessibilityRole="button"
    accessibilityLabel={title}
    accessibilityHint={accessibilityHint}
    style={styles.button}
  >
    <Text style={styles.buttonText}>{title}</Text>
  </TouchableOpacity>
);
```

### 2. **High Contrast Mode**
```scss
// High contrast theme for accessibility
@media (prefers-contrast: high) {
  .app {
    --text-color: #000000;
    --background-color: #ffffff;
    --border-color: #000000;
    --link-color: #0000ff;
    --error-color: #ff0000;
    --success-color: #008000;
  }
  
  .persian-text {
    color: var(--text-color);
    background-color: var(--background-color);
    border: 2px solid var(--border-color);
  }
  
  .button {
    background-color: var(--text-color);
    color: var(--background-color);
    border: 2px solid var(--text-color);
    
    &:hover, &:focus {
      background-color: var(--background-color);
      color: var(--text-color);
    }
  }
}

// Large text support
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

// Font size scaling
.scalable-text {
  font-size: clamp(14px, 2.5vw, 24px);
  line-height: 1.6;
}
```

## 🤖 AI Prompt برای UI/UX

```
شما مسئول پیاده‌سازی رابط کاربری Settler برای بازار ایران هستید. از این مشخصات استفاده کنید:

**طراحی فرهنگی:**
- استفاده از پالت رنگی الهام‌گرفته از هنر ایرانی
- طراحی مناسب با ذائقه بصری ایرانی
- استفاده از نمادها و آیکون‌های مناسب فرهنگ ایران

**پشتیبانی از فارسی:**
- چیدمان کامل راست به چپ (RTL)
- استفاده از فونت Vazir برای متن‌های فارسی
- تبدیل خودکار اعداد انگلیسی به فارسی
- پشتیبانی از تقویم شمسی

**تجربه کاربری:**
- فرم‌های بهینه‌شده برای ورودی فارسی
- پیام‌های راهنما و خطا به زبان فارسی
- ناوبری ساده و قابل فهم
- پشتیبانی از دسترسی‌پذیری

**عملکرد موبایل:**
- طراحی Mobile-First
- بهینه‌سازی برای کیبورد فارسی
- پشتیبانی از اندازه‌های مختلف صفحه
- انیمیشن‌های روان و مناسب

**مدیریت مالی:**
- نمایش مناسب ریال و تومان
- فرمت‌بندی صحیح اعداد فارسی
- وضعیت‌های بصری برای انواع بدهی
- گراف‌ها و نمودارهای قابل فهم

کد تولید شده باید کاملاً responsive، accessible، و برای کاربران ایرانی بهینه باشد.
``` 