import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const access = await requireAdminApi(); if (access.response) return access.response;
  const { id } = await context.params; const { status } = await request.json();
  if (!['PENDING_REVIEW', 'REVIEWED', 'QUOTATION_SENT', 'ACCEPTED', 'QUOTATION_REJECTED', 'CANCELLED'].includes(status)) return NextResponse.json({ error: 'Status request tidak valid.' }, { status: 400 });
  const updated = await prisma.jastipRequest.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}
