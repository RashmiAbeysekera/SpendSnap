# SpendSnap 💳 &bull; Student Weekly Budget Edition

SpendSnap is a modern, student-friendly personal expense and weekly budgeting web application built with **Spring Boot 3**, **Java 21**, **Spring Data JPA**, and an in-memory **H2 Database**.

Tailored for university students managing a weekly allowance (e.g., **Rs. 5,000 / week**), SpendSnap makes it effortless to record daily spends (canteen, transport, prints), log extra income (pocket money, tutoring gigs), track real-time balances, view an interactive category pie chart, and run calculations with an embedded quick calculator.

---

## 🎨 Visual Design & Brand Palette

SpendSnap pairs a refined, welcoming student aesthetic with clean typography and high-contrast accessibility:
- **Primary Brand**: Deep Maroon (`#7A1C2E`, `#541320`) for primary buttons, weekly highlights, and hero badges.
- **Surfaces & Cards**: Warm Cream (`#FAF7F2` page background, `#FFFFFF` elevated cards, `#F4EFEA` subtle surfaces).
- **Secondary Accents**: Restrained Coffee Browns (`#5D4037`, `#8D6E63`, `#2D201A` typography) for subtle borders and icons.
- **Currency**: Displayed in Sri Lankan Rupees (**Rs.**, `LKR`) consistently throughout all views.
- **Typography**: Google Fonts [`Outfit`](https://fonts.google.com/specimen/Outfit) for hero metrics and titles, paired with [`Plus Jakarta Sans`](https://fonts.google.com/specimen/Plus+Jakarta+Sans) for ultra-legible forms and tables.

---

## 🚀 Key Features

### 🎓 Student Weekly Budgeting (Monday &ndash; Sunday)
- **Weekly Navigation**: Easily move across weeks (Monday through Sunday) with previous/next controls and a "Jump to This Week" shortcut.
- **Starting Weekly Allowance**:
  - Default friendly student budget of **Rs. 5,000.00**.
  - Fully customizable: click **Edit** to update your allowance for any specific week, persisted in the database.
- **Extra Income Tracking**:
  - Record extra pocket money, gifts, or part-time earnings with amount, date, and source.
  - View and delete weekly income entries from the income manager modal.
- **Real-Time Remaining Balance**:
  - Formula: `Balance = Weekly Allowance + Extra Income - Total Expenses`.
  - Color-coded badges and status: **On Track 🎯**, **Budget Low ⚠️**, or **Overspent 🚨**.
- **Spending Progress Bar**: Shows visual percentage spent vs remaining funds, with dynamic student budget tips.

### 🥧 Weekly Category Pie Chart
- **Lightweight & Accessible**: Built with pure responsive SVG—no heavy charting libraries needed.
- **Visual Breakdown**: Highlights expenses for the selected week across categories (Food & Canteen, Transport, Education & Prints, Groceries, etc.).
- **Interactive Legend**: Displays color-coded dots, exact amounts in Rs., and percentages.
- **Empty State**: Friendly illustration when no expenses have been incurred during the week.

### 🧮 Student Quick Calculator
- **Convenient Side Panel**: Docked beside the chart on desktop; stacks smoothly below the dashboard on mobile.
- **Quick Calculations**: Easily split canteen bills, bus fares, and textbook costs.
- **Keyboard Support**: Full keyboard input (numbers, `+`, `-`, `*`, `/`, `%`, `Enter`, `Backspace`, `Esc`).
- *Note*: Operates as a handy scratchpad and never modifies your actual expense records.

### 📊 Full Monthly Overview & Expense History
- **Monthly Metrics**: Monthly total spend, daily average, transaction count, and top category.
- **Expense CRUD**: Add, edit, and delete expense entries with instant modal dialogs.
- **Search & Filter Toolbar**: Instant text search for notes/categories, category dropdown, and custom date range filters.
- **Feedback & States**: Shimmering skeleton loader, friendly empty state, retry error banner, and floating toast notifications.

---

## 🛠 Tech Stack

- **Backend**: Java 21, Spring Boot 3.3.5
  - *Spring Web*: RESTful APIs
  - *Spring Data JPA & Hibernate 6*: Data persistence
  - *Bean Validation*: Jakarta validation annotations (`@Positive`, `@NotNull`, etc.)
  - *H2 Database*: Embedded in-memory SQL database
- **Frontend**: Vanilla HTML5, Modern CSS (Custom Properties, Flexbox, Grid), Modular JavaScript (ES6+ `async/await`, SVG)
- **Build Tool**: Apache Maven (with wrapper `mvnw` / `mvnw.cmd`)
- **Testing**: JUnit 5, Spring Boot Test, MockMvc (15 automated unit & integration tests)

---

## 📂 Project Structure

```
SpendSnap/
├── src/
│   ├── main/
│   │   ├── java/com/rashmi/spendsnap/
│   │   │   ├── controller/
│   │   │   │   ├── ExpenseController.java          # /api/expenses
│   │   │   │   ├── IncomeController.java           # /api/incomes
│   │   │   │   └── WeeklyBudgetController.java     # /api/budgets/weekly
│   │   │   ├── dto/
│   │   │   │   ├── ExpenseRequest.java / ExpenseResponse.java
│   │   │   │   ├── IncomeRequest.java / IncomeResponse.java
│   │   │   │   └── WeeklyBudgetRequest.java / WeeklyBudgetResponse.java
│   │   │   ├── exception/
│   │   │   │   ├── ErrorResponse.java
│   │   │   │   ├── GlobalExceptionHandler.java
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   ├── model/
│   │   │   │   ├── Expense.java                    # 'expenses' table
│   │   │   │   ├── Income.java                     # 'incomes' table
│   │   │   │   └── WeeklyBudget.java               # 'weekly_budgets' table
│   │   │   ├── repository/
│   │   │   │   ├── ExpenseRepository.java
│   │   │   │   ├── IncomeRepository.java
│   │   │   │   └── WeeklyBudgetRepository.java
│   │   │   ├── service/
│   │   │   │   ├── ExpenseService.java
│   │   │   │   ├── IncomeService.java
│   │   │   │   └── WeeklyBudgetService.java
│   │   │   └── SpendSnapApplication.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── static/                             # Embedded Single Page App
│   │           ├── index.html                      # Layout, weekly budget, chart & calc
│   │           ├── css/styles.css                  # Maroon, warm cream & brown theme
│   │           └── js/app.js                       # Budget state, SVG pie chart, calc logic
│   └── test/
│       └── java/com/rashmi/spendsnap/
│           ├── controller/
│           │   ├── ExpenseControllerTest.java      # 7 CRUD & filter tests
│           │   ├── IncomeControllerTest.java       # 4 Income tests
│           │   └── WeeklyBudgetControllerTest.java # 3 Budget tests
│           └── SpendSnapApplicationTests.java      # 1 Context load test
├── pom.xml
├── test-api.ps1
└── README.md
```

---

## ⚡ Quick Start & Run Instructions

### Prerequisites
- **Java JDK 21** or later (`java -version`)
- **Git**

### 1. Clone & Switch to Feature Branch
```bash
git clone https://github.com/RashmiAbeysekera/SpendSnap.git
cd SpendSnap
git checkout feature/student-weekly-budget
```

### 2. Build the Project
```bash
# Windows
.\mvnw.cmd clean package

# Linux / macOS
./mvnw clean package

# Or using global Maven
mvn clean package
```

### 3. Run the Application
```bash
# Option A: Run via Maven plugin
mvn spring-boot:run

# Option B: Run the standalone executable JAR
java -jar target/spendsnap-0.0.1-SNAPSHOT.jar
```

### 4. Access the Application
- **Student Web App**: [http://localhost:8080/](http://localhost:8080/)
- **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - *JDBC URL*: `jdbc:h2:mem:spendsnap`
  - *Username*: `sa`
  - *Password*: *(empty)*

---

## 📖 REST API Reference

### 1. Expenses API (`/api/expenses`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | List expenses (optional `category`, `startDate`, `endDate`) |
| `GET` | `/api/expenses/{id}` | Get single expense by ID |
| `POST` | `/api/expenses` | Record a new expense |
| `PUT` | `/api/expenses/{id}` | Update an existing expense |
| `DELETE` | `/api/expenses/{id}` | Delete an expense |

### 2. Weekly Budget API (`/api/budgets/weekly`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/budgets/weekly?weekStartDate=YYYY-MM-DD` | Get allowance for week (defaults to Rs 5,000) |
| `PUT` | `/api/budgets/weekly` | Set/update starting allowance for the week |

### 3. Extra Income API (`/api/incomes`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/incomes` | List incomes (optional `startDate`, `endDate`) |
| `GET` | `/api/incomes/{id}` | Get single income entry by ID |
| `POST` | `/api/incomes` | Record extra income (amount, date, source) |
| `DELETE` | `/api/incomes/{id}` | Delete income entry |

---

## 🧪 Testing

Run the full automated test suite (15 tests):
```bash
mvn test
```

---

## 📄 License

This project is licensed under the MIT License.
