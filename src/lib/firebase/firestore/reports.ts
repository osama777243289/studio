
import { getAccounts } from "./accounts";
import { getAllTransactions } from "./transactions";
import type { Account } from "@/components/chart-of-accounts/account-tree";

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


const calculateBalances = async (): Promise<Map<string, { movementDebit: number; movementCredit: number }>> => {
    const transactions = await getAllTransactions();
    const balances = new Map<string, { movementDebit: number; movementCredit: number }>();

    for (const tx of transactions) {
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

const processAccountsForReports = async (): Promise<TrialBalanceAccount[]> => {
    const accountTree = await getAccounts();
    const balances = await calculateBalances();
    const processedAccounts: TrialBalanceAccount[] = [];

    const traverse = (accounts: Account[], level: number): { totalMovementDebit: number; totalMovementCredit: number } => {
        let levelMovementDebit = 0;
        let levelMovementCredit = 0;

        for (const acc of accounts) {
            let movementDebit = 0;
            let movementCredit = 0;

            if (acc.children && acc.children.length > 0) {
                const childTotals = traverse(acc.children, level + 1);
                movementDebit = childTotals.totalMovementDebit;
                movementCredit = childTotals.totalMovementCredit;
            } else {
                // This is a leaf node (transactional account)
                const balance = balances.get(acc.id) || { movementDebit: 0, movementCredit: 0 };
                movementDebit = balance.movementDebit;
                movementCredit = balance.movementCredit;
            }

            const balance = movementDebit - movementCredit;
            
            processedAccounts.push({
                ...acc,
                movementDebit,
                movementCredit,
                closingDebit: balance > 0 ? balance : 0,
                closingCredit: balance < 0 ? Math.abs(balance) : 0,
                level,
            });

            levelMovementDebit += movementDebit;
            levelMovementCredit += movementCredit;
        }

        return { totalMovementDebit: levelMovementDebit, totalMovementCredit: levelMovementCredit };
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
