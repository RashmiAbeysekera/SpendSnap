package com.rashmi.spendsnap.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import java.math.BigDecimal;
import java.time.LocalDate;

public class WeeklyBudgetRequest {

    @NotNull(message = "Week start date is required")
    private LocalDate weekStartDate;

    @NotNull(message = "Allowance is required")
    @PositiveOrZero(message = "Allowance cannot be negative")
    private BigDecimal allowance;

    public WeeklyBudgetRequest() {
    }

    public WeeklyBudgetRequest(LocalDate weekStartDate, BigDecimal allowance) {
        this.weekStartDate = weekStartDate;
        this.allowance = allowance;
    }

    public LocalDate getWeekStartDate() {
        return weekStartDate;
    }

    public void setWeekStartDate(LocalDate weekStartDate) {
        this.weekStartDate = weekStartDate;
    }

    public BigDecimal getAllowance() {
        return allowance;
    }

    public void setAllowance(BigDecimal allowance) {
        this.allowance = allowance;
    }
}
