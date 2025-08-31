// أنواع البيانات المحاسبية - النظام المحاسبي المتكامل

// ======== أنواع المصادقة والمستخدمين ========

export interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  branchId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface UserPermission {
  id: string;
  userId: string;
  module: PermissionModule;
  canView: boolean;
  canAdd: boolean;
  canEdit: boolean;
  canDelete: boolean;
}

// ======== أنواع الشركة والفروع ========

export interface Company {
  id: string;
  name: string;
  arabicName: string;
  taxNumber?: string;
  commercial?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Branch {
  id: string;
  companyId: string;
  name: string;
  arabicName: string;
  address?: string;
  phone?: string;
  manager?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: Company;
}

// ======== أنواع السنة المالية ========

export interface FiscalYear {
  id: string;
  companyId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  isCurrent: boolean;
  isClosed: boolean;
  createdAt: Date;
  updatedAt: Date;
  company?: Company;
}

// ======== أنواع الحسابات المحاسبية ========

export interface Account {
  id: string;
  fiscalYearId: string;
  code: string;
  name: string;
  arabicName: string;
  accountType: AccountType;
  parentId?: string;
  level: number;
  isParent: boolean;
  openingBalance: number;
  currentBalance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  fiscalYear?: FiscalYear;
  parent?: Account;
  children?: Account[];
}

export interface AccountCreate {
  fiscalYearId: string;
  code: string;
  name: string;
  arabicName: string;
  accountType: AccountType;
  parentId?: string;
  openingBalance?: number;
}

export interface AccountUpdate {
  name?: string;
  arabicName?: string;
  openingBalance?: number;
  isActive?: boolean;
}

// ======== أنواع المعاملات المالية ========

export interface Transaction {
  id: string;
  fiscalYearId: string;
  branchId: string;
  userId: string;
  number: string;
  date: Date;
  description: string;
  reference?: string;
  type: TransactionType;
  status: TransactionStatus;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
  entries?: JournalEntry[];
}

export interface JournalEntry {
  id: string;
  transactionId: string;
  debitAccountId?: string;
  creditAccountId?: string;
  amount: number;
  description?: string;
  debitAccount?: Account;
  creditAccount?: Account;
}

export interface TransactionCreate {
  fiscalYearId: string;
  branchId: string;
  date: Date;
  description: string;
  reference?: string;
  type: TransactionType;
  entries: JournalEntryCreate[];
}

export interface JournalEntryCreate {
  debitAccountId?: string;
  creditAccountId?: string;
  amount: number;
  description?: string;
}

// ======== أنواع العملاء والموردين ========

export interface Customer {
  id: string;
  branchId: string;
  code: string;
  name: string;
  arabicName: string;
  type: CustomerType;
  taxNumber?: string;
  commercial?: string;
  address?: string;
  city?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  creditLimit: number;
  paymentTerms: number;
  salesRep?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  branch?: Branch;
}

export interface CustomerCreate {
  branchId: string;
  code: string;
  name: string;
  arabicName: string;
  type?: CustomerType;
  taxNumber?: string;
  commercial?: string;
  address?: string;
  city?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  creditLimit?: number;
  paymentTerms?: number;
  salesRep?: string;
}

export interface Supplier {
  id: string;
  branchId: string;
  code: string;
  name: string;
  arabicName: string;
  type: SupplierType;
  taxNumber?: string;
  commercial?: string;
  address?: string;
  city?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  creditLimit: number;
  paymentTerms: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  branch?: Branch;
}

export interface SupplierCreate {
  branchId: string;
  code: string;
  name: string;
  arabicName: string;
  type?: SupplierType;
  taxNumber?: string;
  commercial?: string;
  address?: string;
  city?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  creditLimit?: number;
  paymentTerms?: number;
}

// ======== أنواع المنتجات والمخزون ========

export interface Category {
  id: string;
  name: string;
  arabicName: string;
  parentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  parent?: Category;
  children?: Category[];
}

export interface Product {
  id: string;
  categoryId: string;
  code: string;
  barcode?: string;
  name: string;
  arabicName: string;
  description?: string;
  unit: string;
  costPrice: number;
  salePrice: number;
  minStock: number;
  hasExpiry: boolean;
  trackSerial: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  category?: Category;
}

export interface ProductCreate {
  categoryId: string;
  code: string;
  barcode?: string;
  name: string;
  arabicName: string;
  description?: string;
  unit: string;
  costPrice?: number;
  salePrice?: number;
  minStock?: number;
  hasExpiry?: boolean;
  trackSerial?: boolean;
}

export interface Warehouse {
  id: string;
  branchId: string;
  code: string;
  name: string;
  address?: string;
  manager?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  branch?: Branch;
}

export interface InventoryItem {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  reservedQty: number;
  avgCost: number;
  lastCost: number;
  expiryDate?: Date;
  batchNo?: string;
  serialNo?: string;
  updatedAt: Date;
  warehouse?: Warehouse;
  product?: Product;
}

// ======== أنواع المبيعات ========

export interface SalesInvoice {
  id: string;
  customerId: string;
  number: string;
  date: Date;
  dueDate?: Date;
  reference?: string;
  notes?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
  customer?: Customer;
  items?: SalesInvoiceItem[];
}

export interface SalesInvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  product?: Product;
}

