import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { Bell, Check, X, Trash2, Settings, Mail, MessageSquare, Smartphone } from 'lucide-react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'debt' | 'group' | 'payment' | 'system'
  status: 'unread' | 'read'
  priority: 'low' | 'medium' | 'high'
  createdAt: string
  actionRequired: boolean
  actionType?: 'accept' | 'reject' | 'view'
}

interface NotificationSettings {
  channels: {
    email: boolean
    sms: boolean
    push: boolean
    inApp: boolean
  }
  types: {
    debt: boolean
    group: boolean
    payment: boolean
    system: boolean
  }
  frequency: 'immediate' | 'hourly' | 'daily'
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [settings, setSettings] = useState<NotificationSettings>({
    channels: {
      email: true,
      sms: false,
      push: true,
      inApp: true
    },
    types: {
      debt: true,
      group: true,
      payment: true,
      system: false
    },
    frequency: 'immediate'
  })
  const { toast } = useToast()

  // Mock data
  const mockNotifications: Notification[] = [
    {
      id: '1',
      title: 'دعوت به گروه جدید',
      message: 'علی احمدی شما را به گروه "خانواده احمدی" دعوت کرده است',
      type: 'group',
      status: 'unread',
      priority: 'medium',
      createdAt: '2024-01-20T10:30:00Z',
      actionRequired: true,
      actionType: 'accept'
    },
    {
      id: '2',
      title: 'بدهی جدید ایجاد شد',
      message: 'بدهی "شام گروهی" با مبلغ 250,000 تومان ایجاد شد',
      type: 'debt',
      status: 'unread',
      priority: 'high',
      createdAt: '2024-01-20T09:15:00Z',
      actionRequired: false
    },
    {
      id: '3',
      title: 'پرداخت تایید شد',
      message: 'پرداخت شما برای بدهی "سفر کوهنوردی" تایید شد',
      type: 'payment',
      status: 'read',
      priority: 'low',
      createdAt: '2024-01-19T16:45:00Z',
      actionRequired: false
    },
    {
      id: '4',
      title: 'به‌روزرسانی سیستم',
      message: 'نسخه جدید نرم‌افزار در دسترس است',
      type: 'system',
      status: 'unread',
      priority: 'medium',
      createdAt: '2024-01-19T14:20:00Z',
      actionRequired: false
    },
    {
      id: '5',
      title: 'یادآوری پرداخت',
      message: 'پرداخت بدهی "خرید هدیه تولد" تا 3 روز دیگر سررسید می‌شود',
      type: 'debt',
      status: 'read',
      priority: 'high',
      createdAt: '2024-01-19T12:00:00Z',
      actionRequired: false
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotifications(mockNotifications)
      setLoading(false)
    }, 1000)
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true
    if (activeTab === 'unread') return notification.status === 'unread'
    if (activeTab === 'debt') return notification.type === 'debt'
    if (activeTab === 'group') return notification.type === 'group'
    if (activeTab === 'payment') return notification.type === 'payment'
    if (activeTab === 'system') return notification.type === 'system'
    return true
  })

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, status: 'read' as const }
          : notif
      )
    )
    toast({
      title: "علامت‌گذاری شد",
      description: "اعلان به عنوان خوانده شده علامت‌گذاری شد.",
    })
  }

  const handleDeleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
    toast({
      title: "اعلان حذف شد",
      description: "اعلان با موفقیت حذف شد.",
    })
  }

  const handleAcceptInvitation = (notificationId: string) => {
    // TODO: Implement API call
    toast({
      title: "دعوت پذیرفته شد",
      description: "شما با موفقیت به گروه پیوستید.",
    })
    handleDeleteNotification(notificationId)
  }

  const handleRejectInvitation = (notificationId: string) => {
    // TODO: Implement API call
    toast({
      title: "دعوت رد شد",
      description: "دعوت گروه رد شد.",
    })
    handleDeleteNotification(notificationId)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive'
      case 'medium': return 'default'
      case 'low': return 'secondary'
      default: return 'secondary'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'debt': return '💰'
      case 'group': return '👥'
      case 'payment': return '💳'
      case 'system': return '⚙️'
      default: return '🔔'
    }
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
          <h1 className="text-3xl font-bold">اعلان‌ها</h1>
          <p className="text-muted-foreground">مدیریت اعلان‌ها و تنظیمات</p>
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          تنظیمات
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Settings Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                تنظیمات اعلان‌ها
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Channels */}
              <div>
                <h4 className="font-medium mb-3">کانال‌های اعلان</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <Label htmlFor="email">ایمیل</Label>
                    </div>
                    <Switch
                      id="email"
                      checked={settings.channels.email}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          channels: { ...prev.channels, email: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <Label htmlFor="sms">پیامک</Label>
                    </div>
                    <Switch
                      id="sms"
                      checked={settings.channels.sms}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          channels: { ...prev.channels, sms: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      <Label htmlFor="push">اعلان مرورگر</Label>
                    </div>
                    <Switch
                      id="push"
                      checked={settings.channels.push}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          channels: { ...prev.channels, push: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      <Label htmlFor="inApp">درون برنامه</Label>
                    </div>
                    <Switch
                      id="inApp"
                      checked={settings.channels.inApp}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          channels: { ...prev.channels, inApp: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Notification Types */}
              <div>
                <h4 className="font-medium mb-3">انواع اعلان</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="debt">💰 بدهی‌ها</Label>
                    <Switch
                      id="debt"
                      checked={settings.types.debt}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          types: { ...prev.types, debt: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="group">👥 گروه‌ها</Label>
                    <Switch
                      id="group"
                      checked={settings.types.group}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          types: { ...prev.types, group: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="payment">💳 پرداخت‌ها</Label>
                    <Switch
                      id="payment"
                      checked={settings.types.payment}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          types: { ...prev.types, payment: checked }
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="system">⚙️ سیستم</Label>
                    <Switch
                      id="system"
                      checked={settings.types.system}
                      onCheckedChange={(checked) => 
                        setSettings(prev => ({
                          ...prev,
                          types: { ...prev.types, system: checked }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notifications List */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="all">همه</TabsTrigger>
                  <TabsTrigger value="unread">خوانده نشده</TabsTrigger>
                  <TabsTrigger value="debt">بدهی‌ها</TabsTrigger>
                  <TabsTrigger value="group">گروه‌ها</TabsTrigger>
                  <TabsTrigger value="payment">پرداخت‌ها</TabsTrigger>
                  <TabsTrigger value="system">سیستم</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 rounded-lg border transition-colors ${
                      notification.status === 'unread' 
                        ? 'bg-muted/50 border-primary/20' 
                        : 'bg-background'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-2xl">
                          {getTypeIcon(notification.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{notification.title}</h4>
                            <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                              {notification.priority === 'high' ? 'مهم' : 
                               notification.priority === 'medium' ? 'متوسط' : 'کم'}
                            </Badge>
                            {notification.status === 'unread' && (
                              <Badge variant="default" className="text-xs">
                                جدید
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span>
                              {new Date(notification.createdAt).toLocaleDateString('fa-IR')}
                            </span>
                            <span>
                              {new Date(notification.createdAt).toLocaleTimeString('fa-IR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        {notification.actionRequired && notification.actionType === 'accept' && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleAcceptInvitation(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectInvitation(notification.id)}
                              className="h-8 w-8 p-0"
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        
                        {notification.status === 'unread' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-8 w-8 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteNotification(notification.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredNotifications.length === 0 && (
                <div className="text-center py-12">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">اعلانی یافت نشد</h3>
                  <p className="text-muted-foreground">
                    {activeTab === 'all' 
                      ? 'هیچ اعلانی وجود ندارد.' 
                      : `هیچ اعلان ${activeTab === 'unread' ? 'خوانده نشده‌ای' : `${activeTab}ی`} وجود ندارد.`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
