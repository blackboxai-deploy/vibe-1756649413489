'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// الرأس العلوي للتطبيق
export function Header() {
  const [notifications] = useState([
    {
      id: 1,
      title: 'فاتورة مستحقة',
      message: 'فاتورة رقم #001 مستحقة الدفع',
      type: 'warning',
      time: 'منذ ساعتين',
    },
    {
      id: 2,
      title: 'مخزون منخفض',
      message: 'منتج "لابتوب ديل" وصل للحد الأدنى',
      type: 'error',
      time: 'منذ 3 ساعات',
    },
    {
      id: 3,
      title: 'مبيعات جديدة',
      message: 'تم إنشاء فاتورة مبيعات جديدة',
      type: 'success',
      time: 'منذ يوم',
    },
  ])

  const currentBranch = {
    name: 'الفرع الرئيسي',
    location: 'الرياض',
  }

  const currentFiscalYear = {
    name: 'السنة المالية 2024',
    period: '2024/01/01 - 2024/12/31',
  }

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4" dir="rtl">
      <div className="flex items-center justify-between">
        
        {/* معلومات الفرع والسنة المالية */}
        <div className="flex items-center space-x-6 space-x-reverse">
          <div className="text-sm">
            <span className="text-slate-500">الفرع:</span>
            <span className="font-medium text-slate-900 mr-1">{currentBranch.name}</span>
            <span className="text-slate-400">({currentBranch.location})</span>
          </div>
          <div className="text-sm">
            <span className="text-slate-500">السنة المالية:</span>
            <span className="font-medium text-slate-900 mr-1">{currentFiscalYear.name}</span>
          </div>
        </div>

        {/* الأدوات والتنبيهات */}
        <div className="flex items-center space-x-4 space-x-reverse">
          
          {/* البحث السريع */}
          <div className="relative">
            <input
              type="text"
              placeholder="بحث سريع..."
              className="w-64 px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-2.5 text-slate-400">
              🔍
            </div>
          </div>

          {/* التنبيهات */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <span className="text-xl">🔔</span>
                {notifications.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-80" dir="rtl">
              <DropdownMenuLabel>التنبيهات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem key={notification.id} className="p-4">
                  <div className="flex items-start space-x-3 space-x-reverse w-full">
                    <div className={`w-2 h-2 rounded-full mt-2 ${
                      notification.type === 'error' ? 'bg-red-500' :
                      notification.type === 'warning' ? 'bg-yellow-500' :
                      'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 mb-1">
                        {notification.title}
                      </p>
                      <p className="text-sm text-slate-600 mb-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-400">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700">
                عرض جميع التنبيهات
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* الإعدادات السريعة */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-10 w-10 rounded-full">
                <span className="text-xl">⚙️</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" dir="rtl">
              <DropdownMenuLabel>الإعدادات السريعة</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                تغيير الفرع
              </DropdownMenuItem>
              <DropdownMenuItem>
                تغيير السنة المالية
              </DropdownMenuItem>
              <DropdownMenuItem>
                إعدادات العرض
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                النسخ الاحتياطي
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* قائمة المستخدم */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarFallback>أ م</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" dir="rtl">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">مدير النظام</p>
                  <p className="text-xs text-slate-500">admin@company.com</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                الملف الشخصي
              </DropdownMenuItem>
              <DropdownMenuItem>
                تغيير كلمة المرور
              </DropdownMenuItem>
              <DropdownMenuItem>
                الإعدادات الشخصية
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                المساعدة والدعم
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">
                تسجيل الخروج
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* شريط المعلومات السريعة */}
      <div className="mt-4 flex items-center justify-between text-sm">
        <div className="flex items-center space-x-6 space-x-reverse text-slate-600">
          <div className="flex items-center space-x-2 space-x-reverse">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span>متصل</span>
          </div>
          <div>آخر نسخ احتياطي: اليوم 03:00 ص</div>
          <div>آخر تحديث: منذ 5 دقائق</div>
        </div>
        
        <div className="flex items-center space-x-4 space-x-reverse">
          <Badge variant="outline" className="text-green-600 border-green-200">
            النظام يعمل بشكل طبيعي
          </Badge>
        </div>
      </div>
    </header>
  )
}