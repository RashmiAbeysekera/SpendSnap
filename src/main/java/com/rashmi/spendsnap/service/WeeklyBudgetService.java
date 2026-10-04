package com.rashmi.spendsnap.service;

import com.rashmi.spendsnap.dto.WeeklyBudgetRequest;
import com.rashmi.spendsnap.dto.WeeklyBudgetResponse;
import com.rashmi.spendsnap.model.WeeklyBudget;
import com.rashmi.spendsnap.repository.WeeklyBudgetRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
@Transactional
public class WeeklyBudgetService {

    public static final BigDecimal DEFAULT_ALLOWANCE = new BigDecimal("5000.00");

    private final WeeklyBudgetRepository weeklyBudgetRepository;

    public WeeklyBudgetService(WeeklyBudgetRepository weeklyBudgetRepository) {
        this.weeklyBudgetRepository = weeklyBudgetRepository;
    }

    @Transactional(readOnly = true)
    public WeeklyBudgetResponse getWeeklyBudget(LocalDate weekStartDate) {
        return weeklyBudgetRepository.findByWeekStartDate(weekStartDate)
                .map(WeeklyBudgetResponse::fromEntity)
                .orElseGet(() -> new WeeklyBudgetResponse(null, weekStartDate, DEFAULT_ALLOWANCE));
    }

    public WeeklyBudgetResponse setWeeklyBudget(WeeklyBudgetRequest request) {
        WeeklyBudget budget = weeklyBudgetRepository.findByWeekStartDate(request.getWeekStartDate())
                .orElseGet(() -> new WeeklyBudget(request.getWeekStartDate(), request.getAllowance()));

        budget.setAllowance(request.getAllowance());
        WeeklyBudget saved = weeklyBudgetRepository.save(budget);
        return WeeklyBudgetResponse.fromEntity(saved);
    }
}
