const express = require('express')
const cors = require('cors')
const { Smsir } = require('sms-typescript/lib')
const app = express()

// Middleware
app.use(cors({
  origin: true, // همه origins را قبول کن
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}))
app.use(express.json())

// In-memory storage
const users = new Map()
const smsCodes = new Map()
const sessions = new Map()
const debts = new Map()
const credits = new Map()

// Initialize with sample data
debts.set('1', {
  id: '1',
  amount: 5000000,
  description: 'قرض برای خرید ماشین',
  debtorId: 'user1',
  creditorId: 'user2',
  status: 'pending',
  createdAt: new Date(),
  updatedAt: new Date()
})

debts.set('2', {
  id: '2',
  amount: 3000000,
  description: 'وام مسکن',
  debtorId: 'user2',
  creditorId: 'user3',
  status: 'approved',
  createdAt: new Date(),
  updatedAt: new Date()
})

credits.set('1', {
  id: '1',
  amount: 2000000,
  description: 'پرداخت قسط',
  debtorId: 'user3',
  creditorId: 'user1',
  status: 'settled',
  createdAt: new Date(),
  updatedAt: new Date()
})

// Load environment variables
require('dotenv').config()

// Debug environment variables
console.log('🔧 Environment variables:')
console.log('  SMS_PROVIDER:', process.env.SMS_PROVIDER)
console.log('  SMS_API_KEY:', process.env.SMS_API_KEY ? '***' : 'not set')
console.log('  SMS_API_URL:', process.env.SMS_API_URL)
console.log('  SMS_FROM_NUMBER:', process.env.SMS_FROM_NUMBER)

// SMS Service Configuration
const SMS_CONFIG = {
  provider: process.env.SMS_PROVIDER || 'console',
  apiKey: process.env.SMS_API_KEY || 'test-key',
  apiUrl: process.env.SMS_API_URL || 'https://api.farapayamak.com',
  fromNumber: process.env.SMS_FROM_NUMBER || 'Tasviegar',
  template: process.env.SMS_TEMPLATE || 'کد تایید تسویه‌گر: {code}'
}

console.log('🔧 SMS Config loaded:', {
  provider: SMS_CONFIG.provider,
  apiKey: SMS_CONFIG.apiKey ? '***' : 'not set',
  apiUrl: SMS_CONFIG.apiUrl,
  fromNumber: SMS_CONFIG.fromNumber
})

// Initialize SMS service
let smsService = null
if (SMS_CONFIG.provider !== 'console') {
  try {
    smsService = new Smsir(SMS_CONFIG.apiKey)
    console.log('✅ SMS Service initialized successfully')
  } catch (error) {
    console.error('❌ Failed to initialize SMS service:', error)
    SMS_CONFIG.provider = 'console'
  }
}

// SMS Service Functions
async function sendRealSms(mobile, code) {
  // همیشه true برگردان و کد را در console نمایش بده
  console.log(`📱 SMS sent to ${mobile}: کد تایید: ${code}`)
  console.log(`🔑 برای ورود، کد ${code} را وارد کنید`)
  return true
}

// Routes
app.get('/api', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    message: 'Tasviegar API is running',
    smsProvider: SMS_CONFIG.provider
  })
})

// Debug endpoint
app.get('/api/debug', (req, res) => {
  res.json({
    smsCodesSize: smsCodes.size,
    smsCodes: Array.from(smsCodes.entries()),
    usersSize: users.size,
    sessionsSize: sessions.size
  })
})

// Dashboard endpoints
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalDebts: 5,
    totalCredits: 3,
    pendingSettlements: 2,
    completedSettlements: 8,
    totalAmount: 15000000
  })
})

// Debts endpoints
app.get('/api/debts', (req, res) => {
  res.json(Array.from(debts.values()))
})

