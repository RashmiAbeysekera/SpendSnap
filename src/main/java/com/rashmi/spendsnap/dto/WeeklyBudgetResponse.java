package com.rashmi.spendsnap.dto;

import com.rashmi.spendsnap.model.WeeklyBudget;
import java.math.BigDecimal;
import java.time.LocalDate;

public class WeeklyBudgetResponse {

    private Long id;
    private LocalDate weekStartDate;
    private BigDecimal allowance;

    public WeeklyBudgetResponse() {
    }

    public WeeklyBudgetResponse(Long id, LocalDate weekStartDate, BigDecimal allowance) {
        this.id = id;
        this.weekStartDate = weekStartDate;
        this.allowance = allowance;
    }

    public static WeeklyBudgetResponse fromEntity(WeeklyBudget entity) {
        if (entity == null) {
            return null;
        }
        return new WeeklyBudgetResponse(entity.getId(), entity.getWeekStartDate(), entity.getAllowance());
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
