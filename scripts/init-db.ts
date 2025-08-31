// تهيئة قاعدة البيانات ببيانات افتراضية
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔄 تهيئة قاعدة البيانات...');

  try {
    // إنشاء شركة افتراضية
    const company = await prisma.company.upsert({
      where: { id: 'default-company' },
      update: {},
      create: {
        id: 'default-company',
        name: 'شركة المثال للتجارة',
        arabicName: 'شركة المثال للتجارة المحدودة',
        taxNumber: '300123456789003',
        commercial: '1010123456',
        address: 'الرياض، المملكة العربية السعودية',
        phone: '+966112345678',
        email: 'info@example.com',
        isActive: true,
      },
    });

    console.log('✅ تم إنشاء الشركة الافتراضية');

    // إنشاء فرع افتراضي
    const branch = await prisma.branch.upsert({
      where: { id: 'default-branch' },
      update: {},
      create: {
        id: 'default-branch',
        companyId: company.id,
        name: 'الفرع الرئيسي',
        arabicName: 'الفرع الرئيسي',
        address: 'الرياض، حي الملز',
        phone: '+966112345678',
        manager: 'مدير الفرع',
        isActive: true,
      },
    });

    console.log('✅ تم إنشاء الفرع الافتراضي');

    // إنشاء سنة مالية افتراضية
    const currentYear = new Date().getFullYear();
    const fiscalYear = await prisma.fiscalYear.upsert({
      where: { id: 'default-fiscal-year' },
      update: {},
      create: {
        id: 'default-fiscal-year',
        companyId: company.id,
        name: `السنة المالية ${currentYear}`,
        startDate: new Date(`${currentYear}-01-01`),
        endDate: new Date(`${currentYear}-12-31`),
        isCurrent: true,
        isClosed: false,
      },
    });

    console.log('✅ تم إنشاء السنة المالية الافتراضية');

    // إنشاء مستخدم إداري افتراضي
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@example.com',
        password: hashedPassword,
        fullName: 'مدير النظام',
        role: 'ADMIN',
        branchId: branch.id,
        isActive: true,
      },
    });

    console.log('✅ تم إنشاء المستخدم الإداري');

    // إنشاء شجرة الحسابات الأساسية
    await createBasicChartOfAccounts(fiscalYear.id);
    console.log('✅ تم إنشاء شجرة الحسابات الأساسية');

    // إنشاء تصنيفات المنتجات الأساسية
    await createBasicProductCategories();
    console.log('✅ تم إنشاء تصنيفات المنتجات الأساسية');

    // إنشاء مخزن افتراضي
    await prisma.warehouse.upsert({
      where: { id: 'default-warehouse' },
      update: {},
      create: {
        id: 'default-warehouse',
        branchId: branch.id,
        code: 'MAIN',
        name: 'المخزن الرئيسي',
        address: 'الرياض، حي الملز',
        manager: 'مدير المخزن',
        isActive: true,
      },
    });

    console.log('✅ تم إنشاء المخزن الافتراضي');

    // إنشاء بيانات تجريبية
    await createSampleData(branch.id, fiscalYear.id);
    console.log('✅ تم إنشاء البيانات التجريبية');

    console.log('🎉 تمت تهيئة قاعدة البيانات بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في تهيئة قاعدة البيانات:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// إنشاء شجرة الحسابات الأساسية
async function createBasicChartOfAccounts(fiscalYearId: string) {
  const accounts = [
    // الأصول
    {
      id: 'assets-main',
      code: '1',
      name: 'Assets',
      arabicName: 'الأصول',
      accountType: 'ASSETS',
      isParent: true,
      level: 1,
    },
    {
      id: 'current-assets',
      code: '11',
      name: 'Current Assets',
      arabicName: 'الأصول المتداولة',
      accountType: 'ASSETS',
      parentId: 'assets-main',
      isParent: true,
      level: 2,
    },
    {
      id: 'cash',
      code: '1101',
      name: 'Cash',
      arabicName: 'النقدية',
      accountType: 'ASSETS',
      parentId: 'current-assets',
      level: 3,
      openingBalance: 50000,
    },
    {
      id: 'bank',
      code: '1102',
      name: 'Bank',
      arabicName: 'البنك',
      accountType: 'ASSETS',
      parentId: 'current-assets',
      level: 3,
      openingBalance: 100000,
    },
    {
      id: 'accounts-receivable',
      code: '1103',
      name: 'Accounts Receivable',
      arabicName: 'العملاء',
      accountType: 'ASSETS',
      parentId: 'current-assets',
      level: 3,
      openingBalance: 25000,
    },
    {
      id: 'inventory',
      code: '1104',
      name: 'Inventory',
      arabicName: 'المخزون',
      accountType: 'ASSETS',
      parentId: 'current-assets',
      level: 3,
      openingBalance: 75000,
    },

    // الخصوم
    {
      id: 'liabilities-main',
      code: '2',
      name: 'Liabilities',
      arabicName: 'الخصوم',
      accountType: 'LIABILITIES',
      isParent: true,
      level: 1,
    },
    {
      id: 'current-liabilities',
      code: '21',
      name: 'Current Liabilities',
      arabicName: 'الخصوم المتداولة',
      accountType: 'LIABILITIES',
      parentId: 'liabilities-main',
      isParent: true,
      level: 2,
    },
    {
      id: 'accounts-payable',
      code: '2101',
      name: 'Accounts Payable',
      arabicName: 'الموردون',
      accountType: 'LIABILITIES',
      parentId: 'current-liabilities',
      level: 3,
      openingBalance: 15000,
    },
    {
      id: 'accrued-expenses',
      code: '2102',
      name: 'Accrued Expenses',
      arabicName: 'المصروفات المستحقة',
      accountType: 'LIABILITIES',
      parentId: 'current-liabilities',
      level: 3,
      openingBalance: 5000,
    },

    // حقوق الملكية
    {
      id: 'equity-main',
      code: '3',
      name: 'Equity',
      arabicName: 'حقوق الملكية',
      accountType: 'EQUITY',
      isParent: true,
      level: 1,
    },
    {
      id: 'capital',
      code: '3101',
      name: 'Capital',
      arabicName: 'رأس المال',
      accountType: 'EQUITY',
      parentId: 'equity-main',
      level: 2,
      openingBalance: 200000,
    },
    {
      id: 'retained-earnings',
      code: '3201',
      name: 'Retained Earnings',
      arabicName: 'الأرباح المحتجزة',
      accountType: 'EQUITY',
      parentId: 'equity-main',
      level: 2,
      openingBalance: 30000,
    },

    // الإيرادات
    {
      id: 'revenue-main',
      code: '4',
      name: 'Revenue',
      arabicName: 'الإيرادات',
      accountType: 'REVENUE',
      isParent: true,
      level: 1,
    },
    {
      id: 'sales-revenue',
      code: '4101',
      name: 'Sales Revenue',
      arabicName: 'إيرادات المبيعات',
      accountType: 'REVENUE',
      parentId: 'revenue-main',
      level: 2,
      openingBalance: 0,
    },
    {
      id: 'service-revenue',
      code: '4201',
      name: 'Service Revenue',
      arabicName: 'إيرادات الخدمات',
      accountType: 'REVENUE',
      parentId: 'revenue-main',
      level: 2,
      openingBalance: 0,
    },

    // المصروفات
    {
      id: 'expenses-main',
      code: '5',
      name: 'Expenses',
      arabicName: 'المصروفات',
      accountType: 'EXPENSES',
      isParent: true,
      level: 1,
    },
    {
      id: 'cost-of-goods-sold',
      code: '5101',
      name: 'Cost of Goods Sold',
      arabicName: 'تكلفة البضاعة المباعة',
      accountType: 'EXPENSES',
      parentId: 'expenses-main',
      level: 2,
      openingBalance: 0,
    },
    {
      id: 'operating-expenses',
      code: '5201',
      name: 'Operating Expenses',
      arabicName: 'المصروفات التشغيلية',
      accountType: 'EXPENSES',
      parentId: 'expenses-main',
      level: 2,
      openingBalance: 0,
    },
    {
      id: 'salaries-expense',
      code: '5301',
      name: 'Salaries Expense',
      arabicName: 'مصروفات الرواتب',
      accountType: 'EXPENSES',
      parentId: 'expenses-main',
      level: 2,
      openingBalance: 0,
    },
  ];

  for (const account of accounts) {
    await prisma.account.upsert({
      where: { id: account.id },
      update: {},
      create: {
        ...account,
        fiscalYearId,
        currentBalance: account.openingBalance || 0,
      },
    });
  }
}

// إنشاء تصنيفات المنتجات الأساسية
async function createBasicProductCategories() {
  const categories = [
    {
      id: 'electronics',
      name: 'Electronics',
      arabicName: 'الإلكترونيات',
    },
    {
      id: 'computers',
      name: 'Computers',
      arabicName: 'أجهزة الكمبيوتر',
      parentId: 'electronics',
    },
    {
      id: 'mobile-phones',
      name: 'Mobile Phones',
      arabicName: 'الهواتف المحمولة',
      parentId: 'electronics',
    },
    {
      id: 'clothing',
      name: 'Clothing',
      arabicName: 'الملابس',
    },
    {
      id: 'mens-clothing',
      name: "Men's Clothing",
      arabicName: 'ملابس رجالية',
      parentId: 'clothing',
    },
    {
      id: 'womens-clothing',
      name: "Women's Clothing",
      arabicName: 'ملابس نسائية',
      parentId: 'clothing',
    },
    {
      id: 'office-supplies',
      name: 'Office Supplies',
      arabicName: 'المستلزمات المكتبية',
    },
  ];

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
  }
}

