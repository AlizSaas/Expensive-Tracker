import express from "express";
import { authMiddleware } from "../middleware/auth";

import { addExpense, getExpenses, deleteExpense, updateExpense, getExpenseOverview, downloadExpenseExcel } from "../controllers/expenseController";

const expenseRouter = express.Router();
expenseRouter.use(authMiddleware); // Apply auth middleware to all routes in this router

expenseRouter.post('/add', addExpense);
expenseRouter.get('/get', getExpenses);
expenseRouter.put('/update/:id', updateExpense);
expenseRouter.delete('/delete/:id', deleteExpense);
expenseRouter.get('/overview', getExpenseOverview);
expenseRouter.get('/downloadexcel', downloadExpenseExcel);

export default expenseRouter;