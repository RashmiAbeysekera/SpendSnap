# SpendSnap 💳

SpendSnap is a modern, full-stack personal expense tracking application featuring a **Spring Boot 3** REST API backend and an elegant, responsive web frontend. 

Designed with a warm, refined aesthetic—featuring **maroon** as the primary brand color, **warm cream** surfaces, and **restrained brown** accents—SpendSnap makes daily personal expense management intuitive, fast, and delightful.

---

## 🎨 Design & Aesthetic

- **Primary Brand**: Deep Maroon (`#7A1C2E`) representing intentional spending and stability.
- **Page & Card Surfaces**: Warm Cream (`#FAF7F2` and `#FFFFFF`) providing a soft, welcoming, and high-contrast backdrop.
- **Details & Accents**: Rich Coffee Browns (`#5D4037`) for secondary controls, subtle dividers, and typography.
- **Typography**: Clean modern typefaces (`Outfit` for hero titles and metrics, `Plus Jakarta Sans` for body and forms).
- **Responsive Experience**: Seamless layout adaptation across mobile phones, tablets, and desktop displays.

---

## 🚀 Features

### 🖥️ Frontend
- **Monthly Spending Dashboard**: Real-time summary of total monthly expenditure, daily spending average, transaction count, and top category.
- **Month-by-Month Navigation**: Previous/Next month controls with an instant "Current Month" jump button.
- **Expense Management (CRUD)**: Add, edit, and delete expenses directly in a modal dialog without leaving the page.
- **Search & Filters**:
  - Instant note & category text search as you type.
  - Category dropdown filter.
  - Date range filtering (`startDate` and `endDate`) with quick filter chips (*This Month*, *All Time*, *Custom Range*).
- **State Feedback**:
  - Shimmering skeleton loader during data loading.
  - Friendly empty state illustration when no expenses match.
  - Error state with an instant retry action.
  - Toast notifications for additions, updates, deletions, and error notifications.
  - Inline form validation feedback with field-level alerts.

### ⚙️ Backend
- **RESTful Endpoints**: Complete CRUD API at `/api/expenses`.
- **Validation**: Strict input validation using Jakarta Bean Validation (`@Positive`, `@NotBlank`, `@NotNull`, `@Size`).
- **Standardized Error Responses**: Centralized `@RestControllerAdvice` delivering consistent JSON error objects.
- **In-Memory H2 Database**: Instant setup with zero external dependencies; includes an embedded Web Console at `/h2-console`.
- **Automated Testing**: Comprehensive JUnit 5 and MockMvc integration tests.

---

## 🛠 Tech Stack

- **Backend**: Java 21, Spring Boot 3.3.5 (Spring Web, Spring Data JPA, Hibernate, Bean Validation)
- **Database**: H2 In-Memory Database (`jdbc:h2:mem:spendsnap`)
- **Frontend**: Vanilla HTML5, Modern CSS (Custom Properties, Flexbox, Grid), Modular JavaScript (ES6+ `async/await`)
- **Build Tool**: Apache Maven (includes Maven Wrapper `mvnw` / `mvnw.cmd`)
- **Testing**: JUnit 5, Spring Boot Test, MockMvc

---

## 📂 Project Structure

```
SpendSnap/
├── src/
│   ├── main/
│   │   ├── java/com/rashmi/spendsnap/
│   │   │   ├── controller/
│   │   │   │   └── ExpenseController.java          # REST API endpoints (/api/expenses)
│   │   │   ├── dto/
│   │   │   │   ├── ExpenseRequest.java             # Request payload with validation
│   │   │   │   └── ExpenseResponse.java            # Clean API response model
│   │   │   ├── exception/
│   │   │   │   ├── ErrorResponse.java              # Standardized error structure
│   │   │   │   ├── GlobalExceptionHandler.java     # Centralized exception handler
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   ├── model/
│   │   │   │   └── Expense.java                    # JPA database entity
│   │   │   ├── repository/
│   │   │   │   └── ExpenseRepository.java          # Custom JPQL search/filtering queries
│   │   │   ├── service/
│   │   │   │   └── ExpenseService.java             # Business logic & data transformation
│   │   │   └── SpendSnapApplication.java           # Spring Boot application main
│   │   └── resources/
│   │       ├── application.properties              # Database and server configuration
│   │       └── static/                             # Embedded frontend web app
│   │           ├── index.html                      # Single page application structure
│   │           ├── css/
│   │           │   └── styles.css                  # Design system (Maroon & Warm Cream)
│   │           └── js/
│   │               └── app.js                      # UI logic, state, and API integration
│   └── test/
│       └── java/com/rashmi/spendsnap/
│           ├── controller/
│           │   └── ExpenseControllerTest.java      # MockMvc integration tests
│           └── SpendSnapApplicationTests.java      # Spring context load tests
├── pom.xml                                         # Maven configuration
├── test-api.ps1                                    # API automated testing script
└── README.md
```

---

## ⚡ Quick Start & Run Instructions

### Prerequisites
- **Java JDK 21** or later (`java -version`)
- **Git**

### 1. Clone & Navigate
```bash
git clone https://github.com/RashmiAbeysekera/SpendSnap.git
cd SpendSnap
```

### 2. Build the Application
```bash
# Using Maven Wrapper (Windows)
.\mvnw.cmd clean package

# Using Maven Wrapper (macOS / Linux)
./mvnw clean package

# Or using global Maven
mvn clean package
```

### 3. Run SpendSnap
```bash
# Option A: Spring Boot Maven Plugin
mvn spring-boot:run

# Option B: Run the packaged JAR directly
java -jar target/spendsnap-0.0.1-SNAPSHOT.jar
```

### 4. Access the Application
- **Web App**: Open your browser at [http://localhost:8080/](http://localhost:8080/)
- **H2 Database Console**: [http://localhost:8080/h2-console](http://localhost:8080/h2-console)
  - *JDBC URL*: `jdbc:h2:mem:spendsnap`
  - *Username*: `sa`
  - *Password*: *(empty)*

---

## 📖 REST API Reference

The backend REST API is available under `/api/expenses`:

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/expenses` | List all expenses (ordered by date desc) |
| `GET` | `/api/expenses?category=Groceries` | Filter by category |
| `GET` | `/api/expenses?startDate=2026-10-01&endDate=2026-10-31` | Filter by date range |
| `GET` | `/api/expenses?category=...&startDate=...&endDate=...` | Combined category and date filter |
| `GET` | `/api/expenses/{id}` | Get single expense by ID |
| `POST` | `/api/expenses` | Create a new expense |
| `PUT` | `/api/expenses/{id}` | Update an existing expense by ID |
| `DELETE` | `/api/expenses/{id}` | Delete an expense by ID |

### Example cURL Request:
```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount": 42.50, "category": "Groceries", "date": "2026-10-04", "note": "Weekly market trip"}'
```

---

## 🧪 Testing

Run all unit and integration tests with:
```bash
mvn test
```

Or verify the endpoints live using the PowerShell script while the app is running:
```powershell
powershell -ExecutionPolicy Bypass -File .\test-api.ps1
```

---

## 📄 License

This project is licensed under the MIT License.
