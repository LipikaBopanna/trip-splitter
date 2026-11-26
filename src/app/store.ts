import { configureStore } from "@reduxjs/toolkit";
import expensesReducer from "../features/expenses/expensesSlice";
import { sampleData } from "../data/sampleData";
import type { ExpenseState } from "../types/expense";

const STORAGE_KEY = "trip-splitter-data";

function loadState(): ExpenseState {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY);

    if (savedData) {
      return JSON.parse(savedData) as ExpenseState;
    }
  } catch {
    // If saved data is corrupted, use sample data.
  }

  return sampleData;
}

export const store = configureStore({
  reducer: {
    expenses: expensesReducer,
  },
  preloadedState: {
    expenses: loadState(),
  },
});

store.subscribe(() => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(store.getState().expenses),
    );
  } catch {
    // The app can continue even if storage is unavailable.
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;