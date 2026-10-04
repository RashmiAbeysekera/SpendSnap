# SpendSnap 💳

SpendSnap is a clean, lightweight personal expense tracker REST API built with **Spring Boot 3**, **Java 21**, **Spring Data JPA**, and an in-memory **H2 Database**.

Designed as a portfolio-ready backend service, it demonstrates clean architecture, input validation, custom error handling, and flexible querying capabilities.

---

## 🚀 Features

- **Full Expense CRUD Operations**: Create, read, update, and delete expense records.
- **Search & Filtering**: Filter expenses by category (case-insensitive) and date range (`startDate` / `endDate`).
- **Data Validation**: Strict payload validation using Jakarta Bean Validation (`@Positive`, `@NotBlank`, `@NotNull`, etc.).
- **Consistent Error Responses**: Centralized `@RestControllerAdvice` returning structured JSON error payloads with field-level validation details.
- **In-Memory H2 Database**: Zero external database setup needed for rapid local development and testing.
- **Embedded H2 Console**: Web UI for inspecting tables and running SQL queries directly.
- **Automated Tests**: Unit and integration test suite using JUnit 5 and `MockMvc`.

---

## 🛠 Tech Stack

- **Language**: Java 21
- **Framework**: Spring Boot 3.3.5
- **Modules**:
  - Spring Web
  - Spring Data JPA (Hibernate 6)
  - Spring Boot Validation (Hibernate Validator)
  - H2 Database (in-memory)
- **Build Tool**: Apache Maven (with Maven Wrapper `mvnw`)
- **Testing**: JUnit 5, MockMvc

---

## 📂 Project Structure

```
SpendSnap/
├── src/
│   ├── main/
│   │   ├── java/com/rashmi/spendsnap/
│   │   │   ├── controller/
│   │   │   │   └── ExpenseController.java      # REST endpoints
│   │   │   ├── dto/
│   │   │   │   ├── ExpenseRequest.java         # Request payload with validation
│   │   │   │   └── ExpenseResponse.java        # Response payload
│   │   │   ├── exception/
│   │   │   │   ├── ErrorResponse.java          # Standardized error model
│   │   │   │   ├── GlobalExceptionHandler.java # Exception interceptor
│   │   │   │   └── ResourceNotFoundException.java
│   │   │   ├── model/
│   │   │   │   └── Expense.java                # JPA Entity
│   │   │   ├── repository/
│   │   │   │   └── ExpenseRepository.java      # Spring Data JPA repository
│   │   │   ├── service/
│   │   │   │   └── ExpenseService.java         # Business logic
│   │   │   └── SpendSnapApplication.java       # Main entry point
│   │   └── resources/
│   │       └── application.properties          # App & H2 DB configuration
│   └── test/
│       └── java/com/rashmi/spendsnap/
│           ├── controller/
│           │   └── ExpenseControllerTest.java  # MockMvc integration tests
│           └── SpendSnapApplicationTests.java  # Spring context test
├── pom.xml
├── test-api.ps1                                # Automated PowerShell test script
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- **Java JDK 21** or higher installed (`java -version`)
- **Git** installed

### 1. Clone the Repository

```bash
git clone https://github.com/RashmiAbeysekera/SpendSnap.git
cd SpendSnap
```

### 2. Build the Application

Using Maven Wrapper:
```bash
# On Linux/macOS
./mvnw clean package

# On Windows
.\mvnw.cmd clean package
```
*(Or with global Maven: `mvn clean package`)*

### 3. Run the Application

```bash
# Using Spring Boot plugin
mvn spring-boot:run

# Or running the packaged JAR directly
java -jar target/spendsnap-0.0.1-SNAPSHOT.jar
```

The application starts by default at `http://localhost:8080`.

---

## 🗄 H2 Database Console

You can inspect the database and tables in your browser:
- **URL**: `http://localhost:8080/h2-console`
- **JDBC URL**: `jdbc:h2:mem:spendsnap`
- **User Name**: `sa`
- **Password**: *(leave blank)*

---

## 📖 REST API Documentation

