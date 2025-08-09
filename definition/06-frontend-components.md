# 📱 Frontend Components - Settler App

## Overview
The Settler frontend uses **React Native with Expo** for cross-platform mobile development, following **Component-Driven Development** with **Atomic Design** principles and **TypeScript** for type safety.

## 🏗️ Component Architecture

### Atomic Design Structure
```
src/components/
├── atoms/              # Basic building blocks
│   ├── Button/
│   ├── Input/
│   ├── Text/
│   ├── Avatar/
│   └── StatusBadge/
├── molecules/          # Simple component groups
│   ├── AmountDisplay/
│   ├── UserCard/
│   ├── DebtCard/
│   └── NotificationItem/
├── organisms/          # Complex UI sections
│   ├── DebtList/
│   ├── GroupMembersList/
│   ├── SettlementForm/
│   └── NavigationHeader/
├── templates/          # Page layouts
│   ├── AuthLayout/
│   ├── MainLayout/
│   └── ModalLayout/
└── pages/             # Complete screens
    ├── LoginScreen/
    ├── DashboardScreen/
    ├── DebtDetailScreen/
    └── GroupDetailScreen/
```

---

## ⚛️ Atomic Components

### 1. **Button Component**
```typescript
// components/atoms/Button/Button.tsx
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  testID
}) => {
  const theme = useTheme();
  
  const buttonStyles = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    disabled && styles.disabled,
    { backgroundColor: theme.colors.button[variant] }
  ];

  const textStyles = [
    styles.text,
    styles[`text${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    { color: theme.colors.buttonText[variant] }
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator 
          color={theme.colors.buttonText[variant]} 
          size="small" 
        />
      ) : (
        <>
          {icon && <Text style={styles.icon}>{icon}</Text>}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  primary: {
    backgroundColor: '#10B981',
  },
  secondary: {
    backgroundColor: '#6B7280',
  },
  danger: {
    backgroundColor: '#EF4444',
  },
  ghost: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    fontWeight: '500',
  },
  textPrimary: {
    color: '#FFFFFF',
  },
  textSecondary: {
    color: '#FFFFFF',
  },
  textDanger: {
    color: '#FFFFFF',
  },
  textGhost: {
    color: '#374151',
  },
  icon: {
    marginRight: 8,
    fontSize: 16,
  },
});
```

### 2. **Amount Display Component**
```typescript
// components/atoms/AmountDisplay/AmountDisplay.tsx
import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface AmountDisplayProps {
  amount: number;
  currency: string;
  type?: 'positive' | 'negative' | 'neutral';
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showSign?: boolean;
  precision?: number;
  testID?: string;
}

export const AmountDisplay: React.FC<AmountDisplayProps> = ({
  amount,
  currency,
  type = 'neutral',
  size = 'medium',
  showSign = false,
  precision = 2,
  testID
}) => {
  const theme = useTheme();
  
  const formatAmount = (value: number): string => {
    const sign = showSign && value > 0 ? '+' : '';
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    });
    
    return `${sign}${formatter.format(Math.abs(value))}`;
  };

  const getColor = (): string => {
    switch (type) {
      case 'positive':
        return theme.colors.success;
      case 'negative':
        return theme.colors.error;
      default:
        return theme.colors.text.primary;
    }
  };

  const textStyles = [
    styles.amount,
    styles[size],
    { color: getColor() }
  ];

  return (
    <Text 
      style={textStyles}
      testID={testID}
      accessibilityLabel={`Amount: ${formatAmount(amount)}`}
    >
      {formatAmount(amount)}
    </Text>
  );
};

