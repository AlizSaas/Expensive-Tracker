import { Request, Response } from "express";
import expenseModel from "../models/expenseModel";
import { incomeSchema } from "../validators/incomeValidator";
import XLSX from "xlsx";
import getDateRange, { DateRange } from "../utils/dataFilter";

//add new expense

export const addExpense = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = incomeSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.message, // Use .message instead of deprecated .flatten()
    });
  }

  try {
    const { description, amount, category, date } = result.data;

    const newExpense = new expenseModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });

    await newExpense.save();

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: newExpense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// get the expenses
export async function getExpenses(req: Request, res: Response) {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const expenses = await expenseModel.find({ userId }).sort({ date: -1 });
    return res.status(200).json({
      success: true,
      data: expenses,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// update the expense
export async function updateExpense(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const expenseId = req.params.id;
  const result = incomeSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.message, // Use .message instead of deprecated .flatten()
    });
  }

  try {
    const { description, amount, category, date } = result.data;

    const updatedExpense = await expenseModel.findOneAndUpdate(
      { _id: expenseId, userId },
      { description, amount, category, date: new Date(date) },
      { new: true },
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: updatedExpense,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

// delete the expense
export async function deleteExpense(req: Request, res: Response) {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const expenseId = req.params.id;
  try {
    const deletedExpense = await expenseModel.findOneAndDelete({
      _id: expenseId,
      userId,
    });
    if (!deletedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}


export async function downloadExpenseExcel(req: Request, res: Response) {
    const userId = req.user?.id;

    if(!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    try {
        const expenses = await expenseModel.find({ userId }).sort({ date: -1 });
       

        const plainData = expenses.map(expense => ({
            description: expense.description,
            amount: expense.amount,
            category: expense.category,
            date: expense.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        }));


        const worksheet = XLSX.utils.json_to_sheet(plainData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

       XLSX.utils.book_append_sheet(workbook, worksheet, "ExpenseModel");

       XLSX.writeFile(workbook, "expenses_details.xlsx");

       res.download("expenses_details.xlsx", "expenses_details.xlsx", (err) => {
            if (err) {
                console.error("Error downloading file:", err);
                return res.status(500).json({
                    success: false,
                    message: "Error downloading file",
                });
            }
        });
     


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}


export async function getExpenseOverview(req: Request, res: Response) {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { range = "monthly" } = req.query as { range: DateRange }; // ✅ default fallback
    const { start, end } = getDateRange(range);  

    // query DB here...

    const expenses  = await expenseModel.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

  const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
    const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
    const numberOfTransactions = expenses.length;
    const recentTransactions = expenses.slice(0, 5); // Get the 5 most recent transactions

    return res.status(200).json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
        numberOfTransactions,
        recentTransactions,
        range, // include the range in the response for clarity
      }
    });

  





  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}