### Base URL: `http://localhost:8080/api/expenses`

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/expenses` | Create a new expense |
| `GET` | `/api/expenses` | List all expenses (ordered by date desc) |
| `GET` | `/api/expenses?category=Food` | Filter expenses by category |
| `GET` | `/api/expenses?startDate=2026-10-01&endDate=2026-10-31` | Filter expenses by date range |
| `GET` | `/api/expenses?category=Food&startDate=...&endDate=...` | Combined category & date filter |
| `GET` | `/api/expenses/{id}` | Get expense by ID |
| `PUT` | `/api/expenses/{id}` | Update an existing expense |
| `DELETE` | `/api/expenses/{id}` | Delete an expense |

---

## 🧪 Example API Requests

### 1. Create an Expense

**Request:**
```http
POST /api/expenses
Content-Type: application/json

{
  "amount": 54.20,
  "category": "Groceries",
  "date": "2026-10-01",
  "note": "Weekly grocery shopping"
}
```

**cURL:**
```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d '{"amount": 54.20, "category": "Groceries", "date": "2026-10-01", "note": "Weekly grocery shopping"}'
```

**Response (`201 Created`):**
```json
{
  "id": 1,
  "amount": 54.20,
  "category": "Groceries",
  "date": "2026-10-01",
  "note": "Weekly grocery shopping"
}
```

---

### 2. List All Expenses

**Request:**
```http
GET /api/expenses
```

**cURL:**
```bash
curl http://localhost:8080/api/expenses
```

**Response (`200 OK`):**
```json
[
  {
    "id": 1,
    "amount": 54.20,
    "category": "Groceries",
    "date": "2026-10-01",
    "note": "Weekly grocery shopping"
  }
]
```

---

### 3. Filter Expenses

- **By Category:**
  ```bash
  curl "http://localhost:8080/api/expenses?category=Groceries"
  ```

- **By Date Range:**
  ```bash
  curl "http://localhost:8080/api/expenses?startDate=2026-10-01&endDate=2026-10-15"
  ```

- **Combined Filter:**
  ```bash
  curl "http://localhost:8080/api/expenses?category=Groceries&startDate=2026-10-01&endDate=2026-10-15"
  ```

---

### 4. Get Expense by ID

**Request:**
```http
GET /api/expenses/1
```

**cURL:**
```bash
curl http://localhost:8080/api/expenses/1
```

**Response (`200 OK`):**
```json
{
  "id": 1,
  "amount": 54.20,
  "category": "Groceries",
  "date": "2026-10-01",
  "note": "Weekly grocery shopping"
}
```

---

### 5. Update an Expense

**Request:**
```http
PUT /api/expenses/1
Content-Type: application/json

{
  "amount": 62.80,
  "category": "Groceries",
  "date": "2026-10-01",
  "note": "Groceries + bakery items"
}
```

**cURL:**
```bash
curl -X PUT http://localhost:8080/api/expenses/1 \
  -H "Content-Type: application/json" \
  -d '{"amount": 62.80, "category": "Groceries", "date": "2026-10-01", "note": "Groceries + bakery items"}'
```

**Response (`200 OK`):**
```json
{
  "id": 1,
  "amount": 62.80,
  "category": "Groceries",
  "date": "2026-10-01",
  "note": "Groceries + bakery items"
}
```

---

### 6. Delete an Expense

**Request:**
```http
DELETE /api/expenses/1
```

**cURL:**
```bash
curl -X DELETE http://localhost:8080/api/expenses/1
```

**Response (`204 No Content`)**

---

### 7. Validation Error Example

**Request (Invalid Payload):**
```http
POST /api/expenses
Content-Type: application/json

{
  "amount": -10.00,
  "category": "",
  "date": null
}
```

**Response (`400 Bad Request`):**
```json
{
  "timestamp": "2026-10-04T10:22:30.502",
  "status": 400,
  "error": "Validation Failed",
  "message": "Input data validation failed. Please check the errors field for details.",
  "path": "/api/expenses",
  "validationErrors": {
    "amount": "Amount must be greater than zero",
    "category": "Category is required",
    "date": "Date is required"
  }
}
```

---

## 🧪 Running Tests

Run the full automated test suite with:

```bash
mvn test
```

Or run the live PowerShell verification script while the app is running:
```powershell
powershell -ExecutionPolicy Bypass -File .\test-api.ps1
```

---

## 📄 License

This project is licensed under the MIT License.
