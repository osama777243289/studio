

import { getAccounts } from "./accounts";
import { getAllTransactions } from "./transactions";
import type { Account } from "@/components/chart-of-accounts/account-tree";
import { Timestamp } from "firebase/firestore";
import { startOfMonth, endOfMonth, subMonths } from 'date-fns';

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

export interface DashboardSummary {
    totalRevenues: number;
    totalExpenses: number;
    netIncome: number;
    balance: number;
    revenueChange: number | null;
    expenseChange: number | null;
    netIncomeChange: number | null;
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

const calculatePercentageChange = (current: number, previous: number): number | null => {
    if (previous === 0) {
        return current > 0 ? 100.0 : 0.0; // Or null if you prefer not to show a percentage
    }
    return ((current - previous) / previous) * 100;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
    const now = new Date();
    const currentMonthStart = startOfMonth(now);
    const currentMonthEnd = endOfMonth(now);
    
    const prevMonth = subMonths(now, 1);
    const prevMonthStart = startOfMonth(prevMonth);
    const prevMonthEnd = endOfMonth(prevMonth);

    // Get data for all time for balance
    const allTimeAccounts = await processAccountsForReports(false);
    
    // Get data for current month
    const currentMonthAccounts = await processAccountsForReports(false, currentMonthStart, currentMonthEnd);

    // Get data for previous month
    const prevMonthAccounts = await processAccountsForReports(false, prevMonthStart, prevMonthEnd);

    const currentRevenues = Math.abs(getReportAccounts(currentMonthAccounts, 'Revenues').find(a => a.level === 1)?.balance || 0);
    const currentExpenses = getReportAccounts(currentMonthAccounts, 'Expenses').find(a => a.level === 1)?.balance || 0;
    const currentNetIncome = currentRevenues - currentExpenses;

    const prevRevenues = Math.abs(getReportAccounts(prevMonthAccounts, 'Revenues').find(a => a.level === 1)?.balance || 0);
    const prevExpenses = getReportAccounts(prevMonthAccounts, 'Expenses').find(a => a.level === 1)?.balance || 0;
    const prevNetIncome = prevRevenues - prevExpenses;

    const cashAndBanks = allTimeAccounts.filter(acc => acc.level === 4 && (acc.classifications?.includes('صندوق') || acc.classifications?.includes('بنك')));
    const balance = cashAndBanks.reduce((sum, acc) => sum + (acc.closingDebit - acc.closingCredit), 0);

    return {
        totalRevenues: currentRevenues,
        totalExpenses: currentExpenses,
        netIncome: currentNetIncome,
        balance,
        revenueChange: calculatePercentageChange(currentRevenues, prevRevenues),
        expenseChange: calculatePercentageChange(currentExpenses, prevExpenses),
        netIncomeChange: calculatePercentageChange(currentNetIncome, prevNetIncome),
    }
}
