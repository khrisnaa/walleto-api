import express, { Request, Response } from 'express';
import Expense, { IExpense } from '../models/Expense';
import { protect } from '../middleware/auth';
import { generateGroupKeyUTC } from '../utils/generateGroupKeyUTC';
import { validate } from '../middleware/validate';
import { createExpenseSchema, updateExpenseSchema } from '../schemas/expense';

const router = express.Router();

// GET all expenses for logged-in user
router.get('/', protect, async (req: any, res: Response) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET a single expense by id
router.get('/:id', protect, async (req: any, res: Response) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// CREATE a new expense
router.post('/', protect, validate(createExpenseSchema), async (req: any, res: Response) => {
  try {
    const { title, amount, category, paymentMethod, description, merchant, date } = req.body;

    const finalDate = date ? new Date(date) : new Date();
    const groupKey = merchant ? generateGroupKeyUTC(merchant, finalDate) : undefined;

    const expense = new Expense({
      userId: req.user._id,
      title,
      amount,
      category,
      paymentMethod,
      description,
      groupKey,
      date: finalDate,
    });
    const createdExpense = await expense.save();
    res.status(201).json(createdExpense);
  } catch (err) {
    if (err instanceof Error) {
      res.status(500).json({ message: err.message });
    } else {
      res.status(500).json({ message: String(err) });
    }
  }
});

// UPDATE an expense
router.put('/:id', protect, validate(updateExpenseSchema), async (req: any, res: Response) => {
  try {
    const { title, amount, category, paymentMethod, description, merchant, date } = req.body;

    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    expense.title = title || expense.title;
    expense.amount = amount || expense.amount;
    expense.category = category || expense.category;
    expense.paymentMethod = paymentMethod || expense.paymentMethod;
    expense.description = description || expense.description;
    expense.date = date || expense.date;

    if (merchant?.trim()) {
      expense.groupKey = generateGroupKeyUTC(merchant, expense.date);
    } else if (merchant !== undefined) {
      expense.groupKey = undefined;
    }

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE an expense
router.delete('/:id', protect, async (req: any, res: Response) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ message: 'Expense not found' });

    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
