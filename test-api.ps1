$baseUrl = "http://localhost:8080/api/expenses"
Write-Host "=== SpendSnap REST API Verification ===" -ForegroundColor Cyan

# 1. Create expenses
$expense1 = @{
    amount = 54.20
    category = "Groceries"
    date = "2026-10-01"
    note = "Weekly grocery shopping"
} | ConvertTo-Json

$res1 = Invoke-RestMethod -Uri $baseUrl -Method Post -ContentType "application/json" -Body $expense1
Write-Host "`n[POST] Created Expense 1:" -ForegroundColor Green
$res1 | ConvertTo-Json

$expense2 = @{
    amount = 4.50
    category = "Coffee"
    date = "2026-10-02"
    note = "Morning espresso"
} | ConvertTo-Json

$res2 = Invoke-RestMethod -Uri $baseUrl -Method Post -ContentType "application/json" -Body $expense2
Write-Host "`n[POST] Created Expense 2:" -ForegroundColor Green
$res2 | ConvertTo-Json

$expense3 = @{
    amount = 25.00
    category = "Transport"
    date = "2026-10-03"
    note = "Ride to downtown"
} | ConvertTo-Json

$res3 = Invoke-RestMethod -Uri $baseUrl -Method Post -ContentType "application/json" -Body $expense3
Write-Host "`n[POST] Created Expense 3:" -ForegroundColor Green
$res3 | ConvertTo-Json

# 2. Get All
Write-Host "`n[GET] All Expenses:" -ForegroundColor Green
$all = Invoke-RestMethod -Uri $baseUrl -Method Get
$all | ConvertTo-Json

# 3. Filter by Category
Write-Host "`n[GET] Filter by category=Groceries:" -ForegroundColor Green
$byCategory = Invoke-RestMethod -Uri ($baseUrl + "?category=Groceries") -Method Get
$byCategory | ConvertTo-Json

# 4. Filter by Date Range
Write-Host "`n[GET] Filter by date range (2026-10-02 to 2026-10-03):" -ForegroundColor Green
$byDate = Invoke-RestMethod -Uri ($baseUrl + "?startDate=2026-10-02&endDate=2026-10-03") -Method Get
$byDate | ConvertTo-Json

# 5. Get by ID
Write-Host "`n[GET] Expense by ID $($res1.id):" -ForegroundColor Green
$byId = Invoke-RestMethod -Uri "$baseUrl/$($res1.id)" -Method Get
$byId | ConvertTo-Json

# 6. Update Expense
$updateData = @{
    amount = 62.80
    category = "Groceries"
    date = "2026-10-01"
    note = "Groceries + bakery items"
} | ConvertTo-Json

Write-Host "`n[PUT] Updating Expense ID $($res1.id):" -ForegroundColor Green
$updated = Invoke-RestMethod -Uri "$baseUrl/$($res1.id)" -Method Put -ContentType "application/json" -Body $updateData
$updated | ConvertTo-Json

# 7. Delete Expense
Write-Host "`n[DELETE] Deleting Expense ID $($res2.id):" -ForegroundColor Green
Invoke-RestMethod -Uri "$baseUrl/$($res2.id)" -Method Delete
Write-Host "Successfully deleted Expense ID $($res2.id)" -ForegroundColor Green

# 8. Verify Remaining
Write-Host "`n[GET] All Expenses after deletion:" -ForegroundColor Green
$remaining = Invoke-RestMethod -Uri $baseUrl -Method Get
$remaining | ConvertTo-Json

# 9. Validation Test (Expected 400 Bad Request)
Write-Host "`n[POST] Validation Error Test (Negative amount, missing category):" -ForegroundColor Yellow
try {
    $invalid = @{
        amount = -5.00
        category = ""
        date = $null
    } | ConvertTo-Json
    Invoke-RestMethod -Uri $baseUrl -Method Post -ContentType "application/json" -Body $invalid
} catch {
    $responseStream = $_.Exception.Response.GetResponseStream()
    $reader = New-Object System.IO.StreamReader($responseStream)
    Write-Host "Received expected 400 Bad Request:" -ForegroundColor Green
    Write-Host $reader.ReadToEnd()
}
