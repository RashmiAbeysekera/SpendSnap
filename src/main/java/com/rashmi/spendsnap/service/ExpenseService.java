package com.rashmi.spendsnap.service;

import com.rashmi.spendsnap.dto.ExpenseRequest;
import com.rashmi.spendsnap.dto.ExpenseResponse;
import com.rashmi.spendsnap.exception.ResourceNotFoundException;
import com.rashmi.spendsnap.model.Expense;
import com.rashmi.spendsnap.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public ExpenseResponse createExpense(ExpenseRequest request) {
        Expense expense = new Expense(
                request.getAmount(),
                request.getCategory().trim(),
                request.getDate(),
                request.getNote() != null ? request.getNote().trim() : null
        );
        Expense savedExpense = expenseRepository.save(expense);
        return ExpenseResponse.fromEntity(savedExpense);
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAllExpenses(String category, LocalDate startDate, LocalDate endDate) {
        String cleanCategory = (category != null && !category.trim().isEmpty()) ? category.trim() : null;
        List<Expense> expenses = expenseRepository.filterExpenses(cleanCategory, startDate, endDate);
        return expenses.stream()
                .map(ExpenseResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public ExpenseResponse getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        return ExpenseResponse.fromEntity(expense);
    }

    public ExpenseResponse updateExpense(Long id, ExpenseRequest request) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));

        expense.setAmount(request.getAmount());
        expense.setCategory(request.getCategory().trim());
        expense.setDate(request.getDate());
        expense.setNote(request.getNote() != null ? request.getNote().trim() : null);

        Expense updatedExpense = expenseRepository.save(expense);
        return ExpenseResponse.fromEntity(updatedExpense);
    }

    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found with id: " + id);
        }
        expenseRepository.deleteById(id);
    }
}
