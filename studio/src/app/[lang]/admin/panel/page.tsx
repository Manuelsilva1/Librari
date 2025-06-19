
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCopy, PlusCircle, LineChart, Users } from "lucide-react";
import Link from "next/link";
import { getDictionary } from '@/lib/dictionaries';
import type { Dictionary } from '@/types'; // Updated import

interface AdminDashboardPageProps {
  params: any;
}

export default async function AdminDashboardPage({ params: { lang } }: AdminDashboardPageProps) {
  const dictionary = await getDictionary(lang);
  const texts = dictionary.adminPanel?.dashboardPage || {
    title: "Admin Dashboard",
    manageBooksCard: { title: "Manage Books", booksCount: "{count} Books", inCatalog: "in catalog", viewBooksButton: "View Books"},
    totalSalesCard: { title: "Total Sales", amount: "${amount}", fromLastMonth: "+{percentage}% from last month", viewReportButton: "View Sales Report"},
    registeredUsersCard: { title: "Registered Users", usersCount: "{count}", newThisWeek: "+{count} new this week", manageUsersButton: "Manage Users"},
    quickActionsCard: { title: "Quick Actions", addNewBookButton: "Add New Book", generateReportButton: "Generate Sales Report", viewLogsButton: "View System Logs"},
  };
  // Placeholder data
  const bookCount = 125;
  const totalSalesAmount = "1,234.56";
  const salesPercentage = "10.2";
  const userCount = 78;
  const newUsersThisWeek = 5;

  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">{texts.title}</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium font-headline">{texts.manageBooksCard.title}</CardTitle>
            <BookCopy className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{texts.manageBooksCard.booksCount.replace('{count}', bookCount.toString())}</div>
            <p className="text-xs text-muted-foreground">
              {texts.manageBooksCard.inCatalog}
            </p>
          </CardContent>
          <CardContent>
             <Link href={`/${lang}/admin/panel/books`} passHref legacyBehavior>
                <Button className="w-full">{texts.manageBooksCard.viewBooksButton}</Button>
             </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium font-headline">{texts.totalSalesCard.title}</CardTitle>
            <LineChart className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{texts.totalSalesCard.amount.replace('{amount}', totalSalesAmount)}</div>
            <p className="text-xs text-muted-foreground">
              {texts.totalSalesCard.fromLastMonth.replace('{percentage}', salesPercentage)}
            </p>
          </CardContent>
           <CardContent>
             <Button className="w-full" variant="outline" disabled>{texts.totalSalesCard.viewReportButton}</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium font-headline">{texts.registeredUsersCard.title}</CardTitle>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{texts.registeredUsersCard.usersCount.replace('{count}', userCount.toString())}</div>
            <p className="text-xs text-muted-foreground">
              {texts.registeredUsersCard.newThisWeek.replace('{count}', newUsersThisWeek.toString())}
            </p>
          </CardContent>
           <CardContent>
             <Button className="w-full" variant="outline" disabled>{texts.registeredUsersCard.manageUsersButton}</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="font-headline">{texts.quickActionsCard.title}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href={`/${lang}/admin/panel/books?action=add`} passHref legacyBehavior>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> {texts.quickActionsCard.addNewBookButton}
            </Button>
          </Link>
          <Button variant="outline" disabled>
            {texts.quickActionsCard.generateReportButton}
          </Button>
          <Button variant="outline" disabled>
            {texts.quickActionsCard.viewLogsButton}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

