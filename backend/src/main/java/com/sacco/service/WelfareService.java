package com.sacco.service;

import com.sacco.entity.WelfarePayment;
import com.sacco.entity.WelfareClaim;
import com.sacco.entity.User;
import com.sacco.repository.WelfarePaymentRepository;
import com.sacco.repository.WelfareClaimRepository;
import com.sacco.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WelfareService {

    private final WelfarePaymentRepository welfareRepository;
    private final WelfareClaimRepository welfareClaimRepository;
    private final UserRepository userRepository;

    @Transactional
    public WelfarePayment logPayment(UUID userId, Double amount, String period) {
        User user = userRepository.findById(userId).orElseThrow();

        WelfarePayment payment = new WelfarePayment();
        payment.setUser(user);
        payment.setAmount(amount);
        payment.setPeriod(period); // e.g., "2025-01"
        payment.setPaymentDate(LocalDateTime.now());

        return welfareRepository.save(payment);
    }

    public List<WelfarePayment> getHistory(UUID userId) {
        return welfareRepository.findByUserIdOrderByPaymentDateDesc(userId);
    }

    public Double getBalance(UUID userId) {
        Double totalPaid = welfareRepository.findByUserIdOrderByPaymentDateDesc(userId).stream()
                .mapToDouble(WelfarePayment::getAmount)
                .sum();
        Double totalClaimed = welfareClaimRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .filter(c -> "paid".equalsIgnoreCase(c.getStatus()))
                .mapToDouble(WelfareClaim::getAmount)
                .sum();
        return totalPaid - totalClaimed;
    }

    @Transactional
    public WelfareClaim submitClaim(UUID userId, WelfareClaim claim) {
        User user = userRepository.findById(userId).orElseThrow();
        claim.setUser(user);
        claim.setStatus("pending");
        claim.setCreatedAt(LocalDateTime.now());
        return welfareClaimRepository.save(claim);
    }

    public List<WelfareClaim> getClaimHistory(UUID userId) {
        return welfareClaimRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}