const styles = StyleSheet.create({
  amount: {
    fontFamily: 'Inter-SemiBold',
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  small: {
    fontSize: 14,
  },
  medium: {
    fontSize: 16,
  },
  large: {
    fontSize: 24,
  },
  xlarge: {
    fontSize: 32,
  },
});
```

### 3. **Status Badge Component**
```typescript
// components/atoms/StatusBadge/StatusBadge.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/hooks/useTheme';

export interface StatusBadgeProps {
  status: 'pending' | 'acknowledged' | 'disputed' | 'settled' | 'overdue';
  size?: 'small' | 'medium';
  testID?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'medium',
  testID
}) => {
  const theme = useTheme();
  
  const getStatusConfig = () => {
    const configs = {
      pending: {
        label: 'Pending',
        backgroundColor: theme.colors.warning,
        textColor: '#FFFFFF',
        icon: '⏳'
      },
      acknowledged: {
        label: 'Acknowledged',
        backgroundColor: theme.colors.info,
        textColor: '#FFFFFF',
        icon: '✓'
      },
      disputed: {
        label: 'Disputed',
        backgroundColor: theme.colors.error,
        textColor: '#FFFFFF',
        icon: '⚠️'
      },
      settled: {
        label: 'Settled',
        backgroundColor: theme.colors.success,
        textColor: '#FFFFFF',
        icon: '✅'
      },
      overdue: {
        label: 'Overdue',
        backgroundColor: '#DC2626',
        textColor: '#FFFFFF',
        icon: '🔴'
      }
    };
    
    return configs[status];
  };

  const config = getStatusConfig();
  
  const containerStyles = [
    styles.container,
    styles[size],
    { backgroundColor: config.backgroundColor }
  ];

  const textStyles = [
    styles.text,
    styles[`text${size.charAt(0).toUpperCase() + size.slice(1)}`],
    { color: config.textColor }
  ];

  return (
    <View 
      style={containerStyles}
      testID={testID}
      accessibilityLabel={`Status: ${config.label}`}
      accessibilityRole="text"
    >
      <Text style={styles.icon}>{config.icon}</Text>
      <Text style={textStyles}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  small: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  medium: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  text: {
    fontFamily: 'Inter-Medium',
    fontWeight: '500',
  },
  textSmall: {
    fontSize: 12,
  },
  textMedium: {
    fontSize: 14,
  },
  icon: {
    marginRight: 4,
    fontSize: 12,
  },
});
```

---

## 🧬 Molecular Components

### 1. **Debt Card Component**
```typescript
// components/molecules/DebtCard/DebtCard.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { AmountDisplay } from '@/components/atoms/AmountDisplay';
import { StatusBadge } from '@/components/atoms/StatusBadge';
import { Avatar } from '@/components/atoms/Avatar';
import { useTheme } from '@/hooks/useTheme';
import type { Debt, User } from '@/types';

export interface DebtCardProps {
  debt: Debt;
  otherParty: User;
  userRole: 'creditor' | 'debtor';
  onPress: () => void;
  onSwipeSettle?: () => void;
  onSwipeRemind?: () => void;
  testID?: string;
}

export const DebtCard: React.FC<DebtCardProps> = ({
  debt,
  otherParty,
  userRole,
  onPress,
  onSwipeSettle,
  onSwipeRemind,
  testID
}) => {
  const theme = useTheme();

  const renderRightActions = () => {
    const actions = [];
    
    if (userRole === 'creditor' && onSwipeRemind) {
      actions.push(
        <TouchableOpacity
          key="remind"
          style={[styles.actionButton, { backgroundColor: theme.colors.warning }]}
          onPress={onSwipeRemind}
        >
          <Text style={styles.actionText}>Remind</Text>
        </TouchableOpacity>
      );
    }
    
    if (onSwipeSettle) {
      actions.push(
        <TouchableOpacity
          key="settle"
          style={[styles.actionButton, { backgroundColor: theme.colors.success }]}
          onPress={onSwipeSettle}
        >
          <Text style={styles.actionText}>Settle</Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.actionsContainer}>
        {actions}
      </View>
    );
  };

  const getAmountType = (): 'positive' | 'negative' | 'neutral' => {
    if (userRole === 'creditor') return 'positive';
    if (userRole === 'debtor') return 'negative';
    return 'neutral';
  };

  const getDueDateText = (): string => {
    if (!debt.dueDate) return '';
    
    const now = new Date();
    const due = new Date(debt.dueDate);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)} days`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    return `Due in ${diffDays} days`;
  };

  const isOverdue = debt.dueDate && new Date(debt.dueDate) < new Date();
  const cardStatus = isOverdue ? 'overdue' : debt.status;

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      testID={testID}
    >
      <TouchableOpacity
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface },
          isOverdue && { borderLeftColor: theme.colors.error, borderLeftWidth: 4 }
        ]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.header}>
          <View style={styles.userInfo}>
            <Avatar
              source={{ uri: otherParty.avatarUrl }}
              fallback={`${otherParty.firstName[0]}${otherParty.lastName[0]}`}
              size="medium"
            />
            <View style={styles.userDetails}>
              <Text style={[styles.userName, { color: theme.colors.text.primary }]}>
                {`${otherParty.firstName} ${otherParty.lastName}`}
              </Text>
              <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
                {debt.description}
              </Text>
            </View>
          </View>
          <View style={styles.amountContainer}>
            <AmountDisplay
              amount={debt.amount}
              currency={debt.currency}
              type={getAmountType()}
              size="large"
              testID={`${testID}-amount`}
            />
            <StatusBadge 
              status={cardStatus as any}
              size="small"
              testID={`${testID}-status`}
            />
          </View>
        </View>

        <View style={styles.footer}>
          {debt.category && (
            <Text style={[styles.category, { color: theme.colors.text.secondary }]}>
              {debt.category}
            </Text>
          )}
          {debt.dueDate && (
            <Text 
              style={[
                styles.dueDate, 
                { color: isOverdue ? theme.colors.error : theme.colors.text.secondary }
              ]}
            >
              {getDueDateText()}
            </Text>
          )}
          {debt.group && (
            <Text style={[styles.group, { color: theme.colors.text.secondary }]}>
              👥 {debt.group.name}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  userDetails: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Inter-SemiBold',
  },
  description: {
    fontSize: 14,
    marginTop: 2,
    fontFamily: 'Inter-Regular',
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  category: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dueDate: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  group: {
    fontSize: 12,
    fontFamily: 'Inter-Medium',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
  },
  actionText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
```

