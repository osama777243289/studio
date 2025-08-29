import { getAccounts } from "./accounts";
import { getAllTransactions } from "./transactions";
import type { Account } from "@/components/chart-of-accounts/account-tree";

export interface TrialBalanceAccount extends Account {
    debit: number;
    credit: number;
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


const calculateBalances = async (): Promise<Map<string, number>> => {
    const transactions = await getAllTransactions();
    const balances = new Map<string, number>();

    for (const tx of transactions) {
        const currentBalance = balances.get(tx.accountId) || 0;
        balances.set(tx.accountId, currentBalance + tx.amount);
    }
    
    return balances;
};

const processAccountsForReports = async (): Promise<TrialBalanceAccount[]> => {
    const accountTree = await getAccounts();
    const balances = await calculateBalances();
    const processedAccounts: TrialBalanceAccount[] = [];

    const traverse = (accounts: Account[], level: number): { totalDebit: number; totalCredit: number } => {
        let levelDebit = 0;
        let levelCredit = 0;

        for (const acc of accounts) {
            let debit = 0;
            let credit = 0;

            if (acc.children && acc.children.length > 0) {
                const childTotals = traverse(acc.children, level + 1);
                debit = childTotals.totalDebit;
                credit = childTotals.totalCredit;
            } else {
                // This is a leaf node (transactional account)
                const balance = balances.get(acc.id) || 0;
                if (balance > 0) {
                    debit = balance;
                } else {
                    credit = Math.abs(balance);
                }
            }

            processedAccounts.push({
                ...acc,
                debit,
                credit,
                level,
            });

            levelDebit += debit;
            levelCredit += credit;
        }

        return { totalDebit: levelDebit, totalCredit: levelCredit };
    };

    traverse(accountTree, 1);
    
    // Sort all processed accounts by code
    processedAccounts.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

    return processedAccounts;
}

export const getTrialBalanceData = async (): Promise<TrialBalanceAccount[]> => {
    return await processAccountsForReports();
}

const getReportAccounts = (allAccounts: TrialBalanceAccount[], group: Account['group']): ReportAccount[] => {
    return allAccounts
        .filter(acc => acc.group === group)
        .map(acc => {
            const balance = acc.type === 'Debit' ? acc.debit - acc.credit : acc.credit - acc.debit;
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

    // Get total from the main group account (level 1)
    const totalRevenues = getReportAccounts(allAccounts, 'Revenues').find(a => a.level === 1)?.balance || 0;
    const totalCogs = cogs.find(e => e.code === '51')?.balance || 0;
    const totalExpenses = expenses.reduce((sum, acc) => sum + (acc.level === 2 ? acc.balance : 0), 0);

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

    // Add net income to equity
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