export interface SalesInvoiceCreate {
  customerId: string;
  date: Date;
  dueDate?: Date;
  reference?: string;
  notes?: string;
  discountAmount?: number;
  items: SalesInvoiceItemCreate[];
}

export interface SalesInvoiceItemCreate {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface Receipt {
  id: string;
  customerId: string;
  invoiceId?: string;
  number: string;
  date: Date;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: Date;
  customer?: Customer;
  invoice?: SalesInvoice;
}

// ======== أنواع المشتريات ========

export interface PurchaseInvoice {
  id: string;
  supplierId: string;
  number: string;
  date: Date;
  dueDate?: Date;
  reference?: string;
  notes?: string;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  createdAt: Date;
  updatedAt: Date;
  supplier?: Supplier;
  items?: PurchaseInvoiceItem[];
}

export interface PurchaseInvoiceItem {
  id: string;
  invoiceId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  product?: Product;
}

export interface PurchaseInvoiceCreate {
  supplierId: string;
  date: Date;
  dueDate?: Date;
  reference?: string;
  notes?: string;
  discountAmount?: number;
  items: PurchaseInvoiceItemCreate[];
}

export interface PurchaseInvoiceItemCreate {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface Payment {
  id: string;
  supplierId: string;
  invoiceId?: string;
  number: string;
  date: Date;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  createdAt: Date;
  supplier?: Supplier;
  invoice?: PurchaseInvoice;
}

// ======== أنواع التقارير ========

export interface FinancialReport {
  title: string;
  titleArabic: string;
  period: {
    from: Date;
    to: Date;
  };
  data: any[];
  totals?: Record<string, number>;
}

export interface BalanceSheet {
  assets: AccountBalance[];
  liabilities: AccountBalance[];
  equity: AccountBalance[];
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
}

export interface IncomeStatement {
  revenues: AccountBalance[];
  expenses: AccountBalance[];
  totalRevenues: number;
  totalExpenses: number;
  netIncome: number;
}

export interface AccountBalance {
  accountId: string;
  accountCode: string;
  accountName: string;
  accountNameArabic: string;
  debitTotal: number;
  creditTotal: number;
  balance: number;
}

export interface DashboardStats {
  totalSales: number;
  totalPurchases: number;
  totalCustomers: number;
  totalSuppliers: number;
  totalProducts: number;
  lowStockItems: number;
  overdueInvoices: number;
  cashFlow: number;
}

// ======== أنواع التصدير والاستيراد ========

export interface ExportOptions {
  format: 'xlsx' | 'csv' | 'pdf';
  filename?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

export interface ImportResult {
  success: boolean;
  totalRows: number;
  successfulRows: number;
  errors: ImportError[];
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
}

// ======== التعدادات (Enums) ========

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  ACCOUNTANT = 'ACCOUNTANT',
  USER = 'USER'
}

export enum PermissionModule {
  ACCOUNTS = 'ACCOUNTS',
  TRANSACTIONS = 'TRANSACTIONS',
  CUSTOMERS = 'CUSTOMERS',
  SUPPLIERS = 'SUPPLIERS',
  PRODUCTS = 'PRODUCTS',
  INVENTORY = 'INVENTORY',
  SALES = 'SALES',
  PURCHASES = 'PURCHASES',
  REPORTS = 'REPORTS',
  SETTINGS = 'SETTINGS'
}

export enum AccountType {
  ASSETS = 'ASSETS',          // الأصول
  LIABILITIES = 'LIABILITIES', // الخصوم
  EQUITY = 'EQUITY',          // حقوق الملكية
  REVENUE = 'REVENUE',        // الإيرادات
  EXPENSES = 'EXPENSES'       // المصروفات
}

export enum TransactionType {
  JOURNAL = 'JOURNAL',        // قيد يومي
  RECEIPT = 'RECEIPT',        // سند قبض
  PAYMENT = 'PAYMENT',        // سند صرف
  OPENING = 'OPENING',        // قيد افتتاحي
  CLOSING = 'CLOSING'         // قيد إقفال
}

export enum TransactionStatus {
  PENDING = 'PENDING',        // معلق
  POSTED = 'POSTED',          // مرحل
  CANCELLED = 'CANCELLED'     // ملغي
}

export enum CustomerType {
  INDIVIDUAL = 'INDIVIDUAL',  // فرد
  COMPANY = 'COMPANY'         // شركة
}

export enum SupplierType {
  LOCAL = 'LOCAL',            // محلي
  FOREIGN = 'FOREIGN'         // أجنبي
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',            // مسودة
  SENT = 'SENT',              // مرسلة
  PAID = 'PAID',              // مدفوعة
  OVERDUE = 'OVERDUE',        // متأخرة
  CANCELLED = 'CANCELLED'     // ملغية
}

export enum PaymentMethod {
  CASH = 'CASH',              // نقد
  BANK = 'BANK',              // بنك
  CHECK = 'CHECK',            // شيك
  CARD = 'CARD',              // بطاقة
  TRANSFER = 'TRANSFER'       // تحويل
}

export enum ProductionStatus {
  PLANNED = 'PLANNED',        // مخطط
  IN_PROGRESS = 'IN_PROGRESS', // قيد التنفيذ
  COMPLETED = 'COMPLETED',    // مكتمل
  CANCELLED = 'CANCELLED'     // ملغي
}

// ======== أنواع الاستجابة API ========

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}