### 2. **Settlement Form Component**
```typescript
// components/molecules/SettlementForm/SettlementForm.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Button } from '@/components/atoms/Button';
import { Input } from '@/components/atoms/Input';
import { RadioGroup } from '@/components/atoms/RadioGroup';
import { ImagePicker } from '@/components/atoms/ImagePicker';
import { useTheme } from '@/hooks/useTheme';
import type { Debt, SettlementRequest } from '@/types';

export interface SettlementFormProps {
  debt: Debt;
  onSubmit: (request: SettlementRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const SettlementForm: React.FC<SettlementFormProps> = ({
  debt,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const theme = useTheme();
  const [amount, setAmount] = useState(debt.amount.toString());
  const [settlementMethod, setSettlementMethod] = useState('bank_transfer');
  const [paymentProofUri, setPaymentProofUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  const paymentMethods = [
    { label: 'Cash', value: 'cash' },
    { label: 'Bank Transfer', value: 'bank_transfer' },
    { label: 'Venmo/PayPal', value: 'payment_app' },
    { label: 'Other', value: 'other' }
  ];

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);
    
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    if (parsedAmount > debt.amount) {
      Alert.alert(
        'Amount Too High', 
        `Amount cannot exceed the debt amount of ${debt.currency} ${debt.amount}`
      );
      return;
    }

    const request: SettlementRequest = {
      debtId: debt.id,
      amount: parsedAmount,
      currency: debt.currency,
      settlementMethod,
      paymentProofUri,
      notes: notes.trim() || undefined
    };

    try {
      await onSubmit(request);
    } catch (error) {
      Alert.alert('Error', 'Failed to submit settlement request');
    }
  };

  const isPartialSettlement = parseFloat(amount) < debt.amount;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.text.primary }]}>
          Request Settlement
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Debt: {debt.description}
        </Text>
      </View>

      <View style={styles.form}>
        <Input
          label="Settlement Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
          placeholder="0.00"
          prefix={debt.currency}
          error={
            parseFloat(amount) > debt.amount 
              ? `Cannot exceed ${debt.currency} ${debt.amount}`
              : undefined
          }
        />

        {isPartialSettlement && (
          <Text style={[styles.partialWarning, { color: theme.colors.warning }]}>
            This is a partial settlement. Remaining amount: {debt.currency} {debt.amount - parseFloat(amount || '0')}
          </Text>
        )}

        <RadioGroup
          label="Payment Method"
          options={paymentMethods}
          value={settlementMethod}
          onChange={setSettlementMethod}
        />

        <ImagePicker
          label="Payment Proof (Optional)"
          onImageSelected={setPaymentProofUri}
          placeholder="Add receipt or screenshot"
        />

        <Input
          label="Notes (Optional)"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any additional notes..."
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.actions}>
        <Button
          title="Cancel"
          onPress={onCancel}
          variant="ghost"
          style={styles.cancelButton}
        />
        <Button
          title="Request Settlement"
          onPress={handleSubmit}
          loading={loading}
          style={styles.submitButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Inter-Bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
  },
  form: {
    flex: 1,
  },
  partialWarning: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    marginTop: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 2,
  },
});
```

