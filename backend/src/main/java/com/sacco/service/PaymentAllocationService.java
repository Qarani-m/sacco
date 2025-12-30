package com.sacco.service;

import com.sacco.entity.*;
import com.sacco.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentAllocationService {

    private final PaymentAllocationRepository allocationRepository;
    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final SavingsRepository savingsRepository;
    private final ShareRepository shareRepository;

    @Transactional
    public PaymentAllocation allocatePayment(UUID transactionId, String allocationType, String targetId,
            Double amount) {
        Transaction transaction = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        // Find user from transaction (assuming relation exists or infer from logic)
        // For simplicity, using transaction.getUser() if available, otherwise would
        // need logic
        // Assuming Transaction has user relation for this migration

        // Mocking user retrieval from transaction logic:
        // Use a dummy query or assuming transaction has a user
        // User user = transaction.getUser();
        // NOTE: Transaction entity might not have user, checking Transaction entity
        // later.
        // For now, let's assume we pass userId or find it

        PaymentAllocation allocation = new PaymentAllocation();
        allocation.setTransaction(transaction);
        // allocation.setUser(user); // FIXME: Need to resolve user
        allocation.setAllocationType(allocationType);
        allocation.setTargetId(targetId);
        allocation.setAmount(amount);

        // Update destination
        updateDestinationBalance(allocationType, targetId, amount);

        return allocationRepository.save(allocation);
    }

    // Adjusted allocate method to take userId since Transaction might be loose
    @Transactional
    public PaymentAllocation allocateManual(UUID userId, UUID transactionId, String type, String targetId,
            Double amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction tx = null;
        if (transactionId != null) {
            tx = transactionRepository.findById(transactionId).orElse(null);
        }

        PaymentAllocation allocation = new PaymentAllocation();
        allocation.setUser(user);
        allocation.setTransaction(tx);
        allocation.setAllocationType(type);
        allocation.setTargetId(targetId);
        allocation.setAmount(amount);

        updateDestinationBalance(type, targetId, amount);

        return allocationRepository.save(allocation);
    }

    private void updateDestinationBalance(String type, String targetId, Double amount) {
        switch (type.toUpperCase()) {
            case "LOAN":
                if (targetId != null) {
                    Loan loan = loanRepository.findById(UUID.fromString(targetId))
                            .orElseThrow(() -> new RuntimeException("Loan not found"));
                    // Logic to reduce loan balance
                    Double currentBal = loan.getBalanceRemaining() != null ? loan.getBalanceRemaining()
                            : loan.getApprovedAmount();
                    loan.setBalanceRemaining(currentBal - amount);
                    if (loan.getBalanceRemaining() <= 0) {
                        loan.setStatus("completed");
                    }
                    loanRepository.save(loan);
                }
                break;
            case "SAVINGS":
                // Create savings record
                // Logic needed
                break;
            case "SHARES":
                // Create share record
                // Logic needed
                break;
        }
    }

    public List<PaymentAllocation> getHistory() {
        return allocationRepository.findAll();
    }

    public List<Transaction> getPendingPayments() {
        // Return unallocated transactions
        // Mock logic: Transactions checks
        return transactionRepository.findAll().stream()
                .filter(t -> !"allocated".equalsIgnoreCase(t.getStatus()))
                .collect(Collectors.toList());
    }

    public void autoAllocate() {
        // Logic to auto allocate based on rules
        // e.g. First pay fines, then interest, then principal, then savings
    }

    public Map<String, Object> getRules() {
        return Map.of(
                "priority", List.of("FINES", "INTEREST", "PRINCIPAL", "SAVINGS"),
                "minSavings", 500);
    }
}
