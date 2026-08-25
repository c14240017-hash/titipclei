"use client";

import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, CheckCircle2, XCircle, AlertCircle, ArrowRight, Package } from "lucide-react";

// Mock Data
type QuotationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

interface Quotation {
  id: string;
  productName: string;
  country: string;
  requestDate: string;
  status: QuotationStatus;
  estimatedPrice: number;
  imageUrl?: string;
}

const mockQuotations: Quotation[] = [
  {
    id: "QT-2023-001",
    productName: "Nike Air Max 90 Japan Edition",
    country: "JP",
    requestDate: "2023-10-15T08:30:00Z",
    status: "PENDING",
    estimatedPrice: 1500000,
  },
  {
    id: "QT-2023-002",
    productName: "Sony WH-1000XM5 Headphones",
    country: "US",
    requestDate: "2023-10-12T14:20:00Z",
    status: "ACCEPTED",
    estimatedPrice: 4200000,
  },
  {
    id: "QT-2023-003",
    productName: "Gentle Monster Sunglasses",
    country: "KR",
    requestDate: "2023-10-10T09:15:00Z",
    status: "REJECTED",
    estimatedPrice: 3800000,
  },
  {
    id: "QT-2023-004",
    productName: "Starbucks Korea Tumbler Autumn Collection",
    country: "KR",
    requestDate: "2023-09-25T11:00:00Z",
    status: "EXPIRED",
    estimatedPrice: 550000,
  }
];

export default function QuotationsPage() {
  const [activeTab, setActiveTab] = useState("all");

  const getStatusBadge = (status: QuotationStatus) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200"><Clock className="w-3 h-3 mr-1" /> Menunggu</Badge>;
      case 'ACCEPTED':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200"><CheckCircle2 className="w-3 h-3 mr-1" /> Diterima</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200"><XCircle className="w-3 h-3 mr-1" /> Ditolak</Badge>;
      case 'EXPIRED':
        return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200"><AlertCircle className="w-3 h-3 mr-1" /> Expired</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredQuotations = mockQuotations.filter(q => {
    if (activeTab === "all") return true;
    if (activeTab === "pending") return q.status === "PENDING";
    if (activeTab === "accepted") return q.status === "ACCEPTED";
    if (activeTab === "rejected") return q.status === "REJECTED";
    if (activeTab === "expired") return q.status === "EXPIRED";
    return true;
  });

  return (
    <div className="container max-w-5xl py-8 mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-950 flex items-center gap-2">
            <FileText className="w-8 h-8 text-indigo-600" />
            Quotations
          </h1>
          <p className="text-muted-foreground mt-1">Kelola dan pantau penawaran harga untuk request jastip Anda.</p>
        </div>
        <Button className="bg-indigo-600 hover:bg-indigo-700 rounded-lg">
          <Link href="/request">
            Buat Request Baru
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-8 h-auto p-1 bg-slate-100 rounded-xl">
          <TabsTrigger value="all" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Semua</TabsTrigger>
          <TabsTrigger value="pending" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Menunggu</TabsTrigger>
          <TabsTrigger value="accepted" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Diterima</TabsTrigger>
          <TabsTrigger value="rejected" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Ditolak</TabsTrigger>
          <TabsTrigger value="expired" className="rounded-lg py-2.5 data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:shadow-sm">Expired</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredQuotations.length === 0 ? (
            <div className="text-center py-16 px-4 border border-dashed rounded-xl bg-slate-50/50">
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">Tidak ada penawaran</h3>
              <p className="text-slate-500 mt-1 max-w-sm mx-auto">
                Anda belum memiliki penawaran dengan status ini. Silakan buat request baru untuk mendapatkan penawaran.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {filteredQuotations.map((q) => (
                <Card key={q.id} className="overflow-hidden border-indigo-100 shadow-sm hover:shadow-md transition-shadow rounded-xl">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-sm text-slate-500 font-medium mb-1">{q.id}</p>
                        <h3 className="font-semibold text-lg text-indigo-950 line-clamp-1" title={q.productName}>
                          {q.productName}
                        </h3>
                      </div>
                      {getStatusBadge(q.status)}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-4 text-sm mt-6">
                      <div>
                        <p className="text-slate-500 mb-1">Tanggal Request</p>
                        <p className="font-medium text-slate-900">{format(new Date(q.requestDate), 'dd MMM yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 mb-1">Negara Asal</p>
                        <p className="font-medium text-slate-900 flex items-center gap-1.5">
                          <span className="text-lg leading-none">
                            {q.country === 'JP' ? '🇯🇵' : q.country === 'US' ? '🇺🇸' : q.country === 'KR' ? '🇰🇷' : '🌐'}
                          </span>
                          {q.country}
                        </p>
                      </div>
                      <div className="col-span-2 pt-4 border-t border-slate-100">
                        <p className="text-slate-500 mb-1">Estimasi Harga (IDR)</p>
                        <p className="font-bold text-xl text-indigo-700">
                          {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(q.estimatedPrice)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end">
                    <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 font-medium">
                      <Link href={`/quotations/${q.id}`}>
                        Lihat Detail <ArrowRight className="w-4 h-4 ml-2" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
