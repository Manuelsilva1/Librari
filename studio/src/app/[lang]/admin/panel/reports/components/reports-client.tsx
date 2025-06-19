
"use client";

import { useState, useMemo, useEffect, useCallback } from 'react';
import type { Editorial, Sale, Dictionary, ApiResponseError, Book } from '@/types'; // Ensure Sale type, not SaleRecord
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  format, parseISO, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval,
  isWithinInterval, subDays
} from 'date-fns';
import { es as esLocale, enUS as enLocale } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { CalendarIcon, FileText, Download, Loader2, AlertTriangle, Building2 } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { getEditorials as apiGetEditorials, getAdminSales as apiGetAdminSales } from '@/services/api'; 

interface ReportsClientProps {
  texts: Dictionary['adminPanel']['reportsPage'];
  lang: string;
  dictionary: Dictionary;
}

type SummaryLevel = 'none' | 'daily' | 'weekly' | 'monthly';

interface ReportData {
  totalSalesAmount: number;
  totalOrders: number;
  salesByPaymentMethod: { method: string; amount: number; count: number }[];
  salesByCategory: { category: string; quantity: number; amount: number }[];
  topSellingProducts: { title: string; quantity: number; revenue: number }[];
  periodicSummary?: { period: string; sales: number; orders: number }[];
  reportDateRange: { from: string; to: string };
  filteredByEditorialName?: string; 
}

const dateLocales: { [key: string]: Locale } = {
  en: enLocale,
  es: esLocale,
};

