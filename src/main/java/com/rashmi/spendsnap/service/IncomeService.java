package com.rashmi.spendsnap.service;

import com.rashmi.spendsnap.dto.IncomeRequest;
import com.rashmi.spendsnap.dto.IncomeResponse;
import com.rashmi.spendsnap.exception.ResourceNotFoundException;
import com.rashmi.spendsnap.model.Income;
import com.rashmi.spendsnap.repository.IncomeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
@Transactional
public class IncomeService {

    private final IncomeRepository incomeRepository;

    public IncomeService(IncomeRepository incomeRepository) {
        this.incomeRepository = incomeRepository;
    }

    public IncomeResponse createIncome(IncomeRequest request) {
        Income income = new Income(
                request.getAmount(),
                request.getDate(),
                request.getSource() != null ? request.getSource().trim() : null
        );
        Income saved = incomeRepository.save(income);
        return IncomeResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<IncomeResponse> getAllIncomes(LocalDate startDate, LocalDate endDate) {
        return incomeRepository.filterIncomes(startDate, endDate)
                .stream()
                .map(IncomeResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public IncomeResponse getIncomeById(Long id) {
        Income income = incomeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Income entry not found with id: " + id));
        return IncomeResponse.fromEntity(income);
    }

    public void deleteIncome(Long id) {
        if (!incomeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Income entry not found with id: " + id);
        }
        incomeRepository.deleteById(id);
    }
}