---

## 🔧 Organism Components

### 1. **Debt List Component**
```typescript
// components/organisms/DebtList/DebtList.tsx
import React, { useMemo, useState } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl } from 'react-native';
import { DebtCard } from '@/components/molecules/DebtCard';
import { EmptyState } from '@/components/atoms/EmptyState';
import { FilterTabs } from '@/components/atoms/FilterTabs';
import { SearchBar } from '@/components/atoms/SearchBar';
import { useTheme } from '@/hooks/useTheme';
import { useDebounce } from '@/hooks/useDebounce';
import type { Debt, User, DebtFilter } from '@/types';

export interface DebtListProps {
  debts: Debt[];
  currentUser: User;
  loading?: boolean;
  onRefresh?: () => void;
  onDebtPress: (debt: Debt) => void;
  onSettleDebt: (debt: Debt) => void;
  onRemindDebt: (debt: Debt) => void;
  testID?: string;
}

export const DebtList: React.FC<DebtListProps> = ({
  debts,
  currentUser,
  loading = false,
  onRefresh,
  onDebtPress,
  onSettleDebt,
  onRemindDebt,
  testID
}) => {
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<DebtFilter>('all');
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const filterOptions = [
    { label: 'All', value: 'all' as DebtFilter },
    { label: 'Owed to Me', value: 'creditor' as DebtFilter },
    { label: 'I Owe', value: 'debtor' as DebtFilter },
    { label: 'Overdue', value: 'overdue' as DebtFilter },
  ];

  const filteredDebts = useMemo(() => {
    let filtered = debts;

    // Apply role filter
    if (activeFilter === 'creditor') {
      filtered = filtered.filter(debt => debt.creditorId === currentUser.id);
    } else if (activeFilter === 'debtor') {
      filtered = filtered.filter(debt => debt.debtorId === currentUser.id);
    } else if (activeFilter === 'overdue') {
      filtered = filtered.filter(debt => 
        debt.dueDate && new Date(debt.dueDate) < new Date() && debt.status === 'pending'
      );
    }

    // Apply search filter
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(debt =>
        debt.description.toLowerCase().includes(query) ||
        debt.otherParty.firstName.toLowerCase().includes(query) ||
        debt.otherParty.lastName.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => {
      // Sort by creation date, newest first
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [debts, activeFilter, debouncedSearchQuery, currentUser.id]);

  const renderDebtCard = ({ item: debt }: { item: Debt }) => {
    const userRole = debt.creditorId === currentUser.id ? 'creditor' : 'debtor';
    const otherParty = userRole === 'creditor' ? debt.debtor : debt.creditor;

    return (
      <DebtCard
        debt={debt}
        otherParty={otherParty}
        userRole={userRole}
        onPress={() => onDebtPress(debt)}
        onSwipeSettle={() => onSettleDebt(debt)}
        onSwipeRemind={userRole === 'creditor' ? () => onRemindDebt(debt) : undefined}
        testID={`${testID}-debt-${debt.id}`}
      />
    );
  };

  const renderEmptyState = () => (
    <EmptyState
      title="No debts found"
      subtitle={
        activeFilter === 'all' 
          ? "You don't have any debts yet. Start by adding a new debt!"
          : `No debts found for "${filterOptions.find(f => f.value === activeFilter)?.label}"`
      }
      icon="💰"
      actionLabel={activeFilter === 'all' ? "Add Debt" : undefined}
      onAction={activeFilter === 'all' ? () => console.log('Add debt') : undefined}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search debts or people..."
        testID={`${testID}-search`}
      />
      <FilterTabs
        options={filterOptions}
        activeValue={activeFilter}
        onChange={setActiveFilter}
        testID={`${testID}-filters`}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredDebts}
        renderItem={renderDebtCard}
        keyExtractor={(debt) => debt.id}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={loading}
              onRefresh={onRefresh}
              tintColor={theme.colors.primary}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          filteredDebts.length === 0 ? styles.emptyContainer : styles.contentContainer
        }
        testID={testID}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingBottom: 8,
  },
  contentContainer: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});
```

