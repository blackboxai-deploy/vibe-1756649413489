'use client'

import { useState, useEffect } from 'react'
import { Layout } from '@/components/layout/Layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'

// النظام المحاسبي المتكامل - الصفحة الرئيسية ولوحة التحكم
export default function HomePage() {
  const [stats, setStats] = useState({
    totalSales: 0,
    totalPurchases: 0,
    totalCustomers: 0,
    totalSuppliers: 0,
    totalProducts: 0,
    lowStockItems: 0,
    overdueInvoices: 0,
    cashFlow: 0,
  })

  const [loading, setLoading] = useState(true)

  // محاكاة تحميل البيانات
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(false)
        // TODO: جلب البيانات الفعلية من API
        setStats({
          totalSales: 125000,
          totalPurchases: 85000,
          totalCustomers: 45,
          totalSuppliers: 23,
          totalProducts: 156,
          lowStockItems: 8,
          overdueInvoices: 3,
          cashFlow: 40000,
        })
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const quickActions = [
    {
      title: 'فاتورة مبيعات جديدة',
      description: 'إنشاء فاتورة مبيعات جديدة',
      action: () => console.log('New sales invoice'),
      color: 'bg-blue-500',
    },
    {
      title: 'قيد يومي',
      description: 'إدخال قيد محاسبي جديد',
      action: () => console.log('New journal entry'),
      color: 'bg-green-500',
    },
    {
      title: 'إضافة عميل',
      description: 'تسجيل عميل جديد',
      action: () => console.log('New customer'),
      color: 'bg-purple-500',
    },
    {
      title: 'إضافة منتج',
      description: 'إضافة منتج جديد للمخزون',
      action: () => console.log('New product'),
      color: 'bg-orange-500',
    },
  ]

  const recentTransactions = [
    {
      id: 1,
      type: 'مبيعات',
      number: 'S-001',
      customer: 'أحمد محمد',
      amount: 1500,
      date: '2024-01-15',
      status: 'مكتملة',
    },
    {
      id: 2,
      type: 'مشتريات',
      number: 'P-001',
      supplier: 'شركة التوريدات',
      amount: 2300,
      date: '2024-01-14',
      status: 'معلقة',
    },
    {
      id: 3,
      type: 'قيد',
      number: 'J-001',
      description: 'قيد افتتاحي',
      amount: 50000,
      date: '2024-01-01',
      status: 'مرحل',
    },
  ]

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-slate-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="p-8 space-y-8" dir="rtl">
        {/* العنوان الرئيسي */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            لوحة التحكم الرئيسية
          </h1>
          <p className="text-slate-600">
            نظرة عامة على حالة الأعمال والعمليات المالية
          </p>
        </div>
        
        {/* الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stats.totalSales.toLocaleString()} ريال</div>
              <div className="flex items-center text-blue-100">
                <span className="text-xs">+12% من الشهر الماضي</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">إجمالي المشتريات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stats.totalPurchases.toLocaleString()} ريال</div>
              <div className="flex items-center text-green-100">
                <span className="text-xs">+8% من الشهر الماضي</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stats.totalCustomers}</div>
              <div className="flex items-center text-purple-100">
                <span className="text-xs">عميل نشط</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{stats.cashFlow.toLocaleString()} ريال</div>
              <div className="flex items-center text-orange-100">
                <span className="text-xs">هذا الشهر</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الإجراءات السريعة */}
        <Card>
          <CardHeader>
            <CardTitle>الإجراءات السريعة</CardTitle>
            <CardDescription>الوظائف الأكثر استخداماً في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 cursor-pointer transition-all hover:shadow-md"
                  onClick={() => action.action()}
                >
                  <div className={`w-10 h-10 rounded-lg ${action.color} mb-3 flex items-center justify-center`}>
                    <div className="w-4 h-4 bg-white rounded"></div>
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-1">{action.title}</h3>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* التبويبات الرئيسية */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="transactions">المعاملات الأخيرة</TabsTrigger>
            <TabsTrigger value="inventory">المخزون</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          {/* نظرة عامة */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* حالة المخزون */}
              <Card>
                <CardHeader>
                  <CardTitle>حالة المخزون</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">إجمالي المنتجات</span>
                    <Badge variant="secondary">{stats.totalProducts}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">منتجات منخفضة المخزون</span>
                    <Badge variant="destructive">{stats.lowStockItems}</Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>حالة المخزون العامة</span>
                      <span>95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* المستحقات */}
              <Card>
                <CardHeader>
                  <CardTitle>المستحقات والمدفوعات</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">الفواتير المتأخرة</span>
                    <Badge variant="destructive">{stats.overdueInvoices}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">إجمالي المستحقات</span>
                    <span className="font-semibold">15,750 ريال</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">إجمالي المدفوعات المعلقة</span>
                    <span className="font-semibold">8,250 ريال</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* المعاملات الأخيرة */}
          <TabsContent value="transactions">
            <Card>
              <CardHeader>
                <CardTitle>آخر المعاملات</CardTitle>
                <CardDescription>آخر العمليات المالية في النظام</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border border-slate-200">
                      <div className="flex items-center space-x-4 space-x-reverse">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                          <div className="w-4 h-4 bg-slate-400 rounded"></div>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{transaction.number}</p>
                          <p className="text-sm text-slate-600">
                            {transaction.type} - {transaction.customer || transaction.supplier || transaction.description}
                          </p>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="font-semibold">{transaction.amount.toLocaleString()} ريال</p>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <Badge 
                            variant={transaction.status === 'مكتملة' ? 'default' : transaction.status === 'مرحل' ? 'secondary' : 'outline'}
                          >
                            {transaction.status}
                          </Badge>
                          <span className="text-xs text-slate-500">{transaction.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* المخزون */}
          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>تحليل المخزون</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-slate-500">
                  <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-lg flex items-center justify-center">
                    <div className="w-8 h-8 bg-slate-300 rounded"></div>
                  </div>
                  <p>سيتم إضافة تحليل المخزون هنا</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* التقارير */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>التقارير المالية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 bg-blue-500 rounded mb-2"></div>
                    <span>الميزانية العمومية</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 bg-green-500 rounded mb-2"></div>
                    <span>قائمة الدخل</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 bg-purple-500 rounded mb-2"></div>
                    <span>قائمة التدفقات النقدية</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}