export function ReportsClient({ texts, lang, dictionary }: ReportsClientProps) {
  const { toast } = useToast();
  const currentLocale = dateLocales[lang] || enLocale;

  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [summaryLevel, setSummaryLevel] = useState<SummaryLevel>('none');
  const [selectedEditorialId, setSelectedEditorialId] = useState<string>('all');
  const [editorialsList, setEditorialsList] = useState<Editorial[]>([]); 
  const [allSalesData, setAllSalesData] = useState<Sale[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false); // For report generation
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const end = new Date();
    const start = subDays(end, 7);
    setDateRange({ from: start, to: end });

    async function initialLoad() {
      setIsLoading(true);
      setError(null);
      try {
        const [editorialsData, salesApiData] = await Promise.all([
          apiGetEditorials(),
          apiGetAdminSales()
        ]);
        setEditorialsList(editorialsData);
        setAllSalesData(salesApiData);
      } catch (err) {
        const apiError = err as ApiResponseError;
        setError(apiError.message || "Failed to load initial report data.");
        toast({ title: "Error", description: apiError.message || "Failed to load initial report data.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    initialLoad();
  }, [toast]);

  const formatCurrencyUYU = (amount: number) => {
    return `UYU ${amount.toFixed(2)}`;
  };

  const processSalesDataForReport = useCallback((salesToProcess: Sale[]): Omit<ReportData, 'reportDateRange' | 'filteredByEditorialName'> => {
    const totalSalesAmount = salesToProcess.reduce((sum, sale) => sum + sale.total, 0);
    const totalOrders = salesToProcess.length;

    const salesByPaymentMethod: ReportData['salesByPaymentMethod'] = Object.values(
      salesToProcess.reduce((acc, sale) => {
        // Assuming 'paymentMethod' might be added to Sale type or is available via other means
        const method = (sale as any).paymentMethod || 'unknown'; 
        acc[method] = acc[method] || { method: method, amount: 0, count: 0 };
        acc[method].amount += sale.total;
        acc[method].count += 1;
        return acc;
      }, {} as Record<string, { method: string; amount: number; count: number }>)
    );

    const salesByCategoryMap: { [key: string]: { category: string; quantity: number; amount: number } } = {};
    salesToProcess.forEach(sale => {
      sale.items.forEach(item => {
        const bookDetail = item.libro; // Assuming item.libro is populated
        const category = bookDetail?.categoriaId ? String(bookDetail.categoriaId) : 'N/A';
        salesByCategoryMap[category] = salesByCategoryMap[category] || { category, quantity: 0, amount: 0 };
        salesByCategoryMap[category].quantity += item.cantidad;
        salesByCategoryMap[category].amount += item.precioUnitario * item.cantidad;
      });
    });
    const salesByCategory = Object.values(salesByCategoryMap).sort((a,b) => b.quantity - a.quantity);

    const productSalesMap: { [key: string]: { title: string; quantity: number; revenue: number } } = {};
    salesToProcess.forEach(sale => {
      sale.items.forEach(item => {
        const bookDetail = item.libro;
        const title = bookDetail?.titulo || `Book ID: ${item.libroId}`;
        productSalesMap[title] = productSalesMap[title] || { title: title, quantity: 0, revenue: 0 };
        productSalesMap[title].quantity += item.cantidad;
        productSalesMap[title].revenue += item.precioUnitario * item.cantidad;
      });
    });
    const topSellingProducts = Object.values(productSalesMap).sort((a, b) => b.quantity - a.quantity).slice(0, 10);
    
    let periodicSummary: ReportData['periodicSummary'] | undefined = undefined;
    if (summaryLevel !== 'none' && dateRange?.from && dateRange?.to) {
      const summaryMap: { [key: string]: { sales: number; orders: number } } = {};
      let intervalDates: Date[] = [];
      if (summaryLevel === 'daily') {
          intervalDates = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      } else if (summaryLevel === 'weekly') {
          intervalDates = eachWeekOfInterval({ start: dateRange.from, end: dateRange.to }, { locale: currentLocale });
      } else { 
          intervalDates = eachMonthOfInterval({ start: dateRange.from, end: dateRange.to });
      }

      intervalDates.forEach(periodStart => {
        let periodKey: string;
        if (summaryLevel === 'daily') periodKey = format(periodStart, 'yyyy-MM-dd');
        else if (summaryLevel === 'weekly') periodKey = format(periodStart, 'yyyy-MM-dd');
        else periodKey = format(periodStart, 'yyyy-MM');
        summaryMap[periodKey] = { sales: 0, orders: 0 };
      });
      
      salesToProcess.forEach(sale => {
        const saleDate = parseISO(sale.fecha);
        let periodKeyToUpdate: string | undefined;
        if (summaryLevel === 'daily') {
            const key = format(saleDate, 'yyyy-MM-dd');
            if (summaryMap[key] !== undefined) periodKeyToUpdate = key;
        } else if (summaryLevel === 'weekly') {
            const startOfWeekForSale = startOfWeek(saleDate, { locale: currentLocale });
            const key = format(startOfWeekForSale, 'yyyy-MM-dd');
            if (summaryMap[key] !== undefined) periodKeyToUpdate = key;
        } else { 
            const key = format(saleDate, 'yyyy-MM');
            if (summaryMap[key] !== undefined) periodKeyToUpdate = key;
        }
        
        if (periodKeyToUpdate && summaryMap[periodKeyToUpdate]) {
           summaryMap[periodKeyToUpdate].sales += sale.total;
           summaryMap[periodKeyToUpdate].orders += 1;
        }
      });
      
      periodicSummary = Object.keys(summaryMap).sort().map(key => {
        let periodLabel = '';
        if (summaryLevel === 'daily') periodLabel = format(parseISO(key), 'P', { locale: currentLocale });
        else if (summaryLevel === 'weekly') {
            const startW = parseISO(key);
            periodLabel = `${format(startW, 'P', { locale: currentLocale })} - ${format(endOfWeek(startW, {locale: currentLocale}), 'P', { locale: currentLocale })}`;
        } else periodLabel = format(parseISO(key + '-01'), 'MMM yyyy', { locale: currentLocale });
        return { period: periodLabel, ...summaryMap[key] };
      });
    }
    
    return {
      totalSalesAmount,
      totalOrders,
      salesByPaymentMethod,
      salesByCategory,
      topSellingProducts,
      periodicSummary,
    };
  }, [summaryLevel, dateRange, currentLocale]);


  const handleGenerateReport = () => {
    if (!dateRange || !dateRange.from || !dateRange.to) {
      toast({
        title: texts.errorGeneratingReport,
        description: texts.pleaseSelectDateRange,
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    setReportData(null);
    setError(null);

    setTimeout(() => { // Simulate API call or heavy processing
      try {
        let salesToFilter = allSalesData.filter(sale => {
          const saleDate = parseISO(sale.fecha);
          return isWithinInterval(saleDate, { start: startOfDay(dateRange.from!), end: endOfDay(dateRange.to!) });
        });

        let currentFilteredByEditorialName: string | undefined = undefined;

        if (selectedEditorialId && selectedEditorialId !== 'all') {
          const selectedEd = editorialsList.find(e => String(e.id) === selectedEditorialId);
          currentFilteredByEditorialName = selectedEd?.nombre;

          // Filter sales to only include items from the selected publisher
          salesToFilter = salesToFilter.reduce((acc, sale) => {
            const itemsFromSelectedEditorial = sale.items.filter(
              item => String(item.libro?.editorialId) === selectedEditorialId // Assuming item.libro has editorialId
            );

            if (itemsFromSelectedEditorial.length > 0) {
              // Create a new sale object with only items from the selected publisher
              // and recalculate its total
              const saleForReport: Sale = {
                ...sale,
                items: itemsFromSelectedEditorial,
                total: itemsFromSelectedEditorial.reduce((sum, item) => sum + (item.precioUnitario * item.cantidad), 0),
              };
              acc.push(saleForReport);
            }
            return acc;
          }, [] as Sale[]);
        }
        
        if (salesToFilter.length === 0) {
          setReportData({
            totalSalesAmount: 0,
            totalOrders: 0,
            salesByPaymentMethod: [],
            salesByCategory: [],
            topSellingProducts: [],
            periodicSummary: [],
            reportDateRange: {
                from: format(dateRange.from!, 'P', { locale: currentLocale }),
                to: format(dateRange.to!, 'P', { locale: currentLocale })
            },
            filteredByEditorialName: currentFilteredByEditorialName,
          });
        } else {
            const processedData = processSalesDataForReport(salesToFilter);
            setReportData({
            ...processedData,
            reportDateRange: {
                from: format(dateRange.from!, 'P', { locale: currentLocale }),
                to: format(dateRange.to!, 'P', { locale: currentLocale })
            },
            filteredByEditorialName: currentFilteredByEditorialName,
            });
        }
      } catch (e) {
        console.error("Error processing report data:", e);
        setError(texts.errorGeneratingReport);
        toast({ title: texts.errorGeneratingReport, variant: "destructive" });
      } finally {
        setIsGenerating(false);
      }
    }, 500); 
  };

  const handleExport = (formatType: 'PDF' | 'Excel') => {
    if (!reportData) {
        toast({ title: texts.errorGeneratingReport, description: "No report data to export.", variant: "destructive" });
        return;
    }
    toast({
      title: formatType === 'PDF' ? texts.exportPDFSimulated : texts.exportExcelSimulated,
      description: `${texts.reportFor} ${reportData?.reportDateRange.from} - ${reportData?.reportDateRange.to}${reportData?.filteredByEditorialName ? ` (${texts.editorial}: ${reportData.filteredByEditorialName})` : ''}`,
    });
  };
  
  const getSummaryPeriodType = () => {
    if (summaryLevel === 'daily') return texts.summaryDaily;
    if (summaryLevel === 'weekly') return texts.summaryWeekly;
    if (summaryLevel === 'monthly') return texts.summaryMonthly;
    return '';
  }

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-3">Loading report tool...</p></div>;
  }
   if (error && !reportData) { // Show general error if data loading failed and no report is shown
    return (
      <div className="text-center py-10">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
        <p className="text-xl text-destructive">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4">Retry</Button>
      </div>
    );
  }


  return (
    <div className="space-y-6">
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center"><FileText className="mr-2 h-6 w-6 text-primary" />{texts.title}</CardTitle>
          <CardDescription>{texts.configureAndGenerateReports}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <Label htmlFor="date-range" className="font-semibold">{texts.dateRangeLabel}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date-range"
                    variant={"outline"}
                    className={("w-full justify-start text-left font-normal mt-1")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "LLL dd, y", { locale: currentLocale })} -{" "}
                          {format(dateRange.to, "LLL dd, y", { locale: currentLocale })}
                        </>
                      ) : (
                        format(dateRange.from, "LLL dd, y", { locale: currentLocale })
                      )
                    ) : (
                      <span>{texts.pickDateRange}</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    locale={currentLocale}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label htmlFor="summary-level" className="font-semibold">{texts.summaryLevelLabel}</Label>
              <Select value={summaryLevel} onValueChange={(value) => setSummaryLevel(value as SummaryLevel)}>
                <SelectTrigger id="summary-level" className="mt-1">
                  <SelectValue placeholder={texts.summaryNone} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{texts.summaryNone}</SelectItem>
                  <SelectItem value="daily">{texts.summaryDaily}</SelectItem>
                  <SelectItem value="weekly">{texts.summaryWeekly}</SelectItem>
                  <SelectItem value="monthly">{texts.summaryMonthly}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editorial-filter" className="font-semibold">{texts.editorialFilterLabel}</Label>
              <Select value={selectedEditorialId} onValueChange={setSelectedEditorialId}>
                <SelectTrigger id="editorial-filter" className="mt-1">
                  <Building2 className="mr-2 h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder={texts.allEditorials} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{texts.allEditorials}</SelectItem>
                  {editorialsList.map(editorial => (
                    <SelectItem key={editorial.id} value={String(editorial.id)}>{editorial.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateReport} disabled={isGenerating} size="lg">
            {isGenerating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <FileText className="mr-2 h-5 w-5" />}
            {isGenerating ? texts.generatingReport : texts.generateReportButton}
          </Button>
        </CardFooter>
      </Card>

      {isGenerating && (
         <div className="flex justify-center items-center py-10">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="ml-3 text-muted-foreground">{texts.generatingReport}</p>
        </div>
      )}

      {error && reportData === null && !isGenerating && ( // Specific error during report generation
        <div className="text-center py-10">
            <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
            <p className="text-xl text-destructive">{error}</p>
        </div>
      )}


      {reportData && !isGenerating && (
        <Card className="shadow-xl rounded-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">
                {texts.reportSectionTitle
                    .replace('{startDate}', reportData.reportDateRange.from)
                    .replace('{endDate}', reportData.reportDateRange.to)}
                {reportData.filteredByEditorialName && (
                    <span className="block text-lg font-normal text-muted-foreground">
                        ({texts.editorial}: {reportData.filteredByEditorialName})
                    </span>
                )}
            </CardTitle>
            <div className="flex gap-2 mt-2">
              <Button variant="outline" size="sm" onClick={() => handleExport('PDF')}><Download className="mr-2 h-4 w-4" />{texts.exportPDFButton}</Button>
              <Button variant="outline" size="sm" onClick={() => handleExport('Excel')}><Download className="mr-2 h-4 w-4" />{texts.exportExcelButton}</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {reportData.totalOrders === 0 && (!reportData.periodicSummary || reportData.periodicSummary.length === 0) ? (
                <div className="text-center py-10 text-muted-foreground">
                    <AlertTriangle className="mx-auto h-12 w-12 text-orange-400 mb-4" />
                    {texts.noDataForReport}
                </div>
            ) : (
              <>
                <Card>
                  <CardHeader><CardTitle>{texts.overallSummaryTitle}</CardTitle></CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{texts.totalSales}</p>
                      <p className="text-2xl font-bold">{formatCurrencyUYU(reportData.totalSalesAmount)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{texts.totalOrders}</p>
                      <p className="text-2xl font-bold">{reportData.totalOrders}</p>
                    </div>
                  </CardContent>
                </Card>

                {reportData.salesByPaymentMethod.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>{texts.salesByPaymentMethodTitle}</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader><TableRow><TableHead>{texts.paymentMethod}</TableHead><TableHead className="text-right"># {texts.totalOrders}</TableHead><TableHead className="text-right">{texts.totalSales}</TableHead></TableRow></TableHeader>
                        <TableBody>
                          {reportData.salesByPaymentMethod.map(item => (
                            <TableRow key={item.method}><TableCell className="capitalize">{(texts as any)[item.method.toLowerCase() as keyof typeof texts] || item.method}</TableCell><TableCell className="text-right">{item.count}</TableCell><TableCell className="text-right">{formatCurrencyUYU(item.amount)}</TableCell></TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                )}

                {reportData.salesByCategory.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>{texts.salesByBookCategoryTitle}</CardTitle></CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <Table>
                          <TableHeader><TableRow><TableHead>{texts.category}</TableHead><TableHead className="text-right">{texts.quantitySold}</TableHead><TableHead className="text-right">{texts.revenue}</TableHead></TableRow></TableHeader>
                          <TableBody>
                            {reportData.salesByCategory.map(item => (
                              <TableRow key={item.category}><TableCell>{item.category}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">{formatCurrencyUYU(item.amount)}</TableCell></TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
                
                {reportData.topSellingProducts.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>{texts.topSellingProductsTitle}</CardTitle></CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[200px]">
                        <Table>
                          <TableHeader><TableRow><TableHead>{texts.product}</TableHead><TableHead className="text-right">{texts.quantitySold}</TableHead><TableHead className="text-right">{texts.revenue}</TableHead></TableRow></TableHeader>
                          <TableBody>
                            {reportData.topSellingProducts.map(item => (
                              <TableRow key={item.title}><TableCell>{item.title}</TableCell><TableCell className="text-right">{item.quantity}</TableCell><TableCell className="text-right">{formatCurrencyUYU(item.revenue)}</TableCell></TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}

                {reportData.periodicSummary && reportData.periodicSummary.length > 0 && (
                  <Card>
                    <CardHeader><CardTitle>{texts.periodicSummaryTitle.replace('{periodType}', getSummaryPeriodType())}</CardTitle></CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <Table>
                          <TableHeader><TableRow><TableHead>{texts.period}</TableHead><TableHead className="text-right"># {texts.totalOrders}</TableHead><TableHead className="text-right">{texts.totalSales}</TableHead></TableRow></TableHeader>
                          <TableBody>
                            {reportData.periodicSummary.map(item => (
                              <TableRow key={item.period}><TableCell>{item.period}</TableCell><TableCell className="text-right">{item.orders}</TableCell><TableCell className="text-right">{formatCurrencyUYU(item.sales)}</TableCell></TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