// إنشاء بيانات تجريبية
async function createSampleData(branchId: string, fiscalYearId: string) {
  // إنشاء عملاء تجريبيين
  await prisma.customer.createMany({
    data: [
      {
        branchId,
        code: 'CUST001',
        name: 'Ahmed Mohammed',
        arabicName: 'أحمد محمد',
        type: 'INDIVIDUAL',
        phone: '+966501234567',
        email: 'ahmed@example.com',
        address: 'الرياض، حي النخيل',
        creditLimit: 10000,
        paymentTerms: 30,
        isActive: true,
      },
      {
        branchId,
        code: 'CUST002',
        name: 'Sarah Ali',
        arabicName: 'سارة علي',
        type: 'INDIVIDUAL',
        phone: '+966507654321',
        email: 'sarah@example.com',
        address: 'جدة، حي الحمراء',
        creditLimit: 5000,
        paymentTerms: 15,
        isActive: true,
      },
      {
        branchId,
        code: 'CUST003',
        name: 'Tech Solutions Company',
        arabicName: 'شركة الحلول التقنية',
        type: 'COMPANY',
        taxNumber: '300456789123001',
        commercial: '1010456789',
        phone: '+966114567890',
        email: 'info@techsolutions.com',
        address: 'الرياض، حي العليا',
        creditLimit: 50000,
        paymentTerms: 45,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // إنشاء موردين تجريبيين
  await prisma.supplier.createMany({
    data: [
      {
        branchId,
        code: 'SUPP001',
        name: 'Electronics Wholesale',
        arabicName: 'تجارة الإلكترونيات بالجملة',
        type: 'LOCAL',
        taxNumber: '300789123456001',
        commercial: '1010789123',
        phone: '+966112345678',
        email: 'info@electronics-wholesale.com',
        address: 'الدمام، الحي التجاري',
        creditLimit: 100000,
        paymentTerms: 30,
        isActive: true,
      },
      {
        branchId,
        code: 'SUPP002',
        name: 'Office Supplies Co.',
        arabicName: 'شركة المستلزمات المكتبية',
        type: 'LOCAL',
        phone: '+966113456789',
        email: 'orders@officesupplies.com',
        address: 'الرياض، حي الصناعية',
        creditLimit: 25000,
        paymentTerms: 15,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  // إنشاء منتجات تجريبية
  await prisma.product.createMany({
    data: [
      {
        categoryId: 'computers',
        code: 'PROD001',
        barcode: '1234567890123',
        name: 'Dell Laptop Inspiron 15',
        arabicName: 'لابتوب ديل إنسبايرون 15',
        description: 'لابتوب ديل بشاشة 15 بوصة ومعالج Intel Core i5',
        unit: 'قطعة',
        costPrice: 2500,
        salePrice: 3200,
        minStock: 5,
        hasExpiry: false,
        trackSerial: true,
        isActive: true,
      },
      {
        categoryId: 'mobile-phones',
        code: 'PROD002',
        barcode: '2345678901234',
        name: 'Samsung Galaxy A54',
        arabicName: 'سامسونج غالاكسي A54',
        description: 'هاتف سامسونج غالاكسي A54 بذاكرة 128 جيجا',
        unit: 'قطعة',
        costPrice: 1200,
        salePrice: 1650,
        minStock: 10,
        hasExpiry: false,
        trackSerial: true,
        isActive: true,
      },
      {
        categoryId: 'office-supplies',
        code: 'PROD003',
        barcode: '3456789012345',
        name: 'A4 Paper Ream',
        arabicName: 'رزمة ورق A4',
        description: 'رزمة ورق أبيض مقاس A4 - 500 ورقة',
        unit: 'رزمة',
        costPrice: 15,
        salePrice: 25,
        minStock: 20,
        hasExpiry: false,
        trackSerial: false,
        isActive: true,
      },
    ],
    skipDuplicates: true,
  });

  console.log('✅ تم إنشاء البيانات التجريبية (العملاء، الموردين، المنتجات)');
}

// تشغيل السكريپت
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });