import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookCopy, PlusCircle, LineChart, Users } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <h1 className="font-headline text-3xl font-bold text-primary">Admin Dashboard</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium font-headline">Manage Books</CardTitle>
            <BookCopy className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">125 Books</div>
            <p className="text-xs text-muted-foreground">
              in catalog
            </p>
          </CardContent>
          <CardContent>
             <Link href="/admin/books" passHref legacyBehavior>
                <Button className="w-full">View Books</Button>
             </Link>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium font-headline">Total Sales</CardTitle>
            <LineChart className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,234.56</div>
            <p className="text-xs text-muted-foreground">
              +10.2% from last month
            </p>
          </CardContent>
           <CardContent>
             <Button className="w-full" variant="outline" disabled>View Sales Report</Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-medium font-headline">Registered Users</CardTitle>
            <Users className="h-6 w-6 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78</div>
            <p className="text-xs text-muted-foreground">
              +5 new this week
            </p>
          </CardContent>
           <CardContent>
             <Button className="w-full" variant="outline" disabled>Manage Users</Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="font-headline">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Link href="/admin/books?action=add" passHref legacyBehavior>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Book
            </Button>
          </Link>
          <Button variant="outline" disabled>
            Generate Sales Report
          </Button>
          <Button variant="outline" disabled>
            View System Logs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
