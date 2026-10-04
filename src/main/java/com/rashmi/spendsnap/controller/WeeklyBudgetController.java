package com.rashmi.spendsnap.controller;

import com.rashmi.spendsnap.dto.WeeklyBudgetRequest;
import com.rashmi.spendsnap.dto.WeeklyBudgetResponse;
import com.rashmi.spendsnap.service.WeeklyBudgetService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/budgets/weekly")
@CrossOrigin(origins = "*")
public class WeeklyBudgetController {

    private final WeeklyBudgetService weeklyBudgetService;

    public WeeklyBudgetController(WeeklyBudgetService weeklyBudgetService) {
        this.weeklyBudgetService = weeklyBudgetService;
    }

    @GetMapping
    public ResponseEntity<WeeklyBudgetResponse> getWeeklyBudget(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate weekStartDate) {
        WeeklyBudgetResponse response = weeklyBudgetService.getWeeklyBudget(weekStartDate);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<WeeklyBudgetResponse> setWeeklyBudget(
            @Valid @RequestBody WeeklyBudgetRequest request) {
        WeeklyBudgetResponse response = weeklyBudgetService.setWeeklyBudget(request);
        return ResponseEntity.ok(response);
    }
}
