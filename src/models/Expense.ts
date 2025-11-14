import mongoose, { Document, Schema, Model } from 'mongoose';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  amount: number;
  category: 'Food' | 'Transport' | 'Bills' | 'Shopping' | 'Health' | 'Other';
  paymentMethod: 'Cash' | 'Card' | 'eWallet';
  description?: string;
  groupKey?: string;
  date: Date;
}

const expenseSchema: Schema<IExpense> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  category: {
    type: String,
    enum: ['Food', 'Transport', 'Bills', 'Shopping', 'Health', 'Other'],
    default: 'Other',
  },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'Card', 'eWallet'],
    default: 'Cash',
  },
  description: { type: String },
  groupKey: { type: String },
  date: { type: Date, default: Date.now },
});

const Expense: Model<IExpense> = mongoose.model<IExpense>('Expense', expenseSchema);
export default Expense;
