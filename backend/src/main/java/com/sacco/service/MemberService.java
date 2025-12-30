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
public class MemberService {

    private final UserRepository userRepository;
    private final SavingsRepository savingsRepository;
    private final ShareRepository shareRepository;
    private final LoanRepository loanRepository;
    private final NotificationRepository notificationRepository;
    private final LoanGuarantorRepository loanGuarantorRepository;

    public Map<String, Object> getDashboardData(UUID userId) {
        Map<String, Object> data = new HashMap<>();

        User user = userRepository.findById(userId).orElseThrow();
        data.put("user", user);

        double totalSavings = savingsRepository.findByUserIdOrderByTransactionDateDesc(userId).stream()
                .mapToDouble(s -> s.getAmount() != null ? s.getAmount() : 0.0)
                .sum();
        data.put("totalSavings", totalSavings);

        int totalShares = shareRepository.findByUserIdOrderByPurchaseDateDesc(userId).stream()
                .mapToInt(s -> s.getQuantity() != null ? s.getQuantity() : 0)
                .sum();
        data.put("totalShares", totalShares);

        List<Loan> myLoans = loanRepository.findByBorrowerIdOrderByCreatedAtDesc(userId);
        data.put("loans", myLoans);

        long unreadNotifications = notificationRepository.findAll().stream()
                .filter(n -> n.getUser().getId().equals(userId) && !n.isRead())
                .count();
        data.put("unreadNotifications", unreadNotifications);

        return data;
    }

    public User getProfile(UUID userId) {
        return userRepository.findById(userId).orElseThrow();
    }

    @Transactional
    public User updateProfile(UUID userId, User updates) {
        User user = userRepository.findById(userId).orElseThrow();
        if (updates.getFullName() != null)
            user.setFullName(updates.getFullName());
        if (updates.getPhoneNumber() != null)
            user.setPhoneNumber(updates.getPhoneNumber());
        return userRepository.save(user);
    }

    @Transactional
    public User updateGuarantorSettings(UUID userId, boolean canBeGuarantor, Double maxShares) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setCanBeGuarantor(canBeGuarantor);
        user.setMaxSharesToGuarantee(maxShares);
        return userRepository.save(user);
    }

    public List<Notification> getNotifications(UUID userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional
    public void markNotificationAsRead(UUID userId, UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId).orElseThrow();
        if (!notification.getUser().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public List<LoanGuarantor> getGuarantorRequests(UUID userId) {
        return loanGuarantorRepository.findByGuarantorIdAndStatus(userId, "pending");
    }

    @Transactional
    public void respondToGuarantorRequest(UUID userId, UUID requestId, String status) {
        LoanGuarantor request = loanGuarantorRepository.findById(requestId).orElseThrow();
        if (!request.getGuarantor().getId().equals(userId)) {
            throw new RuntimeException("Unauthorized");
        }
        request.setStatus(status);
        loanGuarantorRepository.save(request);
    }

    @Transactional
    public void payRegistrationFee(UUID userId) {
        User user = userRepository.findById(userId).orElseThrow();
        user.setRegistrationPaid(true);
        userRepository.save(user);
    }
}
