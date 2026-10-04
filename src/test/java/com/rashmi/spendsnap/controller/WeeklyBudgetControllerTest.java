package com.rashmi.spendsnap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rashmi.spendsnap.dto.WeeklyBudgetRequest;
import com.rashmi.spendsnap.repository.WeeklyBudgetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class WeeklyBudgetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private WeeklyBudgetRepository weeklyBudgetRepository;

    @BeforeEach
    void setUp() {
        weeklyBudgetRepository.deleteAll();
    }

    @Test
    void shouldReturnDefaultAllowanceWhenNoneSet() throws Exception {
        mockMvc.perform(get("/api/budgets/weekly")
                        .param("weekStartDate", "2026-10-05"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weekStartDate").value("2026-10-05"))
                .andExpect(jsonPath("$.allowance").value(5000.00));
    }

    @Test
    void shouldSetAndRetrieveCustomWeeklyBudget() throws Exception {
        WeeklyBudgetRequest request = new WeeklyBudgetRequest(
                LocalDate.of(2026, 10, 5),
                new BigDecimal("7500.00")
        );

        mockMvc.perform(put("/api/budgets/weekly")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.weekStartDate").value("2026-10-05"))
                .andExpect(jsonPath("$.allowance").value(7500.00));

        // Subsequent GET returns updated value
        mockMvc.perform(get("/api/budgets/weekly")
                        .param("weekStartDate", "2026-10-05"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.allowance").value(7500.00));
    }

    @Test
    void shouldRejectNegativeAllowance() throws Exception {
        WeeklyBudgetRequest invalidRequest = new WeeklyBudgetRequest(
                LocalDate.of(2026, 10, 5),
                new BigDecimal("-500.00")
        );

        mockMvc.perform(put("/api/budgets/weekly")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.validationErrors.allowance").exists());
    }
}
