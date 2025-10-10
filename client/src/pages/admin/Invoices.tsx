import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Download, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/authUtils";
import type { Invoice } from "@shared/schema";

export default function AdminInvoices() {
  const [search, setSearch] = useState("");
  
  const { data: invoices = [] } = useQuery<Invoice[]>({
    queryKey: ["/api/admin/invoices"],
  });

  const filteredInvoices = invoices.filter(invoice => 
    invoice.id.toLowerCase().includes(search.toLowerCase()) ||
    invoice.orderId.toLowerCase().includes(search.toLowerCase()) ||
    invoice.invoiceNumber.toLowerCase().includes(search.toLowerCase())
  );

  const handleExport = () => {
    const csvContent = [
      ['Invoice ID', 'Invoice Number', 'Order ID', 'Subtotal', 'VAT', 'Total', 'Date'],
      ...filteredInvoices.map(inv => [
        inv.id,
        inv.invoiceNumber,
        inv.orderId,
        (inv.subtotalCents || 0) / 100,
        (inv.vatCents || 0) / 100,
        (inv.totalCents || 0) / 100,
        new Date(inv.createdAt!).toISOString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoices-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const totalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.totalCents || 0), 0);
  const subtotalAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.subtotalCents || 0), 0);
  const vatAmount = filteredInvoices.reduce((sum, inv) => sum + (inv.vatCents || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices & Payments</h1>
          <p className="text-muted-foreground">Monitor all platform invoices and payment status</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2" data-testid="button-export-invoices">
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Total Amount</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="text-total-invoiced">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">Subtotal</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="text-total-subtotal">{formatCurrency(subtotalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <p className="text-sm text-muted-foreground">VAT Collected</p>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold" data-testid="text-total-vat">{formatCurrency(vatAmount)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by invoice ID, order ID, or recipient..."
                className="pl-10"
                data-testid="input-search-invoices"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice Number</TableHead>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead>VAT</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-mono text-sm">{invoice.invoiceNumber}</TableCell>
                    <TableCell className="font-mono text-sm">#{invoice.orderId.slice(0, 8)}</TableCell>
                    <TableCell>{formatCurrency(invoice.subtotalCents || 0)}</TableCell>
                    <TableCell>{formatCurrency(invoice.vatCents || 0)}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(invoice.totalCents || 0)}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDate(invoice.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" data-testid={`button-view-invoice-${invoice.id}`}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
