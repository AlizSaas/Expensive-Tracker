import express from "express";
import { authMiddleware } from "../middleware/auth";
import { addIncome, getIncomes,deleteIncome,getIncomeOverview, updateIncome, downloadIncomeExcel } from "../controllers/incomeController";

const incomeRouter = express.Router();

incomeRouter.use(authMiddleware); // Apply auth middleware to all routes in this router

incomeRouter.post('/add', addIncome);
incomeRouter.get('/get', getIncomes);

incomeRouter.put('/update/:id', updateIncome);

incomeRouter.delete('/delete/:id', deleteIncome);

incomeRouter.get('/overview', getIncomeOverview);

incomeRouter.get('/downloadexcel', downloadIncomeExcel);


export default incomeRouter;