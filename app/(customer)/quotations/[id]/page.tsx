"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, X, ExternalLink, ShieldCheck, AlertCircle } from "lucide-react";

// Mock fetching quotation detail
const getMockQuotationDetail = (id: string) => {
  return {
    id,
    productName: "Nike Air Max 90 Japan Edition",
    productUrl: "https://nike.jp/air-max-90",
    requestDate: "2023-10-15T08:30:00Z",
    status: "PENDING", // PENDING, ACCEPTED, REJECTED
    notes: "Tolong pastikan ukurannya benar US 10.5",
    pricing: {
      foreignPrice: 15000,
      currency: "JPY",
      exchangeRate: 105.5,
      convertedPrice: 1582500,
      shippingFee: 250000,
      taxAndCustoms: 150000,
      serviceFee: 100000,
      finalPrice: 2082500,
    }
  };
};

export default function QuotationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [quotation, setQuotation] = useState(() => getMockQuotationDetail(id));
  const [isProcessing, setIsProcessing] = useState(false);

  const handleAccept = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setQuotation({ ...quotation, status: "ACCEPTED" });
      setIsProcessing(false);
      router.push(`/payment/${id}`);
    }, 1000);
  };

  const handleReject = () => {
    if (confirm("Apakah Anda yakin ingin menolak penawaran ini?")) {
      setIsProcessing(true);
      setTimeout(() => {
        setQuotation({ ...quotation, status: "REJECTED" });
        setIsProcessing(false);
      }, 1000);
    }
  };

  const formatIDR = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatForeign = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  return (
    <div className="container max-w-4xl py-8 mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon">
          <Link href="/quotations">
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-indigo-950">Detail Penawaran</h1>
          <p className="text-muted-foreground">{quotation.id}</p>
        </div>
        <div className="ml-auto">
          {quotation.status === 'PENDING' && <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-none px-3 py-1">Menunggu Konfirmasi</Badge>}
          {quotation.status === 'ACCEPTED' && <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none px-3 py-1">Diterima</Badge>}
          {quotation.status === 'REJECTED' && <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-none px-3 py-1">Ditolak</Badge>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card className="border-indigo-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-50">
              <CardTitle className="text-lg text-indigo-900">Informasi Produk</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Nama Produk</p>
                <p className="font-medium text-slate-900">{quotation.productName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Link Produk</p>
                <a 
                  href={quotation.productUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-medium break-all"
                >
                  {quotation.productUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              {quotation.notes && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Catatan Tambahan
                  </p>
                  <p className="text-slate-800 text-sm">{quotation.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-indigo-100 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-indigo-50/50 pb-4 border-b border-indigo-50">
              <CardTitle className="text-lg text-indigo-900">Rincian Harga</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-600">Harga Barang Asli</span>
                  <span className="font-medium">{formatForeign(quotation.pricing.foreignPrice, quotation.pricing.currency)}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors text-sm">
                  <span className="text-slate-500">Rate yang Digunakan ({quotation.pricing.currency} to IDR)</span>
                  <span className="text-slate-500">{formatIDR(quotation.pricing.exchangeRate)}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-600">Harga Barang (IDR)</span>
                  <span className="font-medium">{formatIDR(quotation.pricing.convertedPrice)}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-600">Estimasi Ongkir Internasional</span>
                  <span className="font-medium">{formatIDR(quotation.pricing.shippingFee)}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-600">Pajak & Bea Cukai</span>
                  <span className="font-medium">{formatIDR(quotation.pricing.taxAndCustoms)}</span>
                </div>
                <div className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-600">Service Fee JastipHub</span>
                  <span className="font-medium">{formatIDR(quotation.pricing.serviceFee)}</span>
                </div>
              </div>
            </CardContent>
            <div className="bg-indigo-600 text-white p-6 rounded-b-xl flex justify-between items-center">
              <span className="font-medium text-indigo-100">Total Harga</span>
              <span className="text-2xl font-bold">{formatIDR(quotation.pricing.finalPrice)}</span>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="border-indigo-100 shadow-sm rounded-xl">
            <CardHeader>
              <CardTitle className="text-lg text-indigo-900">Tindakan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {quotation.status === 'PENDING' ? (
                <>
                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg h-12 text-md" 
                    onClick={handleAccept}
                    disabled={isProcessing}
                  >
                    <Check className="w-5 h-5 mr-2" />
                    Terima Penawaran
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200 rounded-lg h-12"
                    onClick={handleReject}
                    disabled={isProcessing}
                  >
                    <X className="w-5 h-5 mr-2" />
                    Tolak
                  </Button>
                  <p className="text-xs text-center text-slate-500 mt-4">
                    Dengan menerima penawaran, Anda setuju dengan Syarat & Ketentuan kami.
                  </p>
                </>
              ) : (
                <div className="text-center p-4 rounded-lg bg-slate-50 border border-slate-100">
                  <p className="text-sm font-medium text-slate-700">
                    Penawaran ini telah {quotation.status === 'ACCEPTED' ? 'diterima' : 'ditolak'}.
                  </p>
                  {quotation.status === 'ACCEPTED' && (
                    <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white rounded-lg">
                      <Link href={`/payment/${quotation.id}`}>
                        Lanjut Pembayaran
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-indigo-50 border-none shadow-sm rounded-xl">
            <CardContent className="p-5 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-indigo-900 text-sm">Pembayaran Aman</h4>
                <p className="text-xs text-indigo-700/80 mt-1">
                  Dana Anda akan ditahan oleh JastipHub hingga barang sampai di tangan Anda.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
