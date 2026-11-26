import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { ExpenseState, Expense } from "../../types/expense";
import { sampleData } from "../../data/sampleData";

const initialState: ExpenseState = sampleData;

const expensesSlice = createSlice({
  name: "expenses",
  initialState,

  reducers: {
    addExpense(state, action: PayloadAction<Expense>) {
      state.expenses.push(action.payload);
    },

    deleteExpense(state, action: PayloadAction<string>) {
      state.expenses = state.expenses.filter(
        (expense) => expense.id !== action.payload,
      );
    },
  },
});

export const { addExpense, deleteExpense } = expensesSlice.actions;

export default expensesSlice.reducer;