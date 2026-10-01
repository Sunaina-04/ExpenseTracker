# ExpenseTracker

ExpenseTracker is a two-page, frontend-only expense tracker built with vanilla HTML, CSS, and JavaScript. Beyond simple income/expense logging, it calculates a "Safe-to-Spend" balance that is how much money is genuinely free to spend this month after fixed obligations (loans, EMIs, subscriptions) and a savings goal are set aside.
Built as a web development fundamentals project with no frameworks, no external JS libraries, no backend.

## Problem Statement: 
Consumers often struggle to determine their true disposable income because their raw bank balance doesn't account for upcoming fixed obligations (EMIs, loans, rent, and subscriptions).
Current expense trackers focus heavily on detailed, post-spending categorization rather than providing immediate financial clarity. As a result, users accidentally overspend early in the month and struggle to meet fixed debt commitments or savings goals later on.

## Project Proposal

### Description

ExpenseTracker is a two-page, frontend-only web application for personal expense tracking. Beyond a standard add/delete transaction log, it introduces a Safe-to-Spend model: the user sets their total monthly income, a savings goal, and their fixed monthly obligations (loans, EMIs, subscriptions) once and the app continuously calculates exactly how much money is genuinely free to spend for the rest of the month, factoring in day-to-day variable expenses as they're logged.

### Goals
•	Practice and demonstrate core HTML, CSS, and JavaScript fundamentals covered in class, without relying on any external framework or library
•	Build a genuinely useful budgeting tool, not just a transaction list one that answers "how much can I actually spend right now?" rather than only "what have I spent?"
•	Implement full CRUD (Create, Read, Update, Delete) across two related data types: transactions and fixed obligations
•	Practice client-side data persistence and multi-page state sharing using only browser-native storage (localStorage), with no backend
•	Produce a responsive, accessible, and visually coherent UI across mobile, tablet, and desktop

### Specifications
•	Tech stack: HTML5, CSS3, vanilla JavaScript (ES6+) with no external JS libraries; CSS may use native features only (Grid, Flexbox, conic-gradient, custom properties)
•	Pages (minimum 2): 
1.	index.html - Transactions: add/edit/delete income and expense entries, categorized and dated, plus the live Safe-to-Spend banner
2.	budget.html - Budget & Reports: income/savings setup, fixed obligations manager, financial overview stats, and charts
•	Data storage: localStorage (Web Storage API), shared between both pages via a common data-access layer (js/storage.js)
•	CRUD coverage: 
o	Transactions: Create (add form), Read (list + summary), Update (click to edit), Delete (per-item delete)
o	Fixed Obligations: same full CRUD, plus category-dependent fields (due date for subscriptions; start month + duration for loans/EMIs)
•	Responsiveness: CSS media queries at 900px (tablet) and 480px (mobile) breakpoints, tested layout collapse for the transaction grid, budget grid, and charts
•	No external dependencies: no CDN scripts, no charting libraries - charts are built with native CSS (conic-gradient for the donut chart, sized <div>s for the bar chart)
Design
•	Data model: 
o	Transaction: { id, description, amount (always positive), type: "income"|"expense", category, date }
o	Fixed Obligation: { id, name, amount, category: "Loan/EMI"|"Subscription/Bill", dueDate } or { ..., startMonth, durationMonths } depending on category
o	Budget Config: { monthlyIncome, savingsGoal, fixedObligations: [] }
•	Core formula: 
•	Fixed Commitments Total  = sum of active fixed obligations this monthInitial Safe-to-Spend    = Monthly Income - Fixed Commitments Total - Savings GoalRemaining Safe-to-Spend  = Initial Safe-to-Spend - Variable Expenses logged this month
•	Architecture: a shared js/storage.js module centralizes all localStorage reads/writes and the Safe-to-Spend formula, so both pages calculate identical numbers from the same source of truth, without any page-to-page messaging
•	UI pattern: one form serves both Create and Update on each page, toggled by an in-memory "editing id" state variable which enables avoiding duplicate form markup for add vs. edit
•	Visual design: green/white color scheme with a status-driven color system (green/orange/red) on the Safe-to-Spend card, reflecting how much of the budget has been used

### Features
•	Full CRUD on transactions - add, view, edit, and delete income/expense entries
•	Transactions are categorized (Food, Transport, Shopping, etc.) and dated
•	Full CRUD on fixed obligations (Loans/EMIs and Subscriptions/Bills)
•	Loans/EMIs run for a fixed duration (start month + number of months) and automatically stop counting once that period ends - no manual removal needed
•	Subscriptions/Bills recur every month until deleted
•	Safe-to-Spend banner: live balance, daily spending allowance, and a color-coded progress bar (green -> orange -> red as the budget is used up)
•	Budget & Reports page: income/savings setup, fixed obligations manager, financial overview stats, and two charts: 
o	Income Allocation (donut chart, pure CSS conic-gradient)
o	Variable Expenses by Category (bar chart, pure CSS)
•	Fully responsive layout (mobile, tablet, desktop)
•	All data persists locally via localStorage - no server, no account needed

### Tech Stack
•	HTML5
•	CSS3 (Grid, Flexbox, custom properties, conic-gradient, media queries - no external CSS framework)
•	Vanilla JavaScript (ES6+) - no libraries, no build tools
•	localStorage (Web Storage API) for data persistence

### Prerequisites
•	A modern web browser (Chrome, Firefox, Edge, or Safari - anything supporting ES6 and CSS Grid)
•	No Node.js, no package manager, and no build step required

## Future Planned Improvements

• Cloud Sync & Backend Integration: Migrate from purely local `localStorage` to a lightweight backend database to allow multi-device syncing.
• User Authentication & Accounts: Add secure user signup and login functionality to support individual user accounts and multi-user access.
• Monthly Rollover Engine: Automatically carry over remaining unused "Safe-to-Spend" balances from one month to the next to reward budget surpluses.
• Data Export & Backup: Introduce CSV/JSON data export and import options so users can back up or restore their financial history locally.
• Multi-Currency Support: Allow users to select and format their budget using different currency symbols and international localization settings.

### How to Run
	Visit https://sunaina-04.github.io/ExpenseTracker/ in your browser

### License
This project is licensed under the MIT License.