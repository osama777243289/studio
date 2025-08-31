

import { getAccounts } from "./accounts";
import { getAllTransactions } from "./transactions";
import type { Account } from "@/components/chart-of-accounts/account-tree";
import { Timestamp } from "firebase/firestore";
import { startOfMonth, endOfMonth, subMonths, format, getDaysInMonth, getDate } from 'date-fns';
import { arSA } from 'date-fns/locale';

export interface TrialBalanceAccount extends Account {
    movementDebit: number;
    movementCredit: number;
    closingDebit: number;
    closingCredit: number;
    level: number;
}

export interface ReportAccount {
    id: string;
    code: string;
    name: string;
    balance: number;
    level: number;
}

export interface IncomeStatementData {
    revenues: ReportAccount[];
    totalRevenues: number;
    cogs: ReportAccount[];
    totalCogs: number;
    grossProfit: number;
    expenses: ReportAccount[];
    totalExpenses: number;
    netIncome: number;
}

export interface BalanceSheetData {
    assets: ReportAccount[];
    totalAssets: number;
    liabilities: ReportAccount[];
    totalLiabilities: number;
    equity: ReportAccount[];
    totalEquity: number;
    totalLiabilitiesAndEquity: number;
}

interface DailyAverageData {
    currentMonth: number;
    previousMonths: { month: string; average: number }[];
}

export interface DashboardSummary {
    dailyAverages: {
        totalRevenues: DailyAverageData;
        totalCOGS: DailyAverageData;
        grossProfit: DailyAverageData;
        totalOperatingExpenses: DailyAverageData;
        netIncome: DailyAverageData;
    };
    cashBalance: number;
    bankBalance: number;
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}


const calculateBalances = async (startDate?: Date, endDate?: Date): Promise<Map<string, { movementDebit: number; movementCredit: number }>> => {
    const transactions = await getAllTransactions();
    const balances = new Map<string, { movementDebit: number; movementCredit: number }>();
    
    const filteredTransactions = transactions.filter(tx => {
        const txDate = tx.date.toDate();
        if (startDate && txDate < startDate) return false;
        if (endDate && txDate > endDate) return false;
        return true;
    });

    for (const tx of filteredTransactions) {
        if (!tx.accountId) continue;
        const current = balances.get(tx.accountId) || { movementDebit: 0, movementCredit: 0 };
        if (tx.amount > 0) {
            current.movementDebit += tx.amount;
        } else {
            current.movementCredit += Math.abs(tx.amount);
        }
        balances.set(tx.accountId, current);
    }
    
    return balances;
};

const processAccountsForReports = async (asTree: boolean = false, startDate?: Date, endDate?: Date): Promise<TrialBalanceAccount[]> => {
    const accountTree = await getAccounts();
    const balances = await calculateBalances(startDate, endDate);
    const processedAccountsMap = new Map<string, TrialBalanceAccount>();

    const traverse = (accounts: Account[], level: number): { totalMovementDebit: number; totalMovementCredit: number } => {
        let levelMovementDebit = 0;
        let levelMovementCredit = 0;

        for (const acc of accounts) {
            let movementDebit = 0;
            let movementCredit = 0;
            let children: TrialBalanceAccount[] = [];

            if (acc.children && acc.children.length > 0) {
                const childTotals = traverse(acc.children, level + 1);
                movementDebit = childTotals.totalMovementDebit;
                movementCredit = childTotals.totalMovementCredit;
                if (asTree) {
                    children = acc.children.map(child => processedAccountsMap.get(child.id)!);
                }
            } else {
                const balance = balances.get(acc.id) || { movementDebit: 0, movementCredit: 0 };
                movementDebit = balance.movementDebit;
                movementCredit = balance.movementCredit;
            }

            const balance = movementDebit - movementCredit;
            
            const processedAccount: TrialBalanceAccount = {
                ...acc,
                movementDebit,
                movementCredit,
                closingDebit: balance > 0 ? balance : 0,
                closingCredit: balance < 0 ? Math.abs(balance) : 0,
                level,
                children: children.length > 0 ? children : undefined,
            };
            processedAccountsMap.set(acc.id, processedAccount);

            levelMovementDebit += movementDebit;
            levelMovementCredit += movementCredit;
        }

        return { totalMovementDebit: levelMovementDebit, totalMovementCredit: levelMovementCredit };
    };

    traverse(accountTree, 1);
    
    if (asTree) {
        const rootAccounts = accountTree.map(acc => processedAccountsMap.get(acc.id)!);
         const sortOrder = ['1', '2', '3', '5', '4']; // Assets, Liab, Equity, Exp, Rev
         rootAccounts.sort((a, b) => {
            const aIndex = sortOrder.indexOf(a.code);
            const bIndex = sortOrder.indexOf(b.code);
            return aIndex - bIndex;
        });
        return rootAccounts;
    }

    const flatList = Array.from(processedAccountsMap.values());
    flatList.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

    return flatList;
}

