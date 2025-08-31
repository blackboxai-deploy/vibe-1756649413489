// API إدارة المنتجات
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// جلب جميع المنتجات
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get('categoryId');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    const includeInventory = searchParams.get('includeInventory') === 'true';

    const skip = (page - 1) * pageSize;

    const whereClause: any = {};

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    if (search) {
      whereClause.OR = [
        { code: { contains: search } },
        { barcode: { contains: search } },
        { name: { contains: search } },
        { arabicName: { contains: search } },
        { description: { contains: search } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: whereClause,
        include: {
          category: true,
          inventory: includeInventory ? {
            include: {
              warehouse: {
                select: {
                  code: true,
                  name: true,
                },
              },
            },
          } : false,
          _count: {
            select: {
              salesItems: true,
              purchaseItems: true,
            },
          },
        },
        orderBy: [
          { code: 'asc' },
        ],
        skip,
        take: pageSize,
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    // حساب إجمالي الكمية لكل منتج
    const productsWithTotals = products.map(product => {
      const totalQuantity = product.inventory?.reduce(
        (sum, item) => sum + item.quantity, 0
      ) || 0;
      
      const reservedQuantity = product.inventory?.reduce(
        (sum, item) => sum + item.reservedQty, 0
      ) || 0;

      const availableQuantity = totalQuantity - reservedQuantity;

      return {
        ...product,
        totalQuantity,
        reservedQuantity,
        availableQuantity,
        isLowStock: availableQuantity <= product.minStock,
      };
    });

    return NextResponse.json({
      success: true,
      data: productsWithTotals,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في جلب المنتجات',
      },
      { status: 500 }
    );
  }
}

// إنشاء منتج جديد
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      categoryId,
      code,
      barcode,
      name,
      arabicName,
      description,
      unit,
      costPrice = 0,
      salePrice = 0,
      minStock = 0,
      hasExpiry = false,
      trackSerial = false,
    } = body;

    // التحقق من وجود كود المنتج
    const existingProduct = await prisma.product.findUnique({
      where: { code },
    });

    if (existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'كود المنتج موجود بالفعل',
        },
        { status: 400 }
      );
    }

    // التحقق من الباركود إذا تم تقديمه
    if (barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: {
          barcode,
          isActive: true,
        },
      });

      if (existingBarcode) {
        return NextResponse.json(
          {
            success: false,
            error: 'الباركود موجود بالفعل',
          },
          { status: 400 }
        );
      }
    }

    // التحقق من وجود التصنيف
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          error: 'التصنيف غير موجود',
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        categoryId,
        code,
        barcode,
        name,
        arabicName,
        description,
        unit,
        costPrice,
        salePrice,
        minStock,
        hasExpiry,
        trackSerial,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'تم إنشاء المنتج بنجاح',
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في إنشاء المنتج',
      },
      { status: 500 }
    );
  }
}

// تحديث منتج
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      categoryId,
      barcode,
      name,
      arabicName,
      description,
      unit,
      costPrice,
      salePrice,
      minStock,
      hasExpiry,
      trackSerial,
      isActive,
    } = body;

    // التحقق من الباركود إذا تم تقديمه
    if (barcode) {
      const existingBarcode = await prisma.product.findFirst({
        where: {
          barcode,
          isActive: true,
          NOT: { id },
        },
      });

      if (existingBarcode) {
        return NextResponse.json(
          {
            success: false,
            error: 'الباركود موجود بالفعل',
          },
          { status: 400 }
        );
      }
    }

    // التحقق من وجود التصنيف
    if (categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: 'التصنيف غير موجود',
          },
          { status: 400 }
        );
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        categoryId,
        barcode,
        name,
        arabicName,
        description,
        unit,
        costPrice,
        salePrice,
        minStock,
        hasExpiry,
        trackSerial,
        isActive,
      },
      include: {
        category: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: product,
      message: 'تم تحديث المنتج بنجاح',
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في تحديث المنتج',
      },
      { status: 500 }
    );
  }
}

// حذف منتج
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          error: 'معرف المنتج مطلوب',
        },
        { status: 400 }
      );
    }

    // التحقق من وجود حركات مخزون للمنتج
    const inventoryCount = await prisma.inventoryItem.count({
      where: { productId: id },
    });

    if (inventoryCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف المنتج لأنه يحتوي على حركات مخزون',
        },
        { status: 400 }
      );
    }

    // التحقق من وجود بنود فواتير للمنتج
    const salesItemsCount = await prisma.salesInvoiceItem.count({
      where: { productId: id },
    });

    const purchaseItemsCount = await prisma.purchaseInvoiceItem.count({
      where: { productId: id },
    });

    if (salesItemsCount > 0 || purchaseItemsCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'لا يمكن حذف المنتج لأنه مستخدم في فواتير',
        },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'تم حذف المنتج بنجاح',
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'حدث خطأ في حذف المنتج',
      },
      { status: 500 }
    );
  }
}