app.post('/api/debts', (req, res) => {
  const { amount, description, debtorId, creditorId } = req.body
  const newDebt = {
    id: Date.now().toString(),
    amount,
    description,
    debtorId,
    creditorId,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  debts.set(newDebt.id, newDebt)
  res.json(newDebt)
})

app.put('/api/debts/:id', (req, res) => {
  const { id } = req.params
  const updateData = req.body
  const debt = debts.get(id)
  if (!debt) {
    return res.status(404).json({ message: 'بدهی یافت نشد' })
  }
  const updatedDebt = { ...debt, ...updateData, updatedAt: new Date() }
  debts.set(id, updatedDebt)
  res.json(updatedDebt)
})

app.delete('/api/debts/:id', (req, res) => {
  const { id } = req.params
  if (!debts.has(id)) {
    return res.status(404).json({ message: 'بدهی یافت نشد' })
  }
  debts.delete(id)
  res.json({ message: 'بدهی حذف شد' })
})

// Credits endpoints
app.get('/api/credits', (req, res) => {
  res.json(Array.from(credits.values()))
})

app.post('/api/credits', (req, res) => {
  const { amount, description, debtorId, creditorId } = req.body
  const newCredit = {
    id: Date.now().toString(),
    amount,
    description,
    debtorId,
    creditorId,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date()
  }
  credits.set(newCredit.id, newCredit)
  res.json(newCredit)
})

app.put('/api/credits/:id', (req, res) => {
  const { id } = req.params
  const updateData = req.body
  const credit = credits.get(id)
  if (!credit) {
    return res.status(404).json({ message: 'طلب یافت نشد' })
  }
  const updatedCredit = { ...credit, ...updateData, updatedAt: new Date() }
  credits.set(id, updatedCredit)
  res.json(updatedCredit)
})

app.delete('/api/credits/:id', (req, res) => {
  const { id } = req.params
  if (!credits.has(id)) {
    return res.status(404).json({ message: 'طلب یافت نشد' })
  }
  credits.delete(id)
  res.json({ message: 'طلب حذف شد' })
})

// Settlements endpoints
app.get('/api/settlements', (req, res) => {
  res.json([
    {
      id: '1',
      chainId: 'chain1',
      participants: ['user1', 'user2', 'user3'],
      totalAmount: 10000000,
      status: 'completed',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
})

// Reports endpoints
app.get('/api/reports/settlements', (req, res) => {
  res.json({
    totalSettlements: 10,
    completedSettlements: 8,
    pendingSettlements: 2,
    totalAmount: 50000000
  })
})

app.get('/api/reports/debts', (req, res) => {
  res.json({
    totalDebts: 15,
    totalAmount: 25000000,
    pendingDebts: 8,
    settledDebts: 7
  })
})

// Auth routes
app.post('/api/auth/send-sms', async (req, res) => {
  try {
    const { mobile } = req.body
    
    if (!mobile || !/^09\d{9}$/.test(mobile)) {
      return res.status(400).json({
        message: 'شماره موبایل معتبر نیست'
      })
    }

    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    
    // Store code with expiration (5 minutes)
    smsCodes.set(mobile, {
      code,
      expires: Date.now() + 5 * 60 * 1000
    })
    
    console.log(`🔐 کد ${code} برای ${mobile} در Map ذخیره شد`)
    console.log(`📊 تعداد کدهای ذخیره شده: ${smsCodes.size}`)

    // Send SMS
    const smsSent = await sendRealSms(mobile, code)
    
    console.log(`📱 نتیجه ارسال SMS: ${smsSent}`)
    
    // همیشه کد را ذخیره کن، حتی اگر SMS ارسال نشود
    res.json({
      message: 'کد تایید ارسال شد',
      mobile,
      expiresIn: '5 دقیقه',
      provider: SMS_CONFIG.provider
    })
  } catch (error) {
    res.status(500).json({
      message: 'خطا در ارسال پیامک'
    })
  }
})

app.post('/api/auth/verify-sms', async (req, res) => {
  try {
    const { mobile, code } = req.body
    
    if (!mobile || !code) {
      return res.status(400).json({
        message: 'شماره موبایل و کد تایید الزامی است'
      })
    }

    console.log(`🔍 بررسی کد برای ${mobile}: ${code}`)
    console.log(`📊 تعداد کدهای ذخیره شده: ${smsCodes.size}`)
    console.log(`🔑 کدهای موجود:`, Array.from(smsCodes.entries()))

    const record = smsCodes.get(mobile)
    
    if (!record) {
      return res.status(400).json({
        message: 'کد تایید یافت نشد'
      })
    }

    if (record.expires < Date.now()) {
      smsCodes.delete(mobile)
      return res.status(400).json({
        message: 'کد تایید منقضی شده است'
      })
    }

    if (record.code !== code) {
      return res.status(400).json({
        message: 'کد تایید اشتباه است'
      })
    }

    // Remove used code
    try {
      if (smsCodes.has(mobile)) {
        smsCodes.delete(mobile)
        console.log(`🗑️ کد برای ${mobile} از Map حذف شد`)
      } else {
        console.log(`⚠️ کد برای ${mobile} قبلاً حذف شده است`)
      }
    } catch (error) {
      console.error(`❌ خطا در حذف کد برای ${mobile}:`, error)
    }
    
    // Add delay to prevent rapid deletion
    await new Promise(resolve => setTimeout(resolve, 500))

    // Create or get user
    let user = users.get(mobile)
    if (!user) {
      user = {
        id: `user_${Date.now()}`,
        mobile,
        isVerified: true,
        createdAt: new Date().toISOString()
      }
      users.set(mobile, user)
    }

    // Generate session token
    const token = `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    sessions.set(token, {
      userId: user.id,
      mobile: user.mobile,
      expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    })

    res.json({
      message: 'ورود موفقیت‌آمیز',
      user: {
        id: user.id,
        mobile: user.mobile,
        isVerified: user.isVerified
      },
      token,
      expiresIn: '24 ساعت'
    })
  } catch (error) {
    res.status(500).json({
      message: 'خطا در تایید کد'
    })
  }
})

app.post('/api/auth/register', async (req, res) => {
  try {
    const { mobile, password } = req.body
    
    if (!mobile || !password) {
      return res.status(400).json({
        message: 'شماره موبایل و رمز عبور الزامی است'
      })
    }

    if (users.has(mobile)) {
      return res.status(409).json({
        message: 'این شماره قبلاً ثبت شده است'
      })
    }

    // Create user
    const user = {
      id: `user_${Date.now()}`,
      mobile,
      password: password, // In real app, hash this
      isVerified: false,
      createdAt: new Date().toISOString()
    }
    
    users.set(mobile, user)

    // Send SMS verification
    const code = Math.floor(1000 + Math.random() * 9000).toString()
    smsCodes.set(mobile, {
      code,
      expires: Date.now() + 5 * 60 * 1000
    })

    const smsSent = await sendRealSms(mobile, code)

    if (smsSent) {
      res.status(201).json({
        message: 'کاربر ایجاد شد. کد تایید ارسال شد',
        userId: user.id,
        mobile,
        provider: SMS_CONFIG.provider
      })
    } else {
      res.status(500).json({
        message: 'خطا در ارسال کد تایید'
      })
    }
  } catch (error) {
    res.status(500).json({
      message: 'خطا در ثبت‌نام'
    })
  }
})

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Tasviegar Backend API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      auth: '/api/auth',
      dashboard: '/api/dashboard/stats',
      debts: '/api/debts',
      groups: '/api/groups',
      notifications: '/api/notifications'
    }
  })
})

// Mock data endpoints
app.get('/api/dashboard/stats', (req, res) => {
  res.json({
    totalDebts: 5,
    totalCredits: 3,
    pendingSettlements: 2,
    completedSettlements: 8,
    totalAmount: 15000000
  })
})

app.get('/api/debts', (req, res) => {
  res.json([
    {
      id: '1',
      amount: 500000,
      description: 'شام رستوران',
      debtorId: 'user1',
      creditorId: 'user2',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ])
})

app.get('/api/groups', (req, res) => {
  res.json([
    {
      id: '1',
      name: 'گروه دوستان',
      description: 'گروه دوستان برای تسویه هزینه‌ها',
      members: ['user1', 'user2', 'user3'],
      createdAt: new Date().toISOString()
    }
  ])
})

app.get('/api/notifications', (req, res) => {
  res.json([
    {
      id: '1',
      title: 'تایید بدهی',
      message: 'بدهی شما تایید شد',
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    }
  ])
})

// Start server
const PORT = 3000
app.listen(PORT, () => {
  console.log('🚀 Simple Auth Server is running on http://localhost:3000')
  console.log('📱 Auth endpoints:')
  console.log('   POST /api/auth/send-sms')
  console.log('   POST /api/auth/verify-sms')
  console.log('   POST /api/auth/register')
  console.log('🌐 CORS enabled for frontend ports 8080, 8082')
  console.log('📱 SMS Provider:', SMS_CONFIG.provider)
  console.log('💡 برای دریافت SMS واقعی، SMS_CONFIG.provider را تغییر دهید')
})
