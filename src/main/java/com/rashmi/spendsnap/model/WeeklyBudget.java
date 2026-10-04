package com.rashmi.spendsnap.model;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "weekly_budgets")
public class WeeklyBudget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private LocalDate weekStartDate;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal allowance;

    public WeeklyBudget() {
    }

    public WeeklyBudget(LocalDate weekStartDate, BigDecimal allowance) {
        this.weekStartDate = weekStartDate;
        this.allowance = allowance;
    }

    public WeeklyBudget(Long id, LocalDate weekStartDate, BigDecimal allowance) {
        this.id = id;
        this.weekStartDate = weekStartDate;
        this.allowance = allowance;
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
