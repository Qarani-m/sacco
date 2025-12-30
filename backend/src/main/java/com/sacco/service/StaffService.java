package com.sacco.service;

import com.sacco.entity.*;
import com.sacco.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final SavingsRepository savingsRepository;
    private final MessageRepository messageRepository;

    // ==================== Finance Dashboard ====================

    public Map<String, Object> getFinanceDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        List<Loan> allLoans = loanRepository.findAll();
        double totalDisbursed = allLoans.stream()
                .filter(l -> "active".equalsIgnoreCase(l.getStatus()) || "completed".equalsIgnoreCase(l.getStatus()))
                .mapToDouble(Loan::getApprovedAmount)
                .sum();

        double totalExpectedRepayment = allLoans.stream()
                .filter(l -> "active".equalsIgnoreCase(l.getStatus()))
                .mapToDouble(l -> l.getApprovedAmount()
                        * (1 + (l.getInterestRate() != null ? l.getInterestRate() : 0) / 100.0))
                .sum();

        dashboard.put("totalDisbursed", totalDisbursed);
        dashboard.put("activeLoansValue", totalExpectedRepayment); // Rough estimate
        dashboard.put("totalSavings", savingsRepository.findAll().stream()
                .mapToDouble(s -> s.getAmount() != null ? s.getAmount() : 0.0).sum());

        // Mock daily collections data
        List<Map<String, Object>> dailyCollections = new ArrayList<>();
        Map<String, Object> today = new HashMap<>();
        today.put("date", LocalDateTime.now().toString());
        today.put("amount", 15000.0);
        dailyCollections.add(today);
        dashboard.put("dailyCollections", dailyCollections);

        return dashboard;
    }

    public List<Map<String, Object>> getCollectionsTracking() {
        // Mock data for collections
        return List.of();
    }

    // ==================== Risk Dashboard ====================

    public Map<String, Object> getRiskDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        List<Loan> allLoans = loanRepository.findAll();
        long activeLoans = allLoans.stream().filter(l -> "active".equalsIgnoreCase(l.getStatus())).count();
        long defaultedLoans = allLoans.stream().filter(l -> "defaulted".equalsIgnoreCase(l.getStatus())).count(); // Assuming
                                                                                                                  // 'defaulted'
                                                                                                                  // status
                                                                                                                  // exists

        double par30 = 0.05; // Portfolio at Risk > 30 days (Mock)

        dashboard.put("portfolioAtRisk", par30);
        dashboard.put("defaultRate", activeLoans > 0 ? (double) defaultedLoans / activeLoans : 0.0);
        dashboard.put("totalHighRiskLoans", defaultedLoans);

        return dashboard;
    }

    public List<Loan> getDefaulters() {
        return loanRepository.findByStatus("defaulted");
    }

    // ==================== Disbursement Dashboard ====================

    public Map<String, Object> getDisbursementDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        long pending = loanRepository.countByStatus("approved"); // Approved but not disbursed
        long processedToday = 5; // Mock

        dashboard.put("pendingDisbursements", pending);
        dashboard.put("processedToday", processedToday);
        dashboard.put("availableLiquidity", 5000000.0); // Mock

        return dashboard;
    }

    public List<Loan> getPendingDisbursements() {
        return loanRepository.findByStatus("approved");
    }

    // ==================== Customer Service Dashboard ====================

    public Map<String, Object> getCustomerServiceDashboard() {
        Map<String, Object> dashboard = new HashMap<>();

        long openTickets = messageRepository.count(); // Using messages as tickets for now
        long unreadMessages = messageRepository.findAll().stream().filter(m -> !m.isRead()).count();

        dashboard.put("openTickets", openTickets);
        dashboard.put("unreadMessages", unreadMessages);
        dashboard.put("averageResponseTime", "2.5 hours");

        return dashboard;
    }
}
