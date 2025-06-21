
"use client";

import { useState, useMemo, useEffect } from 'react';
// Make sure Sale is imported, not SaleRecord if types were updated
import type { Sale, Dictionary } from '@/types'; 
import {
  startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  format, parseISO, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval,
  isWithinInterval, subMonths, getMonth, getYear,
} from 'date-fns';
import { es as esLocale, enUS as enLocale } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, DollarSign, TrendingUp, ShoppingBag, Filter, Loader2 } from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle } from '@/components/ui/chart';
import { Bar, BarChart, Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import type { ChartConfig } from '@/components/ui/chart';
import type { DateRange } from "react-day-picker";
// Assuming getAdminSales is the correct function to fetch sales data
import { getAdminSales as apiGetAdminSales } from '@/services/api';
import type { ApiResponseError } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface StatsClientProps {
  // initialSales prop is removed, data will be fetched client-side
  texts: Dictionary['adminPanel']['statsPage'];
  lang: string;
  dictionary: Dictionary;
}

type SalesPeriod = 'daily' | 'weekly' | 'monthly';

interface ProcessedSalesData {
  chartKey: string; 
  displayLabel: string; 
  totalSales: number;
  count: number;
}

interface ProductCategorySalesData {
  // Categoria ID will be used as key, but display name would be better if available
  categoriaId: string; 
  unitsSold: number;
  revenue: number;
}

const dateLocales: { [key: string]: Locale } = {
  en: enLocale,
  es: esLocale,
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D'];

export function StatsClient({ texts, lang, dictionary }: StatsClientProps) {
  const { toast } = useToast();
  const [allSalesData, setAllSalesData] = useState<Sale[]>([]); // Store all fetched sales
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [salesPeriod, setSalesPeriod] = useState<SalesPeriod>('daily');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  
  useEffect(() => {
    // Initialize dateRange here to ensure it's only on client
    const end = new Date();
    const start = subMonths(end, 1);
    setDateRange({ from: start, to: end });

    async function initialLoad() {
      setIsLoading(true);
      setError(null);
      try {
        const salesApiData = await apiGetAdminSales();
        setAllSalesData(salesApiData);
      } catch (err) {
        const apiError = err as ApiResponseError;
        setError(apiError.message || "Failed to load sales statistics.");
        toast({ title: "Error", description: apiError.message || "Failed to load sales statistics.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    initialLoad();
  }, [toast]);


  const currentLocale = dateLocales[lang] || enLocale;
  
  const salesInDateRange = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return [];
    return allSalesData.filter(sale => {
        const saleDate = parseISO(sale.fecha); // Use 'fecha' from Sale type
        return isWithinInterval(saleDate, { start: startOfDay(dateRange.from!), end: endOfDay(dateRange.to!) });
    });
  }, [allSalesData, dateRange]);

  const totalRevenueInDateRange = useMemo(() => {
    return salesInDateRange.reduce((sum, sale) => sum + sale.total, 0); // Use 'total' from Sale type
  }, [salesInDateRange]);


  const salesOverTimeChartData = useMemo(() => {
    if (!salesInDateRange.length) return [];
    const aggregatedSales: { [key: string]: { totalSales: number, count: number } } = {};

    salesInDateRange.forEach(sale => {
      const saleDate = parseISO(sale.fecha); // Use 'fecha'
      let currentChartKey = ''; 

      if (salesPeriod === 'daily') {
        currentChartKey = format(saleDate, 'yyyy-MM-dd');
      } else if (salesPeriod === 'weekly') {
        currentChartKey = format(startOfWeek(saleDate, { locale: currentLocale }), 'yyyy-MM-dd');
      } else if (salesPeriod === 'monthly') {
        currentChartKey = format(saleDate, 'yyyy-MM');
      }

      if (!aggregatedSales[currentChartKey]) {
        aggregatedSales[currentChartKey] = { totalSales: 0, count: 0 };
      }
      aggregatedSales[currentChartKey].totalSales += sale.total; // Use 'total'
      aggregatedSales[currentChartKey].count += 1;
    });
    
    const dataPoints: ProcessedSalesData[] = Object.entries(aggregatedSales)
      .map(([key, { totalSales, count }]) => {
        let currentDisplayLabel = '';
        if (salesPeriod === 'monthly') { 
          currentDisplayLabel = format(parseISO(key + '-01'), 'MMM yyyy', { locale: currentLocale });
        } else { 
          currentDisplayLabel = format(parseISO(key), 'P', { locale: currentLocale }); 
        }
        return {
          chartKey: key, 
          displayLabel: currentDisplayLabel,
          totalSales,
          count,
        };
      })
      .sort((a, b) => {
        const dateA = (salesPeriod === 'monthly' ? parseISO(a.chartKey + '-01') : parseISO(a.chartKey));
        const dateB = (salesPeriod === 'monthly' ? parseISO(b.chartKey + '-01') : parseISO(b.chartKey));
        return dateA.getTime() - dateB.getTime();
      });

    return dataPoints;
  }, [salesInDateRange, salesPeriod, currentLocale]);

  const salesOverTimeChartConfig = {
    totalSales: { label: texts.totalSales, color: "hsl(var(--chart-1))" },
    count: { label: texts.salesCount, color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  const bestSellingCategoriesData = useMemo(() => {
    if (!salesInDateRange.length) return [];
    const categorySales: { [key: string]: { unitsSold: number, revenue: number } } = {};

    salesInDateRange.forEach(sale => {
      sale.items.forEach(item => {
        // Assuming item.libro.categoriaId is available.
        // If item.libro is not populated, this needs adjustment or fetching book details.
        const categoriaId = item.libro?.categoriaId ? String(item.libro.categoriaId) : 'N/A';
        if (!categorySales[categoriaId]) {
          categorySales[categoriaId] = { unitsSold: 0, revenue: 0 };
        }
        categorySales[categoriaId].unitsSold += item.cantidad; // Use 'cantidad'
        categorySales[categoriaId].revenue += item.precioUnitario * item.cantidad; // Use 'precioUnitario' and 'cantidad'
      });
    });
    
    return Object.entries(categorySales)
      .map(([catId, data]) => ({ categoriaId: catId, ...data })) // Use categoriaId
      .sort((a, b) => b.unitsSold - a.unitsSold) 
      .slice(0, 10); 
  }, [salesInDateRange]);

  const bestSellingCategoriesChartConfig = {
    unitsSold: { label: texts.unitsSold, color: "hsl(var(--chart-1))" },
    revenue: { label: texts.revenue, color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;
  
  const monthlyComparisonData = useMemo(() => {
    // Use allSalesData for a broader comparison, not just dateRange filtered.
    if (!allSalesData.length) return [];
    const monthlyData: { [key: string]: number } = {};
    const monthNames = dictionary.adminPanel.salesPage.months; // Path might be different

    allSalesData.forEach(sale => {
      const saleDate = parseISO(sale.fecha); // Use 'fecha'
      const monthYearKey = format(saleDate, 'yyyy-MM', { locale: currentLocale });
      if (!monthlyData[monthYearKey]) {
        monthlyData[monthYearKey] = 0;
      }
      monthlyData[monthYearKey] += sale.total; // Use 'total'
    });

    return Object.entries(monthlyData)
      .map(([key, totalSales]) => {
        const [year, monthNum] = key.split('-');
        const monthIndex = parseInt(monthNum, 10) -1;
        // Ensure monthNames has the correct structure
        const monthName = (monthNames as any)[Object.keys(monthNames)[monthIndex] as keyof typeof monthNames] || `Month ${monthNum}`;
        return {
          month: `${monthName} ${year}`,
          totalSales,
        };
      })
      .sort((a,b) => {
         const [aMonthName, aYear] = a.month.split(' ');
         const [bMonthName, bYear] = b.month.split(' ');
         const aMonthIndex = Object.values(monthNames).indexOf(aMonthName);
         const bMonthIndex = Object.values(monthNames).indexOf(bMonthName);
         return new Date(parseInt(aYear), aMonthIndex).getTime() - new Date(parseInt(bYear), bMonthIndex).getTime();
      });
  }, [allSalesData, currentLocale, dictionary.adminPanel.salesPage.months]);

  const monthlyComparisonChartConfig = {
    totalSales: { label: texts.totalSales, color: "hsl(var(--chart-3))" },
  } satisfies ChartConfig;


  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /><p className="ml-3">Loading statistics...</p></div>;
  }
  if (error) {
    return <div className="text-center py-10 text-red-500"><p>{error}</p><Button onClick={() => window.location.reload()} className="mt-4">Retry</Button></div>;
  }

  return (
    <div className="grid gap-6">
      {/* Date Range Filter for overall stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><Filter className="mr-2 h-5 w-5 text-primary"/>{texts.selectDateRange}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={("w-full md:w-[280px] justify-start text-left font-normal")}
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
                    <span>{texts.pickAStartDate}</span>
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
            {/* Calculate button removed as revenue is now a useMemo derived value */}
        </CardContent>
         {dateRange?.from && dateRange?.to && (
            <CardFooter>
                <p className="text-lg font-semibold text-primary">
                {texts.revenueForPeriod
                    .replace('{startDate}', format(dateRange.from, "P", { locale: currentLocale }))
                    .replace('{endDate}', format(dateRange.to, "P", { locale: currentLocale }))
                    .replace('{amount}', totalRevenueInDateRange.toFixed(2))
                }
                </p>
            </CardFooter>
        )}
      </Card>

      {/* Sales Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary"/>{texts.salesOverTimeTitle}</CardTitle>
          <Tabs value={salesPeriod} onValueChange={(value) => setSalesPeriod(value as SalesPeriod)} className="mt-2">
            <TabsList>
              <TabsTrigger value="daily">{texts.daily}</TabsTrigger>
              <TabsTrigger value="weekly">{texts.weekly}</TabsTrigger>
              <TabsTrigger value="monthly">{texts.monthly}</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="h-[350px] -ml-4">
          {salesOverTimeChartData.length > 0 ? (
            <ChartContainer config={salesOverTimeChartConfig} className="w-full h-full">
              <LineChart data={salesOverTimeChartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                <XAxis
                  dataKey="chartKey" 
                  tickFormatter={(tick: string) => { 
                    if (salesPeriod === 'monthly') { 
                      return format(parseISO(tick + '-01'), 'MMM yyyy', { locale: currentLocale });
                    } else { 
                      return format(parseISO(tick), 'dd MMM', { locale: currentLocale });
                    }
                  }}
                />
                <YAxis yAxisId="left" stroke="hsl(var(--chart-1))" />
                <YAxis yAxisId="right" orientation="right" stroke="hsl(var(--chart-2))" />
                <ChartTooltip
                  content={<ChartTooltipContent
                    labelFormatter={(value, payload) => { 
                      const point = payload && payload.length > 0 ? payload[0].payload as ProcessedSalesData : null;
                      return point ? point.displayLabel : String(value);
                    }}
                  />}
                />
                <ChartLegend content={<ChartLegendContent />} />
                <Line yAxisId="left" type="monotone" dataKey="totalSales" stroke="hsl(var(--chart-1))" strokeWidth={2} dot={false} name={texts.totalSales} />
                <Line yAxisId="right" type="monotone" dataKey="count" stroke="hsl(var(--chart-2))" strokeWidth={2} dot={false} name={texts.salesCount} />
              </LineChart>
            </ChartContainer>
          ) : (
            <p className="text-center text-muted-foreground py-10">{texts.noSalesData}</p>
          )}
        </CardContent>
      </Card>

      {/* Best-Selling Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center"><ShoppingBag className="mr-2 h-5 w-5 text-primary"/>{texts.bestSellingCategoriesTitle}</CardTitle>
          <CardDescription>{texts.category} vs {texts.unitsSold} & {texts.revenue}</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] -ml-4">
          {bestSellingCategoriesData.length > 0 ? (
          <ChartContainer config={bestSellingCategoriesChartConfig} className="w-full h-full">
            <BarChart data={bestSellingCategoriesData} layout="vertical" margin={{ top: 5, right: 30, left: 50, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" />
              <YAxis dataKey="categoriaId" type="category" width={100} tick={{fontSize: 12}}/>
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="unitsSold" fill="hsl(var(--chart-1))" name={texts.unitsSold} radius={[0, 4, 4, 0]} />
              <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name={texts.revenue} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ChartContainer>
          ) : (
            <p className="text-center text-muted-foreground py-10">{texts.noSalesData}</p>
          )}
        </CardContent>
      </Card>
      
      {/* Monthly Sales Comparison (uses allSalesData, not just dateRange) */}
      <Card>
        <CardHeader>
           <CardTitle className="flex items-center"><TrendingUp className="mr-2 h-5 w-5 text-primary"/>{texts.monthlyComparisonTitle}</CardTitle>
        </CardHeader>
        <CardContent className="h-[350px] -ml-4">
          {monthlyComparisonData.length > 0 ? (
          <ChartContainer config={monthlyComparisonChartConfig} className="w-full h-full">
            <BarChart data={monthlyComparisonData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false}/>
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="totalSales" fill="hsl(var(--chart-3))" name={texts.totalSales} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
          ) : (
             <p className="text-center text-muted-foreground py-10">{texts.noSalesData}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

