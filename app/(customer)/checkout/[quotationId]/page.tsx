import { redirect } from "next/navigation";

export default async function CheckoutRedirect({ params }: { params: Promise<{ quotationId: string }> }) {
  const { quotationId } = await params;
  redirect(`/payment/${quotationId}`);
}
