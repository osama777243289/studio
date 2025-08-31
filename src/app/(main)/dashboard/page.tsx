
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, CreditCard, TrendingUp, TrendingDown, Loader2, ArrowUp, ArrowDown, ClipboardList, PackageMinus, Wallet, ShoppingCart, Activity, Landmark } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { Transaction } from "@/lib/firebase/firestore/transactions";
import { getRecentTransactions } from "@/lib/firebase/firestore/transactions";
import { getAccounts } from "@/lib/firebase/firestore/accounts";
import { Account } from "@/components/chart-of-accounts/account-tree";
import { Skeleton } from '@/components/ui/skeleton';
import { getDashboardSummary, type DashboardSummary } from '@/lib/firebase/firestore/reports';
import { cn } from '@/lib/utils';
import { arSA } from 'date-fns/locale';
import { format } from 'date-fns';

// Helper to create a map of account IDs to names
const createAccountMap = (accounts: Account[]): Map<string, string> => {
    const accountMap = new Map<string, string>();
    const traverse = (accs: Account[]) => {
        for (const acc of accs) {
            accountMap.set(acc.id, acc.name);
            if (acc.children) {
                traverse(acc.children);
            }
        }
    };
    traverse(accounts);
    return accountMap;
};

interface TransactionWithAccountName extends Transaction {
    accountName: string;
}

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', { style: 'currency', currency: 'SAR' }).format(amount);
};


export default function DashboardPage() {
  const [transactions, setTransactions] = useState<TransactionWithAccountName[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [recentTransactions, allAccounts, dashboardSummary] = await Promise.all([
                getRecentTransactions(),
                getAccounts(),
                getDashboardSummary()
            ]);

            const accountMap = createAccountMap(allAccounts);

            const transactionsWithNames = recentTransactions.map(tx => ({
                ...tx,
                accountName: accountMap.get(tx.accountId) || 'حساب غير معروف'
            }));

            setTransactions(transactionsWithNames);
            setSummary(dashboardSummary);

        } catch (error: any) {
            console.error("Failed to fetch dashboard data:", error);
            setError("فشل الاتصال بـ Firestore. التطبيق يعمل الآن في وضع العرض التوضيحي.");
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    fetchData();
  }, []);

  if (error) {
     return (
        <div className="flex justify-center items-center h-full">
             <Card className="w-full max-w-lg">
                <CardHeader>
                    <CardTitle>خطأ في الاتصال - وضع العرض التوضيحي</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>{error}</p>
                    <p className="mt-4">لن يتم حفظ أي تغييرات. يرجى التحقق من إعدادات مشروع Firebase الخاص بك.</p>
                </CardContent>
            </Card>
        </div>
     )
  }

  const SummaryCard = ({ title, data, icon: Icon, isLoading }: { title: string, data: DashboardSummary['dailyAverages']['netIncome'], icon: React.ElementType, isLoading: boolean }) => {
    const hasData = data && data.currentMonth !== undefined;
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-1/3" />
                    </div>
                ) : (
                   <>
                    <div className="text-2xl font-bold">{hasData ? formatCurrency(data.currentMonth) : formatCurrency(0)}</div>
                     <p className="text-xs text-muted-foreground">
                        المتوسط اليومي للشهر الحالي
                    </p>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                        {hasData && data.previousMonths.map(item => (
                            <div key={item.month} className="flex justify-between">
                                <span>{item.month}</span>
                                <span>{formatCurrency(item.average)}</span>
                            </div>
                        ))}
                    </div>
                   </>
                )}
            </CardContent>
        </Card>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        <SummaryCard title="إجمالي المبيعات" data={summary?.dailyAverages.totalRevenues} icon={TrendingUp} isLoading={loading} />
        <SummaryCard title="تكلفة المبيعات" data={summary?.dailyAverages.totalCOGS} icon={TrendingDown} isLoading={loading} />
        <SummaryCard title="مجمل الربح" data={summary?.dailyAverages.grossProfit} icon={Wallet} isLoading={loading} />
        <SummaryCard title="المصروفات التشغيلية" data={summary?.dailyAverages.totalOperatingExpenses} icon={PackageMinus} isLoading={loading} />
        <SummaryCard title="صافي الربح" data={summary?.dailyAverages.netIncome} icon={DollarSign} isLoading={loading} />
        
        {/* Balances are point-in-time, so they don't have daily averages */}
         <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">رصيد الصناديق</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-3/4" />
                ) : (
                    <div className="text-2xl font-bold">{formatCurrency(summary?.cashBalance || 0)}</div>
                )}
            </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">رصيد البنوك</CardTitle>
                <Landmark className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <Skeleton className="h-8 w-3/4" />
                ) : (
                    <div className="text-2xl font-bold">{formatCurrency(summary?.bankBalance || 0)}</div>
                )}
            </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="font-headline">نظرة عامة</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="font-headline">المعاملات الأخيرة</CardTitle>
            <CardDescription>
              {loading ? 'جاري تحميل المعاملات...' : `آخر ${transactions.length} معاملات مسجلة.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
                <div className="space-y-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex items-center">
                            <div className="mr-4 space-y-2">
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-3 w-[100px]" />
                            </div>
                            <div className="mr-auto">
                                <Skeleton className="h-6 w-[80px]" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <RecentTransactions transactions={transactions} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

    
