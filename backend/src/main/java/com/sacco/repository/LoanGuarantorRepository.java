package com.sacco.repository;

import com.sacco.entity.LoanGuarantor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LoanGuarantorRepository extends JpaRepository<LoanGuarantor, UUID> {
    List<LoanGuarantor> findByLoanId(UUID loanId);

    List<LoanGuarantor> findByGuarantorIdAndStatus(UUID guarantorId, String status);
}
