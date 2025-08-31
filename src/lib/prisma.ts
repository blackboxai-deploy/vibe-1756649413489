// اتصال قاعدة البيانات - Prisma Client
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// وظائف مساعدة لقاعدة البيانات

/**
 * تهيئة قاعدة البيانات ببيانات افتراضية
 */
export async function initializeDatabase() {
  try {
    // إنشاء شركة افتراضية
    const company = await prisma.company.upsert({
      where: { id: 'default-company' },
      update: {},
      create: {
        id: 'default-company',
        name: 'Default Company',
        arabicName: 'الشركة الافتراضية',
        isActive: true,
      },
    });

    // إنشاء فرع افتراضي
    const branch = await prisma.branch.upsert({
      where: { id: 'default-branch' },
      update: {},
      create: {
        id: 'default-branch',
        companyId: company.id,
        name: 'Main Branch',
        arabicName: 'الفرع الرئيسي',
        isActive: true,
      },
    });

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

    // إنشاء مستخدم إداري افتراضي
    const adminUser = await prisma.user.upsert({
      where: { username: 'admin' },
      update: {},
      create: {
        username: 'admin',
        email: 'admin@company.com',
        password: '$2b$10$8YnGg8W8H8fGjGzGzGzGz.8YnGg8W8H8fGjGzGzGzGz8YnGg8W8H8', // password: admin123
        fullName: 'مدير النظام',
        role: 'ADMIN',
        branchId: branch.id,
        isActive: true,
      },
    });

    // إنشاء شجرة الحسابات الأساسية
    await createBasicChartOfAccounts(fiscalYear.id);

    // إنشاء تصنيفات المنتجات الأساسية
    await createBasicProductCategories();

    // إنشاء مخزن افتراضي
    await prisma.warehouse.upsert({
      where: { id: 'default-warehouse' },
      update: {},
      create: {
        id: 'default-warehouse',
        branchId: branch.id,
        code: 'MAIN',
        name: 'Main Warehouse',
        address: 'Main Location',
        manager: 'Warehouse Manager',
        isActive: true,
      },
    });

    console.log('✅ Database initialized successfully');
    
    return {
      company,
      branch,
      fiscalYear,
      adminUser,
    };
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    throw error;
  }
}

/**
 * إنشاء شجرة الحسابات الأساسية
 */
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
      openingBalance: 0,
    },
    {
      id: 'accounts-receivable',
      code: '1102',
      name: 'Accounts Receivable',
      arabicName: 'العملاء',
      accountType: 'ASSETS',
      parentId: 'current-assets',
      level: 3,
      openingBalance: 0,
    },
    {
      id: 'inventory',
      code: '1103',
      name: 'Inventory',
      arabicName: 'المخزون',
      accountType: 'ASSETS',
      parentId: 'current-assets',
      level: 3,
      openingBalance: 0,
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
      openingBalance: 0,
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
      openingBalance: 100000,
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

/**
 * إنشاء تصنيفات المنتجات الأساسية
 */
async function createBasicProductCategories() {
  const categories = [
    {
      id: 'general',
      name: 'General',
      arabicName: 'عام',
    },
    {
      id: 'electronics',
      name: 'Electronics',
      arabicName: 'الإلكترونيات',
    },
    {
      id: 'clothing',
      name: 'Clothing',
      arabicName: 'الملابس',
    },
    {
      id: 'food',
      name: 'Food & Beverages',
      arabicName: 'الأغذية والمشروبات',
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

/**
 * تنظيف قاعدة البيانات
 */
export async function cleanupDatabase() {
  try {
    await prisma.$executeRaw`DELETE FROM sqlite_sequence`;
    console.log('✅ Database cleaned successfully');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    throw error;
  }
}

/**
 * إغلاق اتصال قاعدة البيانات
 */
export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export default prisma;