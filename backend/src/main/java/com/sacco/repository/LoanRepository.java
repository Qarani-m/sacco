package com.sacco.repository;

import com.sacco.entity.Loan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoanRepository extends JpaRepository<Loan, UUID> {

    List<Loan> findByBorrowerIdOrderByCreatedAtDesc(UUID borrowerId);

    // Find active loans count for eligibility check
    long countByBorrowerIdAndStatusIn(UUID borrowerId, List<String> statuses);

    // Admin queries
    List<Loan> findByStatusOrderByCreatedAtDesc(String status);

    List<Loan> findByStatus(String status);

    long countByStatus(String status);
}
