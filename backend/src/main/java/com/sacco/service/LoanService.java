package com.sacco.service;

import com.sacco.dto.LoanRequest;
import com.sacco.entity.Loan;
import com.sacco.entity.LoanRepayment;
import com.sacco.entity.Transaction;
import com.sacco.entity.User;
import com.sacco.repository.LoanRepaymentRepository;
import com.sacco.repository.LoanRepository;
import com.sacco.repository.ShareRepository;
import com.sacco.repository.TransactionRepository;
import com.sacco.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LoanService {

    private final LoanRepository loanRepository;
    private final ShareRepository shareRepository;
    private final UserRepository userRepository;
    private final LoanRepaymentRepository loanRepaymentRepository;
    private final TransactionRepository transactionRepository;

    public Loan requestLoan(UUID userId, LoanRequest request) {
        User user = userRepository.findById(userId).orElseThrow();

        // 1. Check eligibility (3x shares)
        // Note: For parity, we need simplified logic first
        // In real app, we check if they have active loans etc.

        Loan loan = new Loan();
        loan.setBorrower(user);
        loan.setRequestedAmount(request.getAmount());
        loan.setRepaymentMonths(request.getRepaymentMonths());
        loan.setStatus("pending");
        loan.setBalanceRemaining(request.getAmount()); // Initial
        loan.setCreatedAt(LocalDateTime.now());
        loan.setInterestRate(10.0); // Hardcoded for now

        return loanRepository.save(loan);
    }

    public List<Loan> getMyLoans(UUID userId) {
        return loanRepository.findByBorrowerIdOrderByCreatedAtDesc(userId);
    }

    public List<Loan> getAllLoans() {
        return loanRepository.findAll();
    }

    @Transactional
    public LoanRepayment repayLoan(UUID userId, UUID loanId, Double amount) {
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));

        if (!loan.getBorrower().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }

        // Create Transaction
        Transaction tx = new Transaction();
        tx.setUser(loan.getBorrower());
        tx.setAmount(amount);
        tx.setType("credit");
        tx.setCategory("loan_repayment");
        tx.setStatus("completed");
        tx.setDescription("Repayment for Loan " + loan.getId().toString().substring(0, 8));
        tx.setCreatedAt(LocalDateTime.now());
        tx.setReference("REP-" + UUID.randomUUID().toString().substring(0, 8));
        transactionRepository.save(tx);

        // Create Repayment Record
        LoanRepayment repayment = new LoanRepayment();
        repayment.setLoan(loan);
        repayment.setAmount(amount);
        repayment.setPaidAt(LocalDateTime.now());
        repayment.setTransaction(tx);
        loanRepaymentRepository.save(repayment);

        // Update Loan Balance
        loan.setBalanceRemaining(Math.max(0, loan.getBalanceRemaining() - amount));
        if (loan.getBalanceRemaining() <= 0) {
            loan.setStatus("completed");
        }
        loanRepository.save(loan);

        return repayment;
    }

    public List<Map<String, Object>> getRepaymentSchedule(UUID loanId) {
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));
        List<Map<String, Object>> schedule = new ArrayList<>();

        double monthlyPrincipal = loan.getApprovedAmount() / loan.getRepaymentMonths();
        double monthlyInterest = (loan.getApprovedAmount() * (loan.getInterestRate() / 100))
                / loan.getRepaymentMonths();

        for (int i = 1; i <= loan.getRepaymentMonths(); i++) {
            Map<String, Object> entry = new HashMap<>();
            entry.put("month", i);
            entry.put("principal", monthlyPrincipal);
            entry.put("interest", monthlyInterest);
            entry.put("total", monthlyPrincipal + monthlyInterest);
            entry.put("dueDate", loan.getCreatedAt().plusMonths(i));
            schedule.add(entry);
        }

        return schedule;
    }

    public List<com.sacco.entity.LoanGuarantor> getLoanGuarantors(UUID loanId) {
        return ((com.sacco.repository.LoanGuarantorRepository) loanGuarantorRepository).findByLoanId(loanId);
    }

    // Need to inject this repository or use a wrapper
    private final com.sacco.repository.LoanGuarantorRepository loanGuarantorRepository;

    public Map<String, Object> checkEligibility(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        long activeLoans = loanRepository.findByBorrowerIdOrderByCreatedAtDesc(userId).stream()
                .filter(l -> "active".equalsIgnoreCase(l.getStatus()))
                .count();

        double totalSavings = 0.0; // Savings logic would go here

        Map<String, Object> eligibility = new HashMap<>();
        eligibility.put("isEligible", activeLoans == 0);
        eligibility.put("maxAmount", 100000.0); // Mock limit based on savings/shares
        eligibility.put("reason", activeLoans > 0 ? "You have an active loan" : "Available");

        return eligibility;
    }

    public void cancelLoanRequest(UUID userId, UUID loanId) {
        Loan loan = loanRepository.findById(loanId).orElseThrow();
        if (!loan.getBorrower().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        if (!"pending".equalsIgnoreCase(loan.getStatus())) {
            throw new RuntimeException("Only pending loans can be cancelled");
        }
        loan.setStatus("cancelled");
        loanRepository.save(loan);
    }

    public Double calculateMaxLoanAmount(UUID userId) {
        // Business Rule: 3x total shares
        Integer totalShares = shareRepository.getTotalSharesByUser(userId);
        return totalShares * 500.0 * 3.0; // 500 is SHARE_PRICE
    }

    public Integer calculateGuarantorsNeeded(Double amount) {
        // Business Rule: 1 guarantor for every 100,000 beyond first 50,000
        if (amount <= 50000)
            return 0;
        return (int) Math.ceil((amount - 50000) / 100000.0);
    }
}
