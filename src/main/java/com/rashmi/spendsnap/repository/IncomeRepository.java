package com.rashmi.spendsnap.repository;

import com.rashmi.spendsnap.model.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {

    @Query("SELECT i FROM Income i WHERE " +
           "(:startDate IS NULL OR i.date >= :startDate) AND " +
           "(:endDate IS NULL OR i.date <= :endDate) " +
           "ORDER BY i.date DESC, i.id DESC")
    List<Income> filterIncomes(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );
}