---

## 🎛️ State Management

### 1. **Auth Store (Zustand)**
```typescript
// store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authApi } from '@/services/api/auth';
import type { User, AuthTokens } from '@/types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthActions {
  login: (email: string, password: string, twoFactorCode?: string) => Promise<void>;
  register: (userData: RegisterUserData) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (email, password, twoFactorCode) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.login({
            email,
            password,
            twoFactorCode
          });
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error.message || 'Login failed',
            isLoading: false
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await authApi.register(userData);
          
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error.message || 'Registration failed',
            isLoading: false
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          const { tokens } = get();
          if (tokens?.refreshToken) {
            await authApi.logout(tokens.refreshToken);
          }
        } catch (error) {
          // Ignore logout errors, clear local state anyway
          console.warn('Logout error:', error);
        } finally {
          set({
            user: null,
            tokens: null,
            isAuthenticated: false,
            isLoading: false,
            error: null
          });
        }
      },

      refreshTokens: async () => {
        const { tokens } = get();
        if (!tokens?.refreshToken) {
          throw new Error('No refresh token available');
        }
        
        try {
          const response = await authApi.refresh(tokens.refreshToken);
          
          set({
            tokens: response.tokens,
            error: null
          });
        } catch (error) {
          // Refresh failed, logout user
          await get().logout();
          throw error;
        }
      },

      updateProfile: async (userData) => {
        set({ isLoading: true, error: null });
        
        try {
          const updatedUser = await authApi.updateProfile(userData);
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null
          });
        } catch (error) {
          set({
            error: error.message || 'Profile update failed',
            isLoading: false
          });
          throw error;
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'settler-auth',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
```

### 2. **Debt Queries (React Query)**
```typescript
// hooks/queries/useDebts.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { debtApi } from '@/services/api/debt';
import { useAuthStore } from '@/store/authStore';
import type { Debt, CreateDebtRequest, DebtFilters } from '@/types';

export const useDebts = (filters?: DebtFilters) => {
  const user = useAuthStore(state => state.user);
  
  return useQuery({
    queryKey: ['debts', user?.id, filters],
    queryFn: () => debtApi.getDebts(filters),
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useDebtDetail = (debtId: string) => {
  return useQuery({
    queryKey: ['debt', debtId],
    queryFn: () => debtApi.getDebt(debtId),
    enabled: !!debtId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useCreateDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (request: CreateDebtRequest) => debtApi.createDebt(request),
    onSuccess: () => {
      // Invalidate and refetch debts
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    },
    onError: (error) => {
      console.error('Create debt error:', error);
    }
  });
};

export const useUpdateDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ debtId, updates }: { debtId: string; updates: Partial<Debt> }) =>
      debtApi.updateDebt(debtId, updates),
    onSuccess: (updatedDebt) => {
      // Update debt in cache
      queryClient.setQueryData(['debt', updatedDebt.id], updatedDebt);
      // Invalidate debts list
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    }
  });
};

export const useAcknowledgeDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (debtId: string) => debtApi.acknowledgeDebt(debtId),
    onSuccess: (updatedDebt) => {
      queryClient.setQueryData(['debt', updatedDebt.id], updatedDebt);
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    }
  });
};

export const useDisputeDebt = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ debtId, reason }: { debtId: string; reason: string }) =>
      debtApi.disputeDebt(debtId, reason),
    onSuccess: (updatedDebt) => {
      queryClient.setQueryData(['debt', updatedDebt.id], updatedDebt);
      queryClient.invalidateQueries({ queryKey: ['debts'] });
    }
  });
};
```

---

## 🧪 Component Testing

