package com.sacco.service;

import com.sacco.dto.SharePurchaseRequest;
import com.sacco.entity.Share;
import com.sacco.entity.User;
import com.sacco.repository.ShareRepository;
import com.sacco.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShareService {

    private final ShareRepository shareRepository;
    private final UserRepository userRepository;
    private final com.sacco.repository.LoanGuarantorRepository guarantorRepository;
    private final com.sacco.repository.LoanRepository loanRepository;

    // Constant from Node.js code
    private static final double SHARE_PRICE = 500.0;

    @Transactional
    public Share purchaseShares(UUID userId, SharePurchaseRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        double totalCost = request.getQuantity() * SHARE_PRICE;

        // Logic for checking balance would go here if paid via savings
        // For now, assuming direct payment flow (MPesa) logged here

        Share share = new Share();
        share.setUser(user);
        share.setQuantity(request.getQuantity());
        share.setAmountPaid(totalCost);
        share.setPurchaseDate(LocalDateTime.now());
        share.setStatus("active");

        return shareRepository.save(share);
    }

    public Integer getTotalShares(UUID userId) {
        return shareRepository.getTotalSharesByUser(userId);
    }

    public Double getShareValue(UUID userId) {
        Integer totalShares = getTotalShares(userId);
        return totalShares * SHARE_PRICE;
    }

    public List<Share> getHistory(UUID userId) {
        return shareRepository.findByUserIdOrderByPurchaseDateDesc(userId);
    }

    // Logic for available shares (considering guarantees)
    // This requires Loan repository access or a separate CalculationService to
    // avoid circular deps
    public Integer getAvailableShares(UUID userId) {
        Integer activeShares = shareRepository.getActiveSharesByUser(userId);

        // Subtract shares locked by guaranteeing others
        Integer pledgedToOthers = guarantorRepository.findByGuarantorIdAndStatus(userId, "accepted").stream()
                .mapToInt(g -> g.getSharesPledged() != null ? g.getSharesPledged() : 0)
                .sum();

        // Subtract shares locked by own loans (Self Guarantee logic if applicable)
        // For now, focusing on pledgedToOthers as primary locking mechanism

        return Math.max(0, activeShares - pledgedToOthers);
    }
}