export const getTrialBalanceData = async (asTree: boolean = false): Promise<TrialBalanceAccount[]> => {
    return await processAccountsForReports(asTree);
}

const getReportAccounts = (allAccounts: TrialBalanceAccount[], group: Account['group']): ReportAccount[] => {
    return allAccounts
        .filter(acc => acc.group === group)
        .map(acc => {
            const balance = acc.type === 'Debit' ? acc.closingDebit - acc.closingCredit : acc.closingCredit - acc.closingDebit;
            return {
                id: acc.id,
                code: acc.code,
                name: acc.name,
                balance: balance,
                level: acc.level,
            };
        });
};


export const getIncomeStatementData = async (): Promise<IncomeStatementData> => {
    const allAccounts = await processAccountsForReports();

    const revenues = getReportAccounts(allAccounts, 'Revenues').filter(a => a.level > 1);
    const expensesWithCogs = getReportAccounts(allAccounts, 'Expenses').filter(a => a.level > 1);
    
    const cogs = expensesWithCogs.filter(e => e.code.startsWith('51'));
    const expenses = expensesWithCogs.filter(e => !e.code.startsWith('51'));

    const totalRevenues = getReportAccounts(allAccounts, 'Revenues').find(a => a.level === 1)?.balance || 0;
    const totalCogs = cogs.find(e => e.code === '51')?.balance || 0;
    const totalExpenses = expenses.reduce((sum, acc) => (acc.level === 2 ? sum + acc.balance : sum), 0);


    const grossProfit = totalRevenues - totalCogs;
    const netIncome = grossProfit - totalExpenses;
    
    return {
        revenues: revenues.filter(r => r.code !== '4'),
        totalRevenues,
        cogs: cogs.filter(c => c.code !== '51'),
        totalCogs,
        grossProfit,
        expenses: expenses,
        totalExpenses,
        netIncome,
    };
}


export const getBalanceSheetData = async (): Promise<BalanceSheetData> => {
    const allAccounts = await processAccountsForReports();
    const incomeStatement = await getIncomeStatementData();

    const assets = getReportAccounts(allAccounts, 'Assets').filter(a => a.level > 1);
    const liabilities = getReportAccounts(allAccounts, 'Liabilities').filter(a => a.level > 1);
    const equityAccounts = getReportAccounts(allAccounts, 'Equity').filter(a => a.level > 1);

    const retainedEarnings: ReportAccount = {
        id: 'retained-earnings',
        code: '3999',
        name: 'الأرباح (الخسائر) الحالية',
        balance: incomeStatement.netIncome,
        level: 2
    };

    const equity = [...equityAccounts, retainedEarnings];

    const totalAssets = getReportAccounts(allAccounts, 'Assets').find(a => a.level === 1)?.balance || 0;
    const totalLiabilities = getReportAccounts(allAccounts, 'Liabilities').find(a => a.level === 1)?.balance || 0;
    const totalEquityFromAccounts = getReportAccounts(allAccounts, 'Equity').find(a => a.level === 1)?.balance || 0;
    
    const totalEquity = totalEquityFromAccounts + incomeStatement.netIncome;

    return {
        assets,
        totalAssets,
        liabilities,
        totalLiabilities,
        equity,
        totalEquity,
        totalLiabilitiesAndEquity: totalLiabilities + totalEquity
    };
};

const getMonthlyMetrics = async (startDate: Date, endDate: Date) => {
    const accounts = await processAccountsForReports(false, startDate, endDate);
    
    const getBalanceForGroup = (group: Account['group']) => {
        const rootAccount = accounts.find(a => a.group === group && a.level === 1);
        if (!rootAccount) return 0;
        return rootAccount.type === 'Credit' 
            ? rootAccount.closingCredit - rootAccount.closingDebit 
            : rootAccount.closingDebit - rootAccount.closingCredit;
    };
    
    // إجمالي الإيرادات من الحساب الرئيسي للإيرادات (شامل الضريبة)
    const totalRevenuesWithVat = getBalanceForGroup('Revenues');
    // إجمالي الإيرادات الصافية (بعد خصم ضريبة القيمة المضافة)
    const totalRevenues = totalRevenuesWithVat / 1.15;
    
    const expensesWithCogs = accounts.filter(a => a.group === 'Expenses');
    const totalCOGS = expensesWithCogs.find(e => e.code === '51')?.closingDebit || 0;
    
    const totalOperatingExpenses = expensesWithCogs
      .filter(e => !e.code.startsWith('51') && e.level === 2)
      .reduce((sum, acc) => sum + acc.closingDebit, 0);
      
    const grossProfit = totalRevenues - totalCOGS;
    const netIncome = grossProfit - totalOperatingExpenses;
    
    return { totalRevenues, totalCOGS, grossProfit, totalOperatingExpenses, netIncome };
}


