package com.rashmi.spendsnap.dto;

import com.rashmi.spendsnap.model.Income;
import java.math.BigDecimal;
import java.time.LocalDate;

public class IncomeResponse {

    private Long id;
    private BigDecimal amount;
    private LocalDate date;
    private String source;

    public IncomeResponse() {
    }

    public IncomeResponse(Long id, BigDecimal amount, LocalDate date, String source) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.source = source;
    }

    public static IncomeResponse fromEntity(Income income) {
        if (income == null) {
            return null;
        }
        return new IncomeResponse(
                income.getId(),
                income.getAmount(),
                income.getDate(),
                income.getSource()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public String getSource() {
        return source;
    }

    public void setSource(String source) {
        this.source = source;
    }
}
