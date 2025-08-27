
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DollarSign, CreditCard, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import { OverviewChart } from "@/components/dashboard/overview-chart"
import { RecentTransactions } from "@/components/dashboard/recent-transactions"
import { Transaction } from "@/lib/firebase/firestore/transactions";
import { getRecentTransactions } from "@/lib/firebase/firestore/transactions";
import { getAccounts } from "@/lib/firebase/firestore/accounts";
import { Account } from "@/components/chart-of-accounts/account-tree";
import { Skeleton } from '@/components/ui/skeleton';

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

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<TransactionWithAccountName[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [recentTransactions, allAccounts] = await Promise.all([
                getRecentTransactions(),
                getAccounts()
            ]);

            const accountMap = createAccountMap(allAccounts);

            const transactionsWithNames = recentTransactions.map(tx => ({
                ...tx,
                accountName: accountMap.get(tx.accountId) || 'حساب غير معروف'
            }));

            setTransactions(transactionsWithNames);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الدخل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$21,876.33</div>
            <p className="text-xs text-muted-foreground">
              +12.4% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$23,355.56</div>
            <p className="text-xs text-muted-foreground">
              +31.3% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$102,942.00</div>
            <p className="text-xs text-muted-foreground">
              عبر جميع الحسابات
            </p>
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
