'use client'

import { ReactNode } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

interface LayoutProps {
  children: ReactNode
}

// التخطيط العام للتطبيق
export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-slate-50">
      {/* الشريط الجانبي */}
      <aside className="w-72 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* الرأس العلوي */}
        <Header />

        {/* محتوى الصفحة */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* تذييل الصفحة */}
        <footer className="bg-white border-t border-slate-200 px-6 py-4" dir="rtl">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div>
              © 2024 النظام المحاسبي المتكامل. جميع الحقوق محفوظة.
            </div>
            <div className="flex items-center space-x-6 space-x-reverse">
              <span>الإصدار 1.0.0</span>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 transition-colors">
                الدعم الفني
              </a>
              <span>•</span>
              <a href="#" className="hover:text-blue-600 transition-colors">
                دليل المستخدم
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}