export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const now = new Date();
    const metrics: { [key: string]: Awaited<ReturnType<typeof getMonthlyMetrics>> } = {};
    const dailyAverages: DashboardSummary['dailyAverages'] = {
        totalRevenues: { currentMonth: 0, previousMonths: [] },
        totalCOGS: { currentMonth: 0, previousMonths: [] },
        grossProfit: { currentMonth: 0, previousMonths: [] },
        totalOperatingExpenses: { currentMonth: 0, previousMonths: [] },
        netIncome: { currentMonth: 0, previousMonths: [] },
    };

    // Calculate metrics for the current month and the last 3 months
    for (let i = 0; i < 4; i++) {
        const date = subMonths(now, i);
        const startDate = startOfMonth(date);
        const endDate = endOfMonth(date);
        const monthKey = format(date, 'yyyy-MM');
        
        metrics[monthKey] = await getMonthlyMetrics(startDate, endDate);

        const isCurrentMonth = i === 0;
        const daysInMonth = isCurrentMonth ? getDate(now) : getDaysInMonth(date);
        const monthName = format(date, 'LLLL', { locale: arSA });

        const calculateAverages = (metricKey: keyof DashboardSummary['dailyAverages']) => {
            const total = metrics[monthKey][metricKey];
            const average = daysInMonth > 0 ? total / daysInMonth : 0;
            if (isCurrentMonth) {
                dailyAverages[metricKey].currentMonth = average;
            } else {
                dailyAverages[metricKey].previousMonths.push({ month: monthName, average: average });
            }
        };

        (Object.keys(dailyAverages) as (keyof typeof dailyAverages)[]).forEach(calculateAverages);
    }

    // Get balances (point-in-time, not monthly)
    const allTimeAccounts = await processAccountsForReports(false);
    const cashAccounts = allTimeAccounts.filter(acc => acc.level === 4 && acc.classifications?.includes('صندوق'));
    const bankAccounts = allTimeAccounts.filter(acc => acc.level === 4 && acc.classifications?.includes('بنك'));
    const cashBalance = cashAccounts.reduce((sum, acc) => sum + (acc.closingDebit - acc.closingCredit), 0);
    const bankBalance = bankAccounts.reduce((sum, acc) => sum + (acc.closingDebit - acc.closingCredit), 0);

    return {
        dailyAverages,
        cashBalance,
        bankBalance,
    };
};

export const getMonthlyChartData = async (): Promise<MonthlyData[]> => {
    const allTransactions = await getAllTransactions();
    const accountTree = await getAccounts();

    const revenueAccountIds = new Set<string>();
    const expenseAccountIds = new Set<string>();

    const findAccountsByGroup = (accounts: Account[], group: Account['group'], idSet: Set<string>) => {
        accounts.forEach(acc => {
            if (acc.group === group) {
                const traverse = (subAcc: Account) => {
                    idSet.add(subAcc.id);
                    if (subAcc.children) {
                        subAcc.children.forEach(traverse);
                    }
                };
                traverse(acc);
            }
        });
    };

    findAccountsByGroup(accountTree, 'Revenues', revenueAccountIds);
    findAccountsByGroup(accountTree, 'Expenses', expenseAccountIds);

    const monthlyData: { [key: string]: { income: number; expenses: number } } = {};
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = subMonths(now, i);
        const monthKey = format(date, 'yyyy-MM');
        monthlyData[monthKey] = { income: 0, expenses: 0 };
    }

    allTransactions.forEach(tx => {
        const monthKey = format(tx.date.toDate(), 'yyyy-MM');
        if (monthlyData[monthKey]) {
            if (revenueAccountIds.has(tx.accountId)) {
                monthlyData[monthKey].income += Math.abs(tx.amount); 
            } else if (expenseAccountIds.has(tx.accountId)) {
                monthlyData[monthKey].expenses += Math.abs(tx.amount);
            }
        }
    });
    
    return Object.entries(monthlyData).map(([key, value]) => {
         const monthName = format(new Date(`${key}-01`), 'MMM', { locale: arSA });
         return {
            month: monthName,
            ...value
         }
    });
};
