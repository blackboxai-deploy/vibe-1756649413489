// API إدارة الحسابات المحاسبية
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { AccountType } from '@/types/accounting';

// جلب جميع الحسابات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fiscalYearId = searchParams.get('fiscalYearId') || 'default-fiscal-year';
    const accountType = searchParams.get('accountType') as AccountType | null;
    const parentId = searchParams.get('parentId');
    const includeChildren = searchParams.get('includeChildren') === 'true';

    const whereClause: any = {
      fiscalYearId,
      isActive: true,
    };

    if (accountType) {
      whereClause.accountType = accountType;
    }

    if (parentId) {
      whereClause.parentId = parentId;
    }

    const accounts = await prisma.account.findMany({
      where: whereClause,
      include: {
        parent: true,
        children: includeChildren,
        fiscalYear: true,
      },
      orderBy: [
        { level: 'asc' },
        { code: 'asc' },
      ],
    });

    return NextResponse.json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في جلب الحسابات',
      },
      { status: 500 }
    );
  }
}

// إنشاء حساب جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      fiscalYearId,
      code,
      name,
      arabicName,
      accountType,
      parentId,
      openingBalance = 0,
    } = body;

    // التحقق من وجود الكود
    const existingAccount = await prisma.account.findUnique({
      where: {
        fiscalYearId_code: {
          fiscalYearId,
          code,
        },
      },
    });

    if (existingAccount) {
      return NextResponse.json(
        {
          success: false,
          error: 'كود الحساب موجود بالفعل',
        },
        { status: 400 }
      );
    }

    // تحديد المستوى بناءً على الحساب الأب
    let level = 1;
    if (parentId) {
      const parentAccount = await prisma.account.findUnique({
        where: { id: parentId },
      });
      if (parentAccount) {
        level = parentAccount.level + 1;
        // تحديث الحساب الأب ليصبح حساب رئيسي
        await prisma.account.update({
          where: { id: parentId },
          data: { isParent: true },
        });
      }
    }

    const account = await prisma.account.create({
      data: {
        fiscalYearId,
        code,
        name,
        arabicName,
        accountType,
        parentId,
        level,
        openingBalance,
        currentBalance: openingBalance,
      },
      include: {
        parent: true,
        fiscalYear: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: account,
      message: 'تم إنشاء الحساب بنجاح',
    });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في إنشاء الحساب',
      },
      { status: 500 }
    );
  }
}

// تحديث حساب
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, arabicName, openingBalance, isActive } = body;

    const account = await prisma.account.update({
      where: { id },
      data: {
        name,
        arabicName,
        openingBalance,
        currentBalance: openingBalance,
        isActive,
      },
      include: {
        parent: true,
        fiscalYear: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: account,
      message: 'تم تحديث الحساب بنجاح',
    });
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في تحديث الحساب',
      },
      { status: 500 }
    );
  }
}

// حذف حساب
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'معرف الحساب مطلوب',
        },
        { status: 400 }
      );
    }

    // التحقق من وجود حسابات فرعية
    const childrenCount = await prisma.account.count({
      where: { parentId: id },
    });

    if (childrenCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف الحساب لأنه يحتوي على حسابات فرعية',
        },
        { status: 400 }
      );
    }

    // التحقق من وجود قيود محاسبية
    const entriesCount = await prisma.journalEntry.count({
      where: {
        OR: [
          { debitAccountId: id },
          { creditAccountId: id },
        ],
      },
    });

    if (entriesCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف الحساب لأنه يحتوي على قيود محاسبية',
        },
        { status: 400 }
      );
    }

    await prisma.account.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف الحساب بنجاح',
    });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في حذف الحساب',
      },
      { status: 500 }
    );
  }
}