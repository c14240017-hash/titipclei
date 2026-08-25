import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";
import { OrderStatus } from "@prisma/client";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminApi();
    const { id } = await params;
    const body = await request.json();
    const { status, description, courier, trackingNumber, location } = body;

    if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
      return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: "Pesanan tidak ditemukan" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: { orderStatus: status as OrderStatus }
      });

      await tx.orderTracking.create({
        data: {
          orderId: id,
          status: status as OrderStatus,
          description: description || null,
          courier: courier || null,
          trackingNumber: trackingNumber || null,
          location: location || null,
        }
      });
    });

    revalidatePath(`/admin/orders/${id}`);
    revalidatePath(`/admin/orders`);
    revalidatePath(`/track`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}
