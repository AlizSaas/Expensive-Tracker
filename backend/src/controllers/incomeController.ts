import IncomeModel from '../models/incomeModel';
import { incomeSchema } from '../validators/incomeValidator';
import { Request, Response } from 'express';
import XLSX from 'xlsx';
import getDateRange, { DateRange } from '../utils/dataFilter';

export const addIncome = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if(!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const result = incomeSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json({
      success: false,
      message: result.error.flatten().fieldErrors,
    });
  }

  const { description, amount, category, date } = result.data;

  try {
    const newIncome = new IncomeModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });

    await newIncome.save();

    return res.status(201).json({
      success: true,
      message: "Income added successfully",
      data: newIncome,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// get the incom


export async function getIncomes(req: Request, res: Response) {
    const userId = req.user?.id;

    if(!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    try {
        const incomes = await IncomeModel.find({ userId }).sort({ date: -1 }); // Sort by date in descending order
        return res.status(200).json({
            success: true,
            data: incomes,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}

export async function updateIncome(req: Request, res: Response) {
    const userId = req.user?.id;

    if(!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }
    const { id } = req.params;
    if(!id) {
        return res.status(400).json({
            success: false,
            message: "Income ID is required",
        });
    }

    const result = incomeSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: result.error.message,
        });
    }

    const { description, amount, category, date } = result.data;

    try {
        const updatedIncome = await IncomeModel.findOneAndUpdate(
            { _id: id, userId },
            { description, amount, category, date: new Date(date) },
            { new: true }
        );

        if (!updatedIncome) {
            return res.status(404).json({
                success: false,
                message: "Income not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Income updated successfully",
            data: updatedIncome,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}


export async function deleteIncome(req: Request, res: Response) {
    const userId = req.user?.id;
    
    if(!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const { id } = req.params;
    if(!id) {
        return res.status(400).json({
            success: false,
            message: "Income ID is required",
        });
    }

    try {
        const deletedIncome = await IncomeModel.findOneAndDelete({ _id: id, userId });

        if (!deletedIncome) {
            return res.status(404).json({
                success: false,
                message: "Income not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Income deleted successfully",
           
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
        });
    }
}


export async function downloadIncomeExcel(req: Request, res: Response) {
    const userId = req.user?.id;

    if(!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    try {
        const incomes = await IncomeModel.find({ userId }).sort({ date: -1 });
       

        const plainData = incomes.map(income => ({
            description: income.description,
            amount: income.amount,
            category: income.category,
            date: income.date.toISOString().split('T')[0], // Format date as YYYY-MM-DD
        }));


        const worksheet = XLSX.utils.json_to_sheet(plainData);

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Incomes");

       XLSX.utils.book_append_sheet(workbook, worksheet, "IncomeModel");

       XLSX.writeFile(workbook, "incomes_details.xlsx");

       res.download("incomes_details.xlsx", "incomes_details.xlsx", (err) => {
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

export async function getIncomeOverview(req: Request, res: Response) {
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

    const incomes  = await IncomeModel.find({
      userId,
      date: { $gte: start, $lte: end }
    }).sort({ date: -1 });

  const totalIncome = incomes.reduce((total, income) => total + income.amount, 0);
    const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const numberOfTransactions = incomes.length;
    const recentTransactions = incomes.slice(0, 5); // Get the 5 most recent transactions

    return res.status(200).json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
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