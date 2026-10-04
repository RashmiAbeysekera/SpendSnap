package com.rashmi.spendsnap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rashmi.spendsnap.dto.ExpenseRequest;
import com.rashmi.spendsnap.model.Expense;
import com.rashmi.spendsnap.repository.ExpenseRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ExpenseRepository expenseRepository;

    @BeforeEach
    void setUp() {
        expenseRepository.deleteAll();
    }

    @Test
    void shouldCreateExpenseSuccessfully() throws Exception {
        ExpenseRequest request = new ExpenseRequest(
                new BigDecimal("45.50"),
                "Groceries",
                LocalDate.of(2026, 10, 4),
                "Weekly supermarket shopping"
        );

        mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.amount").value(45.50))
                .andExpect(jsonPath("$.category").value("Groceries"))
                .andExpect(jsonPath("$.date").value("2026-10-04"))
                .andExpect(jsonPath("$.note").value("Weekly supermarket shopping"));
    }

    @Test
    void shouldReturnBadRequestWhenCreatingExpenseWithInvalidData() throws Exception {
        // Missing category and negative amount
        ExpenseRequest invalidRequest = new ExpenseRequest(
                new BigDecimal("-10.00"),
                "",
                null,
                "Invalid"
        );

        mockMvc.perform(post("/api/expenses")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.error").value("Validation Failed"))
                .andExpect(jsonPath("$.validationErrors.amount").exists())
                .andExpect(jsonPath("$.validationErrors.category").exists())
                .andExpect(jsonPath("$.validationErrors.date").exists());
    }

    @Test
    void shouldGetAllExpensesAndFilterByCategoryAndDate() throws Exception {
        expenseRepository.save(new Expense(new BigDecimal("12.00"), "Food", LocalDate.of(2026, 10, 1), "Lunch"));
        expenseRepository.save(new Expense(new BigDecimal("30.00"), "Transport", LocalDate.of(2026, 10, 2), "Fuel"));
        expenseRepository.save(new Expense(new BigDecimal("25.00"), "Food", LocalDate.of(2026, 10, 3), "Dinner"));

        // Test list all
        mockMvc.perform(get("/api/expenses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(3)));

        // Test filter by category
        mockMvc.perform(get("/api/expenses").param("category", "Food"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].category").value("Food"))
                .andExpect(jsonPath("$[1].category").value("Food"));

        // Test filter by date range
        mockMvc.perform(get("/api/expenses")
                        .param("startDate", "2026-10-02")
                        .param("endDate", "2026-10-03"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)));
    }

    @Test
    void shouldGetExpenseById() throws Exception {
        Expense saved = expenseRepository.save(new Expense(new BigDecimal("15.75"), "Books", LocalDate.of(2026, 10, 4), "Novel"));

        mockMvc.perform(get("/api/expenses/{id}", saved.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId()))
                .andExpect(jsonPath("$.category").value("Books"))
                .andExpect(jsonPath("$.amount").value(15.75));
    }

    @Test
    void shouldReturn404WhenExpenseNotFound() throws Exception {
        mockMvc.perform(get("/api/expenses/{id}", 9999L))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.message").value("Expense not found with id: 9999"));
    }

    @Test
    void shouldUpdateExpenseSuccessfully() throws Exception {
        Expense saved = expenseRepository.save(new Expense(new BigDecimal("10.00"), "Snacks", LocalDate.of(2026, 10, 1), "Old note"));

        ExpenseRequest updateRequest = new ExpenseRequest(
                new BigDecimal("14.50"),
                "Snacks & Coffee",
                LocalDate.of(2026, 10, 2),
                "Updated note"
        );

        mockMvc.perform(put("/api/expenses/{id}", saved.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(saved.getId()))
                .andExpect(jsonPath("$.amount").value(14.50))
                .andExpect(jsonPath("$.category").value("Snacks & Coffee"))
                .andExpect(jsonPath("$.date").value("2026-10-02"))
                .andExpect(jsonPath("$.note").value("Updated note"));
    }

    @Test
    void shouldDeleteExpenseSuccessfully() throws Exception {
        Expense saved = expenseRepository.save(new Expense(new BigDecimal("10.00"), "Snacks", LocalDate.of(2026, 10, 1), ""));

        mockMvc.perform(delete("/api/expenses/{id}", saved.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/expenses/{id}", saved.getId()))
                .andExpect(status().isNotFound());
    }
}
