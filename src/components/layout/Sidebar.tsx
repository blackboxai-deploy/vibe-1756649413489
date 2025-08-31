'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

// الشريط الجانبي للتنقل
export function Sidebar() {
  const pathname = usePathname()
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({})

  const toggleSection = (section: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const menuItems = [
    {
      id: 'dashboard',
      title: 'لوحة التحكم',
      href: '/',
      icon: '🏠',
    },
    {
      id: 'accounting',
      title: 'المحاسبة المالية',
      icon: '💰',
      children: [
        {
          title: 'شجرة الحسابات',
          href: '/accounts',
          icon: '🌳',
        },
        {
          title: 'القيود اليومية',
          href: '/transactions',
          icon: '📝',
        },
        {
          title: 'سندات القبض',
          href: '/receipts',
          icon: '💳',
        },
        {
          title: 'سندات الصرف',
          href: '/payments',
          icon: '💸',
        },
        {
          title: 'الميزان العام',
          href: '/trial-balance',
          icon: '⚖️',
        },
      ],
    },
    {
      id: 'sales',
      title: 'المبيعات',
      icon: '🛒',
      children: [
        {
          title: 'فواتير المبيعات',
          href: '/sales/invoices',
          icon: '🧾',
        },
        {
          title: 'عروض الأسعار',
          href: '/sales/quotes',
          icon: '💼',
        },
        {
          title: 'أوامر البيع',
          href: '/sales/orders',
          icon: '📋',
        },
        {
          title: 'نقاط البيع',
          href: '/sales/pos',
          icon: '🏪',
          badge: 'جديد',
        },
      ],
    },
    {
      id: 'purchases',
      title: 'المشتريات',
      icon: '📦',
      children: [
        {
          title: 'فواتير المشتريات',
          href: '/purchases/invoices',
          icon: '📄',
        },
        {
          title: 'طلبات الشراء',
          href: '/purchases/orders',
          icon: '🛍️',
        },
        {
          title: 'استلام البضائع',
          href: '/purchases/receipts',
          icon: '📥',
        },
      ],
    },
    {
      id: 'inventory',
      title: 'المخزون',
      icon: '📊',
      children: [
        {
          title: 'إدارة المنتجات',
          href: '/products',
          icon: '🎁',
        },
        {
          title: 'إدارة المخازن',
          href: '/warehouses',
          icon: '🏭',
        },
        {
          title: 'حركات المخزون',
          href: '/inventory/movements',
          icon: '🔄',
        },
        {
          title: 'عمليات الجرد',
          href: '/inventory/counting',
          icon: '📊',
        },
        {
          title: 'المناقلة بين المخازن',
          href: '/inventory/transfers',
          icon: '🚚',
        },
      ],
    },
    {
      id: 'contacts',
      title: 'الجهات',
      icon: '👥',
      children: [
        {
          title: 'العملاء',
          href: '/customers',
          icon: '🙋‍♂️',
        },
        {
          title: 'الموردون',
          href: '/suppliers',
          icon: '🏢',
        },
        {
          title: 'المندوبون',
          href: '/sales-reps',
          icon: '👨‍💼',
        },
      ],
    },
    {
      id: 'manufacturing',
      title: 'التصنيع',
      icon: '🏭',
      children: [
        {
          title: 'أوامر الإنتاج',
          href: '/manufacturing/orders',
          icon: '⚙️',
        },
        {
          title: 'خطوط الإنتاج',
          href: '/manufacturing/lines',
          icon: '🔧',
        },
        {
          title: 'قوائم المواد',
          href: '/manufacturing/bom',
          icon: '📋',
        },
      ],
    },
    {
      id: 'reports',
      title: 'التقارير',
      icon: '📈',
      children: [
        {
          title: 'التقارير المالية',
          href: '/reports/financial',
          icon: '💹',
        },
        {
          title: 'تقارير المبيعات',
          href: '/reports/sales',
          icon: '📊',
        },
        {
          title: 'تقارير المشتريات',
          href: '/reports/purchases',
          icon: '📉',
        },
        {
          title: 'تقارير المخزون',
          href: '/reports/inventory',
          icon: '📦',
        },
        {
          title: 'كشوف الحسابات',
          href: '/reports/statements',
          icon: '📋',
        },
      ],
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      icon: '⚙️',
      children: [
        {
          title: 'إعدادات الشركة',
          href: '/settings/company',
          icon: '🏢',
        },
        {
          title: 'إدارة المستخدمين',
          href: '/settings/users',
          icon: '👨‍👩‍👧‍👦',
        },
        {
          title: 'الصلاحيات',
          href: '/settings/permissions',
          icon: '🔐',
        },
        {
          title: 'الفروع',
          href: '/settings/branches',
          icon: '🏪',
        },
        {
          title: 'السنوات المالية',
          href: '/settings/fiscal-years',
          icon: '📅',
        },
        {
          title: 'النسخ الاحتياطي',
          href: '/settings/backup',
          icon: '💾',
        },
      ],
    },
  ]

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200" dir="rtl">
      {/* الشعار */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">ن م</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900">النظام المحاسبي</h1>
            <p className="text-xs text-slate-500">نسخة 1.0</p>
          </div>
        </div>
      </div>

      {/* القائمة الرئيسية */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <Collapsible
                open={!collapsedSections[item.id]}
                onOpenChange={() => toggleSection(item.id)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between h-10 px-3 font-medium text-slate-700 hover:bg-slate-100"
                  >
                    <div className="flex items-center space-x-3 space-x-reverse">
                      <span className="text-lg">{item.icon}</span>
                      <span>{item.title}</span>
                    </div>
                    <span
                      className={cn(
                        "transition-transform duration-200",
                        !collapsedSections[item.id] && "transform rotate-90"
                      )}
                    >
                      ◀
                    </span>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 mt-1">
                  {item.children.map((child) => (
                    <Link key={child.href} href={child.href}>
                      <Button
                        variant="ghost"
                        className={cn(
                          "w-full justify-start h-9 pr-10 text-sm text-slate-600 hover:bg-slate-100",
                          pathname === child.href && "bg-blue-50 text-blue-700 hover:bg-blue-50"
                        )}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-3 space-x-reverse">
                            <span className="text-base">{child.icon}</span>
                            <span>{child.title}</span>
                          </div>
                          {child.badge && (
                            <Badge variant="secondary" className="text-xs">
                              {child.badge}
                            </Badge>
                          )}
                        </div>
                      </Button>
                    </Link>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            ) : (
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full justify-start h-10 px-3 font-medium text-slate-700 hover:bg-slate-100",
                    pathname === item.href && "bg-blue-50 text-blue-700 hover:bg-blue-50"
                  )}
                >
                  <div className="flex items-center space-x-3 space-x-reverse">
                    <span className="text-lg">{item.icon}</span>
                    <span>{item.title}</span>
                  </div>
                </Button>
              </Link>
            )}
          </div>
        ))}
      </nav>

      {/* معلومات المستخدم */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-600 text-sm font-medium">أ</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-900">مدير النظام</p>
            <p className="text-xs text-slate-500">admin@company.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}