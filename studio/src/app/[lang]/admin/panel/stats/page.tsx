
import { Suspense } from 'react';
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types'; // SaleRecord removed
// Removed mock import: import { getSaleRecords } from '@/lib/mock-data';
import { Loader2 } from 'lucide-react';
import { StatsClient } from './components/stats-client';

interface AdminStatsPageProps {
  params: { lang: string };
}

export default async function AdminStatsPage({ params }: AdminStatsPageProps) {
  const { lang } = params;
  const dictionary: Dictionary = await getDictionary(lang);
  const statsTexts = dictionary.adminPanel?.statsPage || {
    title: "Sales Statistics",
    salesOverTimeTitle: "Sales Over Time",
    selectPeriod: "Select Period:",
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    totalSales: "Total Sales (UYU)",
    salesCount: "Number of Sales",
    noSalesData: "No sales data available for the selected period.",
    bestSellingCategoriesTitle: "Best-Selling Categories",
    category: "Category",
    unitsSold: "Units Sold",
    revenue: "Revenue (UYU)",
    totalRevenueTitle: "Total Revenue",
    selectDateRange: "Select Date Range:",
    startDate: "Start Date",
    endDate: "End Date",
    calculateRevenue: "Calculate Revenue",
    revenueForPeriod: "Revenue for {startDate} - {endDate}: UYU {amount}",
    noSalesInRange: "No sales in the selected date range.",
    monthlyComparisonTitle: "Monthly Sales Comparison",
    month: "Month",
    pickAStartDate: "Pick a start date",
    pickAnEndDate: "Pick an end date",
  };

  // initialSalesData is no longer fetched here; StatsClient fetches its own data.
  // const initialSalesData: SaleRecord[] = await getSaleRecords();

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">{statsTexts.title}</h1>
      <Suspense fallback={<div className="flex justify-center items-center min-h-[300px]"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div>}>
        <StatsClient
          // initialSales prop removed
          texts={statsTexts}
          lang={lang}
          dictionary={dictionary} 
        />
      </Suspense>
    </div>
  );
}
