// API إدارة العملاء
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CustomerType } from '@/types/accounting';

// جلب جميع العملاء
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId') || 'default-branch';
    const type = searchParams.get('type') as CustomerType | null;
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const includeInactive = searchParams.get('includeInactive') === 'true';

    const skip = (page - 1) * pageSize;

    const whereClause: any = {
      branchId,
    };

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    if (type) {
      whereClause.type = type;
    }

    if (search) {
      whereClause.OR = [
        { code: { contains: search } },
        { name: { contains: search } },
        { arabicName: { contains: search } },
        { phone: { contains: search } },
        { mobile: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        include: {
          branch: {
            select: {
              name: true,
              arabicName: true,
            },
          },
          _count: {
            select: {
              invoices: true,
              receipts: true,
            },
          },
        },
        orderBy: [
          { code: 'asc' },
        ],
        skip,
        take: pageSize,
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    // حساب أرصدة العملاء
    const customersWithBalances = await Promise.all(
      customers.map(async (customer) => {
        const invoicesSum = await prisma.salesInvoice.aggregate({
          where: { customerId: customer.id },
          _sum: { totalAmount: true, paidAmount: true },
        });

        const receiptsSum = await prisma.receipt.aggregate({
          where: { customerId: customer.id },
          _sum: { amount: true },
        });

        const totalInvoices = invoicesSum._sum.totalAmount || 0;
        const totalReceipts = receiptsSum._sum.amount || 0;
        const balance = totalInvoices - totalReceipts;

        return {
          ...customer,
          balance,
          totalInvoices,
          totalReceipts,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: customersWithBalances,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في جلب العملاء',
      },
      { status: 500 }
    );
  }
}

// إنشاء عميل جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      branchId = 'default-branch',
      code,
      name,
      arabicName,
      type = 'INDIVIDUAL',
      taxNumber,
      commercial,
      address,
      city,
      phone,
      mobile,
      email,
      creditLimit = 0,
      paymentTerms = 30,
      salesRep,
    } = body;

    // التحقق من وجود كود العميل
    const existingCustomer = await prisma.customer.findUnique({
      where: {
        branchId_code: {
          branchId,
          code,
        },
      },
    });

    if (existingCustomer) {
      return NextResponse.json(
        {
          success: false,
          error: 'كود العميل موجود بالفعل',
        },
        { status: 400 }
      );
    }

    // التحقق من البريد الإلكتروني إذا تم تقديمه
    if (email) {
      const existingEmail = await prisma.customer.findFirst({
        where: {
          branchId,
          email,
          isActive: true,
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'البريد الإلكتروني مستخدم بالفعل',
          },
          { status: 400 }
        );
      }
    }

    const customer = await prisma.customer.create({
      data: {
        branchId,
        code,
        name,
        arabicName,
        type,
        taxNumber,
        commercial,
        address,
        city,
        phone,
        mobile,
        email,
        creditLimit,
        paymentTerms,
        salesRep,
      },
      include: {
        branch: {
          select: {
            name: true,
            arabicName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'تم إنشاء العميل بنجاح',
    });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في إنشاء العميل',
      },
      { status: 500 }
    );
  }
}

// تحديث عميل
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      arabicName,
      type,
      taxNumber,
      commercial,
      address,
      city,
      phone,
      mobile,
      email,
      creditLimit,
      paymentTerms,
      salesRep,
      isActive,
    } = body;

    // التحقق من البريد الإلكتروني إذا تم تقديمه
    if (email) {
      const existingEmail = await prisma.customer.findFirst({
        where: {
          email,
          isActive: true,
          NOT: { id },
        },
      });

      if (existingEmail) {
        return NextResponse.json(
          {
            success: false,
            error: 'البريد الإلكتروني مستخدم بالفعل',
          },
          { status: 400 }
        );
      }
    }

    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name,
        arabicName,
        type,
        taxNumber,
        commercial,
        address,
        city,
        phone,
        mobile,
        email,
        creditLimit,
        paymentTerms,
        salesRep,
        isActive,
      },
      include: {
        branch: {
          select: {
            name: true,
            arabicName: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'تم تحديث العميل بنجاح',
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في تحديث العميل',
      },
      { status: 500 }
    );
  }
}

// حذف عميل
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'معرف العميل مطلوب',
        },
        { status: 400 }
      );
    }

    // التحقق من وجود فواتير للعميل
    const invoicesCount = await prisma.salesInvoice.count({
      where: { customerId: id },
    });

    if (invoicesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف العميل لأنه يحتوي على فواتير',
        },
        { status: 400 }
      );
    }

    // التحقق من وجود سندات قبض للعميل
    const receiptsCount = await prisma.receipt.count({
      where: { customerId: id },
    });

    if (receiptsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف العميل لأنه يحتوي على سندات قبض',
        },
        { status: 400 }
      );
    }

    await prisma.customer.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف العميل بنجاح',
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في حذف العميل',
      },
      { status: 500 }
    );
  }
}