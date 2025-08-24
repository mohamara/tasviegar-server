const API_BASE_URL = 'http://localhost:3000/api';

// Types
export interface Debt {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'active' | 'completed' | 'cancelled';
  participants: number;
  progress: number;
  createdAt: string;
  dueDate: string;
  creator: string;
  creditorType: 'real' | 'legal';
  creditorId: string;
  creditorName: string;
  type: string;
  contractNumber: string;
}

export interface Credit {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  status: 'active' | 'completed' | 'cancelled';
  participants: number;
  progress: number;
  createdAt: string;
  dueDate: string;
  creator: string;
  debtorType: 'real' | 'legal';
  debtorId: string;
  debtorName: string;
  type: string;
  contractNumber: string;
}

export interface Settlement {
  id: string;
  chain: string;
  amount: number;
  participants: number;
  deadline: string;
  status: string;
  type: string;
  from: string;
  to: string;
  createdAt: string;
}

export interface DashboardStats {
  totalSettlements: number;
  totalAmount: number;
  activePartners: number;
  successRate: number;
}

// API Functions
export const api = {
  // Auth
  async login(phone: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, password }),
    });
    return response.json();
  },

  async register(userData: any) {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return response.json();
  },

  // Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await fetch(`${API_BASE_URL}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  // Debts
  async getDebts(): Promise<Debt[]> {
    const response = await fetch(`${API_BASE_URL}/debts`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  async createDebt(debtData: Omit<Debt, 'id' | 'createdAt' | 'creator'>): Promise<Debt> {
    const response = await fetch(`${API_BASE_URL}/debts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(debtData),
    });
    return response.json();
  },

  async updateDebt(id: string, debtData: Partial<Debt>): Promise<Debt> {
    const response = await fetch(`${API_BASE_URL}/debts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(debtData),
    });
    return response.json();
  },

  async deleteDebt(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/debts/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Credits
  async getCredits(): Promise<Credit[]> {
    const response = await fetch(`${API_BASE_URL}/credits`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  async createCredit(creditData: Omit<Credit, 'id' | 'createdAt' | 'creator'>): Promise<Credit> {
    const response = await fetch(`${API_BASE_URL}/credits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(creditData),
    });
    return response.json();
  },

  async updateCredit(id: string, creditData: Partial<Credit>): Promise<Credit> {
    const response = await fetch(`${API_BASE_URL}/credits/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(creditData),
    });
    return response.json();
  },

  async deleteCredit(id: string): Promise<void> {
    await fetch(`${API_BASE_URL}/credits/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
  },

  // Settlements
  async getSettlements(): Promise<Settlement[]> {
    const response = await fetch(`${API_BASE_URL}/settlements`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  async createSettlement(settlementData: Omit<Settlement, 'id' | 'createdAt'>): Promise<Settlement> {
    const response = await fetch(`${API_BASE_URL}/settlements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(settlementData),
    });
    return response.json();
  },

  async approveSettlement(id: string): Promise<Settlement> {
    const response = await fetch(`${API_BASE_URL}/settlements/${id}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  // Search Chain
  async searchChain(): Promise<Settlement[]> {
    const response = await fetch(`${API_BASE_URL}/settlements/search-chain`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.json();
  },

  // Reports
  async generateReport(type: 'monthly' | 'yearly'): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/reports/${type}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
    });
    return response.blob();
  },
};

// Error handling
export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  if (error.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }
  throw error;
};

// Mock data for development (when backend is not available)
export const mockApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    return {
      totalSettlements: 124,
      totalAmount: 2300000,
      activePartners: 45,
      successRate: 98.5,
    };
  },

  getDebts: async (): Promise<Debt[]> => {
    return [
      {
        id: '1',
        title: 'بدهی به شرکت بتا',
        description: 'بدهی مربوط به خرید کالا',
        amount: 200000000,
        currency: 'ریال',
        status: 'active',
        participants: 1,
        progress: 0,
        createdAt: '2024-01-15',
        dueDate: '2024-06-15',
        creator: 'user1',
        creditorType: 'legal',
        creditorId: '10123456789',
        creditorName: 'شرکت بتا',
        type: 'goods',
        contractNumber: '1403-1234',
      },
      {
        id: '2',
        title: 'بدهی به شرکت گاما',
        description: 'بدهی مربوط به خدمات',
        amount: 150000000,
        currency: 'ریال',
        status: 'active',
        participants: 1,
        progress: 0,
        createdAt: '2024-01-10',
        dueDate: '2024-07-10',
        creator: 'user1',
        creditorType: 'legal',
        creditorId: '10123456790',
        creditorName: 'شرکت گاما',
        type: 'services',
        contractNumber: '1403-5678',
      },
    ];
  },

  getCredits: async (): Promise<Credit[]> => {
    return [
      {
        id: '1',
        title: 'طلب از شرکت دلتا',
        description: 'طلب مربوط به فروش کالا',
        amount: 300000000,
        currency: 'ریال',
        status: 'active',
        participants: 1,
        progress: 0,
        createdAt: '2024-01-20',
        dueDate: '2024-06-20',
        creator: 'user1',
        debtorType: 'legal',
        debtorId: '10123456791',
        debtorName: 'شرکت دلتا',
        type: 'goods',
        contractNumber: '1403-9012',
      },
      {
        id: '2',
        title: 'طلب از شرکت اپسیلون',
        description: 'طلب مربوط به ارائه خدمات',
        amount: 100000000,
        currency: 'ریال',
        status: 'active',
        participants: 1,
        progress: 0,
        createdAt: '2024-01-05',
        dueDate: '2024-06-05',
        creator: 'user1',
        debtorType: 'legal',
        debtorId: '10123456792',
        debtorName: 'شرکت اپسیلون',
        type: 'services',
        contractNumber: '1403-3456',
      },
    ];
  },

  getSettlements: async (): Promise<Settlement[]> => {
    return [
      {
        id: '1',
        chain: 'آلفا → بتا → گاما → آلفا',
        amount: 150000000,
        participants: 3,
        deadline: '2024-01-20',
        status: 'منتظر امضای شما',
        type: 'chain',
        from: 'شرکت آلفا',
        to: 'شرکت گاما',
        createdAt: '2024-01-15',
      },
      {
        id: '2',
        chain: 'دلتا → اپسیلون → زتا → دلتا',
        amount: 300000000,
        participants: 3,
        deadline: '2024-01-22',
        status: 'منتظر امضای دیگران',
        type: 'chain',
        from: 'شرکت دلتا',
        to: 'شرکت زتا',
        createdAt: '2024-01-14',
      },
    ];
  },

  searchChain: async (): Promise<Settlement[]> => {
    return [
      {
        id: '3',
        chain: 'زتا → اتا → تتا → زتا',
        amount: 250000000,
        participants: 3,
        deadline: '2024-01-25',
        status: 'منتظر امضای شما',
        type: 'chain',
        from: 'شرکت زتا',
        to: 'شرکت تتا',
        createdAt: '2024-01-16',
      },
    ];
  },

  createDebt: async (debtData: any): Promise<Debt> => {
    return {
      id: Date.now().toString(),
      ...debtData,
      createdAt: new Date().toISOString(),
      creator: 'user1',
    };
  },

  createCredit: async (creditData: any): Promise<Credit> => {
    return {
      id: Date.now().toString(),
      ...creditData,
      createdAt: new Date().toISOString(),
      creator: 'user1',
    };
  },

  deleteDebt: async (id: string): Promise<void> => {
    // Mock delete
  },

  deleteCredit: async (id: string): Promise<void> => {
    // Mock delete
  },
};
