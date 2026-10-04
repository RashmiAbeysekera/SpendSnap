package com.rashmi.spendsnap.repository;

import com.rashmi.spendsnap.model.WeeklyBudget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface WeeklyBudgetRepository extends JpaRepository<WeeklyBudget, Long> {

    Optional<WeeklyBudget> findByWeekStartDate(LocalDate weekStartDate);
}
