// API إدارة الموردين
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { SupplierType } from '@/types/accounting';

// جلب جميع الموردين
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId') || 'default-branch';
    const type = searchParams.get('type') as SupplierType | null;
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

    const [suppliers, total] = await Promise.all([
      prisma.supplier.findMany({
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
              payments: true,
            },
          },
        },
        orderBy: [
          { code: 'asc' },
        ],
        skip,
        take: pageSize,
      }),
      prisma.supplier.count({ where: whereClause }),
    ]);

    // حساب أرصدة الموردين
    const suppliersWithBalances = await Promise.all(
      suppliers.map(async (supplier) => {
        const invoicesSum = await prisma.purchaseInvoice.aggregate({
          where: { supplierId: supplier.id },
          _sum: { totalAmount: true, paidAmount: true },
        });

        const paymentsSum = await prisma.payment.aggregate({
          where: { supplierId: supplier.id },
          _sum: { amount: true },
        });

        const totalInvoices = invoicesSum._sum.totalAmount || 0;
        const totalPayments = paymentsSum._sum.amount || 0;
        const balance = totalInvoices - totalPayments;

        return {
          ...supplier,
          balance,
          totalInvoices,
          totalPayments,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: suppliersWithBalances,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching suppliers:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في جلب الموردين',
      },
      { status: 500 }
    );
  }
}

// إنشاء مورد جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      branchId = 'default-branch',
      code,
      name,
      arabicName,
      type = 'LOCAL',
      taxNumber,
      commercial,
      address,
      city,
      phone,
      mobile,
      email,
      creditLimit = 0,
      paymentTerms = 30,
    } = body;

    // التحقق من وجود كود المورد
    const existingSupplier = await prisma.supplier.findUnique({
      where: {
        branchId_code: {
          branchId,
          code,
        },
      },
    });

    if (existingSupplier) {
      return NextResponse.json(
        {
          success: false,
          error: 'كود المورد موجود بالفعل',
        },
        { status: 400 }
      );
    }

    // التحقق من البريد الإلكتروني إذا تم تقديمه
    if (email) {
      const existingEmail = await prisma.supplier.findFirst({
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

    const supplier = await prisma.supplier.create({
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
      data: supplier,
      message: 'تم إنشاء المورد بنجاح',
    });
  } catch (error) {
    console.error('Error creating supplier:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في إنشاء المورد',
      },
      { status: 500 }
    );
  }
}

// تحديث مورد
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
      isActive,
    } = body;

    // التحقق من البريد الإلكتروني إذا تم تقديمه
    if (email) {
      const existingEmail = await prisma.supplier.findFirst({
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

    const supplier = await prisma.supplier.update({
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
      data: supplier,
      message: 'تم تحديث المورد بنجاح',
    });
  } catch (error) {
    console.error('Error updating supplier:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في تحديث المورد',
      },
      { status: 500 }
    );
  }
}

// حذف مورد
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'معرف المورد مطلوب',
        },
        { status: 400 }
      );
    }

    // التحقق من وجود فواتير للمورد
    const invoicesCount = await prisma.purchaseInvoice.count({
      where: { supplierId: id },
    });

    if (invoicesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف المورد لأنه يحتوي على فواتير',
        },
        { status: 400 }
      );
    }

    // التحقق من وجود سندات دفع للمورد
    const paymentsCount = await prisma.payment.count({
      where: { supplierId: id },
    });

    if (paymentsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف المورد لأنه يحتوي على سندات دفع',
        },
        { status: 400 }
      );
    }

    await prisma.supplier.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف المورد بنجاح',
    });
  } catch (error) {
    console.error('Error deleting supplier:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في حذف المورد',
      },
      { status: 500 }
    );
  }
}