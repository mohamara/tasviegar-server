import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Search, Plus, Filter, Users, Shield, Settings, Copy, Eye, EyeOff } from 'lucide-react'

interface Group {
  id: string
  name: string
  description: string
  type: 'family' | 'friends' | 'work' | 'other'
  privacy: 'public' | 'private'
  memberCount: number
  maxMembers: number
  inviteCode: string
  createdAt: string
  creator: string
  isAdmin: boolean
}

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const { toast } = useToast()

  // Mock data
  const mockGroups: Group[] = [
    {
      id: '1',
      name: 'خانواده احمدی',
      description: 'گروه خانوادگی برای مدیریت هزینه‌های مشترک',
      type: 'family',
      privacy: 'private',
      memberCount: 8,
      maxMembers: 15,
      inviteCode: 'FAM123',
      createdAt: '2024-01-10',
      creator: 'علی احمدی',
      isAdmin: true
    },
    {
      id: '2',
      name: 'دوستان دانشگاه',
      description: 'گروه دوستان دانشگاه برای سفرها و تفریحات',
      type: 'friends',
      privacy: 'public',
      memberCount: 12,
      maxMembers: 20,
      inviteCode: 'UNI456',
      createdAt: '2024-01-05',
      creator: 'مریم کریمی',
      isAdmin: false
    },
    {
      id: '3',
      name: 'تیم کاری',
      description: 'گروه همکاران برای مدیریت پروژه‌ها',
      type: 'work',
      privacy: 'private',
      memberCount: 6,
      maxMembers: 10,
      inviteCode: 'WORK789',
      createdAt: '2024-01-15',
      creator: 'حسن محمدی',
      isAdmin: true
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setGroups(mockGroups)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || group.type === typeFilter
    return matchesSearch && matchesType
  })

  const handleCreateGroup = () => {
    // TODO: Implement API call
    toast({
      title: "گروه جدید ایجاد شد",
      description: "گروه با موفقیت ایجاد شد و کد دعوت تولید شد.",
    })
    setShowCreateDialog(false)
  }

  const handleCopyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code)
    toast({
      title: "کد دعوت کپی شد",
      description: "کد دعوت در کلیپ‌بورد کپی شد.",
    })
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
          <h1 className="text-3xl font-bold">مدیریت گروه‌ها</h1>
          <p className="text-muted-foreground">ایجاد و مدیریت گروه‌های مختلف</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              ایجاد گروه جدید
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>ایجاد گروه جدید</DialogTitle>
              <DialogDescription>
                اطلاعات گروه جدید را وارد کنید
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">نام گروه</Label>
                <Input id="name" placeholder="نام گروه" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea id="description" placeholder="توضیحات گروه" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="type">نوع گروه</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="family">خانواده</SelectItem>
                      <SelectItem value="friends">دوستان</SelectItem>
                      <SelectItem value="work">کاری</SelectItem>
                      <SelectItem value="other">سایر</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="privacy">حریم خصوصی</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کنید" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">عمومی</SelectItem>
                      <SelectItem value="private">خصوصی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                انصراف
              </Button>
              <Button onClick={handleCreateGroup}>
                ایجاد گروه
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
            placeholder="جستجو در گروه‌ها..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="فیلتر نوع" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">همه</SelectItem>
            <SelectItem value="family">خانواده</SelectItem>
            <SelectItem value="friends">دوستان</SelectItem>
            <SelectItem value="work">کاری</SelectItem>
            <SelectItem value="other">سایر</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Groups Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {group.name}
                    {group.isAdmin && (
                      <Badge variant="secondary" className="text-xs">
                        مدیر
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription className="mt-2">{group.description}</CardDescription>
                </div>
                <div className="flex items-center gap-1">
                  {group.privacy === 'private' ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {group.memberCount}/{group.maxMembers} عضو
                  </div>
                  <Badge variant="outline">
                    {group.type === 'family' ? 'خانواده' : 
                     group.type === 'friends' ? 'دوستان' : 
                     group.type === 'work' ? 'کاری' : 'سایر'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>کد دعوت:</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                      {group.inviteCode}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyInviteCode(group.inviteCode)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <div className="text-sm text-muted-foreground">
                    ایجاد شده توسط: {group.creator}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Settings className="h-3 w-3" />
                    </Button>
                    <Button size="sm">
                      مشاهده
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredGroups.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">گروهی یافت نشد</h3>
          <p className="text-muted-foreground">هیچ گروهی با فیلترهای انتخاب شده یافت نشد.</p>
        </div>
      )}
    </div>
  )
}
