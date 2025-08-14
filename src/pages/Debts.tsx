import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Search, Plus, Filter, Users, Calendar, DollarSign } from 'lucide-react'

interface Debt {
  id: string
  title: string
  description: string
  amount: number
  currency: string
  status: 'active' | 'completed' | 'cancelled'
  participants: number
  progress: number
  createdAt: string
  dueDate: string
  creator: string
}

export default function Debts() {
  const [debts, setDebts] = useState<Debt[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  // Mock data
  const mockDebts: Debt[] = [
    {
      id: '1',
      title: 'شام گروهی',
      description: 'شام گروهی در رستوران ایرانی',
      amount: 250000,
      currency: 'تومان',
      status: 'active',
      participants: 8,
      progress: 75,
      createdAt: '2024-01-15',
      dueDate: '2024-02-15',
      creator: 'علی احمدی'
    },
    {
      id: '2',
      title: 'سفر کوهنوردی',
      description: 'هزینه‌های سفر کوهنوردی دماوند',
      amount: 180000,
      currency: 'تومان',
      status: 'completed',
      participants: 12,
      progress: 100,
      createdAt: '2024-01-10',
      dueDate: '2024-01-25',
      creator: 'مریم کریمی'
    },
    {
      id: '3',
      title: 'خرید هدیه تولد',
      description: 'هدیه تولد برای دوست مشترک',
      amount: 120000,
      currency: 'تومان',
      status: 'active',
      participants: 5,
      progress: 60,
      createdAt: '2024-01-20',
      dueDate: '2024-02-05',
      creator: 'حسن محمدی'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDebts(mockDebts)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredDebts = debts.filter(debt => {
    const matchesSearch = debt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         debt.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || debt.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const handleCreateDebt = () => {
    // TODO: Implement API call
    toast({
      title: "بدهی جدید ایجاد شد",
      description: "بدهی با موفقیت ایجاد شد و به شرکت‌کنندگان اطلاع داده شد.",
    })
    setShowCreateDialog(false)
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">مدیریت بدهی‌ها</h1>
          <p className="text-muted-foreground">مدیریت و پیگیری بدهی‌های گروهی</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              ایجاد بدهی جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>ایجاد بدهی جدید</DialogTitle>
              <DialogDescription>
                اطلاعات بدهی جدید را وارد کنید
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">عنوان</Label>
                <Input id="title" placeholder="عنوان بدهی" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea id="description" placeholder="توضیحات بدهی" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="amount">مبلغ</Label>
                  <Input id="amount" type="number" placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">واحد پول</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="toman">تومان</SelectItem>
                      <SelectItem value="rial">ریال</SelectItem>
                      <SelectItem value="dollar">دلار</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                انصراف
              </Button>
              <Button onClick={handleCreateDebt}>
                ایجاد بدهی
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="جستجو در بدهی‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="فیلتر وضعیت" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="active">فعال</SelectItem>
            <SelectItem value="completed">تکمیل شده</SelectItem>
            <SelectItem value="cancelled">لغو شده</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Debts List */}
      <div className="grid gap-4">
        {filteredDebts.map((debt) => (
          <Card key={debt.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {debt.title}
                    <Badge variant={debt.status === 'active' ? 'default' : debt.status === 'completed' ? 'secondary' : 'destructive'}>
                      {debt.status === 'active' ? 'فعال' : debt.status === 'completed' ? 'تکمیل شده' : 'لغو شده'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="mt-2">{debt.description}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {debt.amount.toLocaleString()} {debt.currency}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {debt.participants} شرکت‌کننده
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(debt.dueDate).toLocaleDateString('fa-IR')}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>پیشرفت پرداخت</span>
                    <span>{debt.progress}%</span>
                  </div>
                  <Progress value={debt.progress} className="h-2" />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-muted-foreground">
                    ایجاد شده توسط: {debt.creator}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      جزئیات
                    </Button>
                    <Button size="sm">
                      پرداخت
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDebts.length === 0 && (
        <div className="text-center py-12">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">بدهی‌ای یافت نشد</h3>
          <p className="text-muted-foreground">هیچ بدهی‌ای با فیلترهای انتخاب شده یافت نشد.</p>
        </div>
      )}
    </div>
  )
}
