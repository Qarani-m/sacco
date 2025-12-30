package com.sacco.service;

import com.sacco.dto.SavingsTransactionRequest;
import com.sacco.entity.Savings;
import com.sacco.entity.User;
import com.sacco.repository.SavingsRepository;
import com.sacco.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SavingsService {

    private final SavingsRepository savingsRepository;
    private final UserRepository userRepository;

    @Transactional
    public Savings deposit(UUID userId, SavingsTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Savings savings = new Savings();
        savings.setUser(user);
        savings.setAmount(request.getAmount());
        savings.setTransactionType("deposit");
        savings.setTransactionDate(LocalDateTime.now());
        savings.setDescription(request.getDescription() != null ? request.getDescription() : "Deposit");

        return savingsRepository.save(savings);
    }

    @Transactional
    public Savings withdraw(UUID userId, SavingsTransactionRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Double currentBalance = getTotalSavings(userId);
        if (currentBalance < request.getAmount()) {
            throw new RuntimeException("Insufficient funds");
        }

        Savings savings = new Savings();
        savings.setUser(user);
        savings.setAmount(-request.getAmount()); // Negative for withdrawal
        savings.setTransactionType("withdrawal");
        savings.setTransactionDate(LocalDateTime.now());
        savings.setDescription(request.getDescription() != null ? request.getDescription() : "Withdrawal");

        return savingsRepository.save(savings);
    }

    public Double getTotalSavings(UUID userId) {
        return savingsRepository.getTotalSavingsByUser(userId);
    }

    public List<Savings> getHistory(UUID userId) {
        return savingsRepository.findByUserIdOrderByTransactionDateDesc(userId);
    }
}
