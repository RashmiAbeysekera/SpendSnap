package com.rashmi.spendsnap.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.rashmi.spendsnap.dto.IncomeRequest;
import com.rashmi.spendsnap.model.Income;
import com.rashmi.spendsnap.repository.IncomeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class IncomeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IncomeRepository incomeRepository;

    @BeforeEach
    void setUp() {
        incomeRepository.deleteAll();
    }

    @Test
    void shouldCreateIncomeSuccessfully() throws Exception {
        IncomeRequest request = new IncomeRequest(
                new BigDecimal("1500.00"),
                LocalDate.of(2026, 10, 6),
                "Tutoring pocket money"
        );

        mockMvc.perform(post("/api/incomes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.amount").value(1500.00))
                .andExpect(jsonPath("$.date").value("2026-10-06"))
                .andExpect(jsonPath("$.source").value("Tutoring pocket money"));
    }

    @Test
    void shouldRejectInvalidIncome() throws Exception {
        IncomeRequest invalid = new IncomeRequest(
                new BigDecimal("-200.00"),
                null,
                "Invalid"
        );

        mockMvc.perform(post("/api/incomes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalid)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.amount").exists())
                .andExpect(jsonPath("$.validationErrors.date").exists());
    }

    @Test
    void shouldFilterIncomesByDateRange() throws Exception {
        incomeRepository.save(new Income(new BigDecimal("1000.00"), LocalDate.of(2026, 10, 1), "Gift"));
        incomeRepository.save(new Income(new BigDecimal("2500.00"), LocalDate.of(2026, 10, 7), "Part-time job"));
        incomeRepository.save(new Income(new BigDecimal("800.00"), LocalDate.of(2026, 10, 15), "Freelance gig"));

        mockMvc.perform(get("/api/incomes")
                        .param("startDate", "2026-10-05")
                        .param("endDate", "2026-10-11"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].source").value("Part-time job"));
    }

    @Test
    void shouldDeleteIncomeById() throws Exception {
        Income saved = incomeRepository.save(new Income(new BigDecimal("500.00"), LocalDate.of(2026, 10, 8), "Refund"));

        mockMvc.perform(delete("/api/incomes/{id}", saved.getId()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/incomes/{id}", saved.getId()))
                .andExpect(status().isNotFound());
    }
}
