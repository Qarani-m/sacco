package com.sacco.service;

import com.sacco.dto.PaymentRequest;
import com.sacco.entity.*;
import com.sacco.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;
    private final MpesaService mpesaService;
    private final WelfareService welfareService;
    private final SavingsService savingsService;
    private final LoanService loanService;

    @Transactional
    public Transaction initiatePayment(UUID userId, PaymentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Transaction tx = new Transaction();
        tx.setUser(user);
        tx.setAmount(request.getAmount());
        tx.setCategory(request.getCategory() != null ? request.getCategory() : request.getType());
        tx.setType("credit");
        tx.setPhoneNumber(request.getPhoneNumber());
        tx.setStatus("pending");
        tx.setDescription("Payment for " + tx.getCategory());
        tx.setCreatedAt(LocalDateTime.now());
        tx.setReference("TRX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        transactionRepository.save(tx);

        // Call M-Pesa STK Push
        Map<String, Object> mpesaResponse = mpesaService.initiateStkPush(
                tx.getPhoneNumber(),
                tx.getAmount(),
                tx.getReference(),
                tx.getDescription());

        if (mpesaResponse.containsKey("MerchantRequestID")) {
            tx.setExternalId((String) mpesaResponse.get("MerchantRequestID"));
            transactionRepository.save(tx);
        }

        return tx;
    }

    // Simulating callback for testing
    @Transactional
    public Transaction completePayment(String reference) {
        Transaction tx = transactionRepository.findByReference(reference)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));

        if (!"pending".equals(tx.getStatus())) {
            return tx;
        }

        tx.setStatus("completed");
        tx.setUpdatedAt(LocalDateTime.now());

        // Business Logic based on Category
        switch (tx.getCategory().toLowerCase()) {
            case "registration":
                User user = tx.getUser();
                user.setRegistrationPaid(true);
                userRepository.save(user);
                break;
            case "welfare":
                welfareService.logPayment(tx.getUser().getId(), tx.getAmount(), "CURRENT");
                break;
            case "savings":
                com.sacco.dto.SavingsTransactionRequest savingsRequest = new com.sacco.dto.SavingsTransactionRequest();
                savingsRequest.setAmount(tx.getAmount());
                savingsRequest.setNotes("Payment via M-Pesa: " + tx.getReference());
                savingsService.deposit(tx.getUser().getId(), savingsRequest);
                break;
            // Additional categories can be added here
        }

        return transactionRepository.save(tx);
    }

    public java.util.List<Transaction> getHistory(UUID userId) {
        return transactionRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