### 1. **Button Component Test**
```typescript
// components/atoms/Button/__tests__/Button.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Button } from '../Button';

const mockOnPress = jest.fn();

describe('Button Component', () => {
  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders correctly with title', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    expect(getByText('Test Button')).toBeTruthy();
  });

  it('calls onPress when pressed', () => {
    const { getByText } = render(
      <Button title="Test Button" onPress={mockOnPress} />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows loading indicator when loading', () => {
    const { getByTestId, queryByText } = render(
      <Button 
        title="Test Button" 
        onPress={mockOnPress} 
        loading={true}
        testID="test-button"
      />
    );
    
    expect(getByTestId('test-button')).toBeTruthy();
    expect(queryByText('Test Button')).toBeNull();
  });

  it('is disabled when disabled prop is true', () => {
    const { getByText } = render(
      <Button 
        title="Test Button" 
        onPress={mockOnPress} 
        disabled={true}
      />
    );
    
    fireEvent.press(getByText('Test Button'));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('applies correct variant styles', () => {
    const { getByTestId } = render(
      <Button 
        title="Test Button" 
        onPress={mockOnPress} 
        variant="danger"
        testID="danger-button"
      />
    );
    
    const button = getByTestId('danger-button');
    expect(button.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          backgroundColor: '#EF4444'
        })
      ])
    );
  });
});
```

### 2. **DebtCard Component Test**
```typescript
// components/molecules/DebtCard/__tests__/DebtCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { DebtCard } from '../DebtCard';
import { mockDebt, mockUser } from '@/test/mocks';

const mockOnPress = jest.fn();
const mockOnSettle = jest.fn();

describe('DebtCard Component', () => {
  beforeEach(() => {
    mockOnPress.mockClear();
    mockOnSettle.mockClear();
  });

  it('renders debt information correctly', () => {
    const { getByText } = render(
      <DebtCard
        debt={mockDebt}
        otherParty={mockUser}
        userRole="creditor"
        onPress={mockOnPress}
        onSwipeSettle={mockOnSettle}
      />
    );
    
    expect(getByText('John Doe')).toBeTruthy();
    expect(getByText('Lunch money')).toBeTruthy();
    expect(getByText('$25.00')).toBeTruthy();
  });

  it('shows correct amount color for creditor', () => {
    const { getByTestId } = render(
      <DebtCard
        debt={mockDebt}
        otherParty={mockUser}
        userRole="creditor"
        onPress={mockOnPress}
        testID="debt-card"
      />
    );
    
    const amount = getByTestId('debt-card-amount');
    expect(amount.props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          color: '#10B981' // positive color
        })
      ])
    );
  });

  it('calls onPress when card is pressed', () => {
    const { getByTestId } = render(
      <DebtCard
        debt={mockDebt}
        otherParty={mockUser}
        userRole="creditor"
        onPress={mockOnPress}
        testID="debt-card"
      />
    );
    
    fireEvent.press(getByTestId('debt-card'));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('shows overdue styling when debt is overdue', () => {
    const overdueDebt = {
      ...mockDebt,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Yesterday
    };
    
    const { getByTestId } = render(
      <DebtCard
        debt={overdueDebt}
        otherParty={mockUser}
        userRole="debtor"
        onPress={mockOnPress}
        testID="debt-card"
      />
    );
    
    expect(getByTestId('debt-card-status')).toBeTruthy();
  });
});
```

---

## 🤖 AI Implementation Prompt

```
You are tasked with implementing the Settler app frontend components. Use the following guidelines:

1. **React Native with Expo**:
   - Use Expo SDK 49+ with React Native 0.72+
   - Implement TypeScript strictly throughout
   - Use Expo Router for navigation
   - Add proper accessibility support

2. **Component Architecture**:
   - Follow Atomic Design principles strictly
   - Create reusable, composable components
   - Implement proper prop validation with TypeScript
   - Add comprehensive component documentation

3. **State Management**:
   - Use Zustand for client state management
   - Implement React Query for server state
   - Add proper error handling and loading states
   - Create optimistic updates where appropriate

4. **Styling & Theming**:
   - Use StyleSheet for performance
   - Implement dark/light theme support
   - Follow design system color palette
   - Add responsive design patterns

5. **Performance Optimization**:
   - Use React.memo for expensive components
   - Implement FlatList for large lists
   - Add proper image caching and optimization
   - Use code splitting where appropriate

6. **User Experience**:
   - Add smooth animations with Reanimated
   - Implement proper gesture handling
   - Add haptic feedback for interactions
   - Create intuitive loading and error states

7. **Testing**:
   - Add unit tests for all components
   - Test accessibility features
   - Add integration tests for complex flows
   - Mock external dependencies properly

8. **Offline Support**:
   - Cache critical data locally
   - Handle network connectivity changes
   - Show appropriate offline indicators
   - Queue actions for when online

Generate production-ready React Native components that follow these specifications exactly.
``` 