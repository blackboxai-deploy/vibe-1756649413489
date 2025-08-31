// API إدارة المعاملات المالية والقيود
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TransactionType, TransactionStatus } from '@/types/accounting';

// جلب جميع المعاملات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYearId = searchParams.get('fiscalYearId') || 'default-fiscal-year';
    const branchId = searchParams.get('branchId') || 'default-branch';
    const type = searchParams.get('type') as TransactionType | null;
    const status = searchParams.get('status') as TransactionStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const search = searchParams.get('search');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');

    const skip = (page - 1) * pageSize;

    const whereClause: any = {
      fiscalYearId,
      branchId,
    };

    if (type) {
      whereClause.type = type;
    }

    if (status) {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { number: { contains: search } },
        { description: { contains: search } },
        { reference: { contains: search } },
      ];
    }

    if (fromDate || toDate) {
      whereClause.date = {};
      if (fromDate) {
        whereClause.date.gte = new Date(fromDate);
      }
      if (toDate) {
        whereClause.date.lte = new Date(toDate);
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        include: {
          entries: {
            include: {
              debitAccount: true,
              creditAccount: true,
            },
          },
          user: {
            select: {
              fullName: true,
              username: true,
            },
          },
          branch: {
            select: {
              name: true,
              arabicName: true,
            },
          },
        },
        orderBy: [
          { date: 'desc' },
          { number: 'desc' },
        ],
        skip,
        take: pageSize,
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في جلب المعاملات',
      },
      { status: 500 }
    );
  }
}

// إنشاء معاملة جديدة
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fiscalYearId = 'default-fiscal-year',
      branchId = 'default-branch',
      userId = 'admin',
      date,
      description,
      reference,
      type,
      entries,
    } = body;

    // التحقق من توازن القيود
    const totalDebit = entries.reduce((sum: number, entry: any) => 
      sum + (entry.debitAccountId ? entry.amount : 0), 0
    );
    const totalCredit = entries.reduce((sum: number, entry: any) => 
      sum + (entry.creditAccountId ? entry.amount : 0), 0
    );

    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return NextResponse.json(
        {
          success: false,
          error: 'القيود غير متوازنة - إجمالي المدين يجب أن يساوي إجمالي الدائن',
        },
        { status: 400 }
      );
    }

    // توليد رقم المعاملة
    const lastTransaction = await prisma.transaction.findFirst({
      where: { fiscalYearId },
      orderBy: { number: 'desc' },
    });

    let nextNumber = '1';
    if (lastTransaction) {
      const lastNum = parseInt(lastTransaction.number);
      nextNumber = (lastNum + 1).toString();
    }

    const transaction = await prisma.transaction.create({
      data: {
        fiscalYearId,
        branchId,
        userId,
        number: nextNumber,
        date: new Date(date),
        description,
        reference,
        type,
        status: 'PENDING',
        totalAmount: totalDebit,
        entries: {
          create: entries.map((entry: any) => ({
            debitAccountId: entry.debitAccountId,
            creditAccountId: entry.creditAccountId,
            amount: entry.amount,
            description: entry.description,
          })),
        },
      },
      include: {
        entries: {
          include: {
            debitAccount: true,
            creditAccount: true,
          },
        },
        user: {
          select: {
            fullName: true,
            username: true,
          },
        },
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
      data: transaction,
      message: 'تم إنشاء المعاملة بنجاح',
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في إنشاء المعاملة',
      },
      { status: 500 }
    );
  }
}

// ترحيل المعاملة
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, action } = body;

    if (action === 'post') {
      // ترحيل المعاملة - تحديث أرصدة الحسابات
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          entries: {
            include: {
              debitAccount: true,
              creditAccount: true,
            },
          },
        },
      });

      if (!transaction) {
        return NextResponse.json(
          {
            success: false,
            error: 'المعاملة غير موجودة',
          },
          { status: 404 }
        );
      }

      if (transaction.status === 'POSTED') {
        return NextResponse.json(
          {
            success: false,
            error: 'المعاملة مرحلة بالفعل',
          },
          { status: 400 }
        );
      }

      // تحديث أرصدة الحسابات
      for (const entry of transaction.entries) {
        if (entry.debitAccount) {
          await prisma.account.update({
            where: { id: entry.debitAccount.id },
            data: {
              currentBalance: {
                increment: entry.amount,
              },
            },
          });
        }

        if (entry.creditAccount) {
          await prisma.account.update({
            where: { id: entry.creditAccount.id },
            data: {
              currentBalance: {
                decrement: entry.amount,
              },
            },
          });
        }
      }

      // تحديث حالة المعاملة
      const updatedTransaction = await prisma.transaction.update({
        where: { id },
        data: { status: 'POSTED' },
        include: {
          entries: {
            include: {
              debitAccount: true,
              creditAccount: true,
            },
          },
          user: {
            select: {
              fullName: true,
              username: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedTransaction,
        message: 'تم ترحيل المعاملة بنجاح',
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'إجراء غير صحيح',
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في تحديث المعاملة',
      },
      { status: 500 }
    );
  }
}

// حذف معاملة
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'معرف المعاملة مطلوب',
        },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    if (!transaction) {
      return NextResponse.json(
        {
          success: false,
          error: 'المعاملة غير موجودة',
        },
        { status: 404 }
      );
    }

    if (transaction.status === 'POSTED') {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف معاملة مرحلة',
        },
        { status: 400 }
      );
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف المعاملة بنجاح',
    });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في حذف المعاملة',
      },
      { status: 500 }
    );
  }
}