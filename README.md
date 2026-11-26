TripSplit — Shared Expense Tracker

A responsive expense-splitting application that helps groups track shared expenses, calculate balances, and manage trip spending.

Features

- Add and delete expenses
- Split expenses equally, by exact amounts, or by percentages
- Track how much each member owes or receives
- Filter expenses by category
- View expenses in newest-first order
- Persistent data storage using LocalStorage
- Responsive dashboard for desktop and mobile
- INR currency formatting with paise-level precision

Tech Stack

- React
- TypeScript
- Redux Toolkit
- React Router
- Vite
- CSS
- Vitest
- React Testing Library

Setup

```bash
npm install
npm run dev
```

Available Scripts

- npm run dev : Start the development server
- npm run build : Create the production build
- npm run typecheck : Run TypeScript checks
- npm run lint : Run linting
- npm run test : Run tests

Design Decisions

- Expenses are stored in integer paise to avoid floating-point currency calculation errors.
- Equal splits distribute remainder paise deterministically.
- Redux Toolkit manages application state.
- LocalStorage is used to persist expenses and members across refreshes.
- Expense calculations are separated into utility functions for easier testing.

Future Improvements

- Add the ability to create and manage trips.
- Add settlement/payment tracking.
- Add export functionality.
- Improve data validation when loading persisted data.
- Add more comprehensive component and integration tests.

AI Usage

AI tools were used as an assistance tool during development for debugging, implementation guidance, styling suggestions, test planning, and understanding technical concepts. The implementation was reviewed, tested, and modified during development.
  