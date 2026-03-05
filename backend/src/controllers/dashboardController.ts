import IncomeModel from "../models/incomeModel";
import ExpenseModel from "../models/expenseModel";
import { Request, Response } from "express";
import getDateRange, { type DateRange } from "../utils/dataFilter";

 export async function getDashboardOverview(req: Request, res: Response) {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    try {
        const incomes = await IncomeModel.find({
            userId,
            date: { $gte: startOfMonth, $lte: now },
        }).lean();

        const expenses = await ExpenseModel.find({
            userId,
            date: { $gte: startOfMonth, $lte: now },
        }).lean();

        const monthlyIncome = incomes.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const monthlyExpense = expenses.reduce((acc, cur) => acc + Number(cur.amount || 0), 0);
        const savings = monthlyIncome - monthlyExpense;
        const savingsRate = monthlyIncome === 0 ? 0 : Math.round((savings / monthlyIncome) * 100);

        const recentTransactions = [
            ...incomes.map((i) => ({ ...i, type: "income" })),
            ...expenses.map((e) => ({ ...e, type: "expense" })),
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        const spendByCategory: { [key: string]: number } = {};
        for (const exp of expenses) {
            const cat = exp.category || "Other";
            spendByCategory[cat] = (spendByCategory[cat] || 0) + Number(exp.amount || 0);
        }

        const expenseDistribution = Object.entries(spendByCategory).map(([category, amount]) => ({
            category,
            amount,
            percent: monthlyExpense === 0 ? 0 : Math.round((amount / monthlyExpense) * 100),
        }));

        return res.status(200).json({
            success: true,
           data:{
             monthlyIncome,
            monthlyExpense,
            savings,
            savingsRate,
            recentTransactions,
            expenseDistribution,
           }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}