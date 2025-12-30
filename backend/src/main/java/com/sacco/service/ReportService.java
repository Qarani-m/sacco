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
public class ReportService {

    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final SavingsRepository savingsRepository;
    private final ShareRepository shareRepository;
    private final WelfarePaymentRepository welfarePaymentRepository;
    private final ReportRepository reportRepository;

    // ==================== Report Generation ====================

    public Map<String, Object> getLoanPortfolioReport() {
        List<Loan> allLoans = loanRepository.findAll();

        Map<String, Object> report = new HashMap<>();
        report.put("totalLoans", allLoans.size());
        report.put("totalValue", allLoans.stream().mapToDouble(Loan::getRequestedAmount).sum());
        report.put("activeLoans", allLoans.stream().filter(l -> "active".equalsIgnoreCase(l.getStatus())).count());
        report.put("totalActiveValue", allLoans.stream()
                .filter(l -> "active".equalsIgnoreCase(l.getStatus()))
                .mapToDouble(Loan::getRequestedAmount).sum());

        Map<String, Long> statusDistribution = allLoans.stream()
                .collect(Collectors.groupingBy(Loan::getStatus, Collectors.counting()));
        report.put("statusDistribution", statusDistribution);

        return report;
    }

    public Map<String, Object> getMemberStatsReport() {
        List<User> users = userRepository.findAll();

        Map<String, Object> report = new HashMap<>();
        report.put("totalMembers", users.size());
        report.put("activeMembers", users.stream().filter(User::isActive).count());
        report.put("verifiedEmails", users.stream().filter(User::isEmailVerified).count());

        // This assumes createdAt exists on BaseEntity
        Map<Integer, Long> registrationGrowth = users.stream()
                .collect(Collectors.groupingBy(u -> u.getCreatedAt().getYear(), Collectors.counting()));
        report.put("yearlyRegistrations", registrationGrowth);

        return report;
    }

    public Map<String, Object> getFinancialSummary() {
        double totalSavings = savingsRepository.findAll().stream()
                .mapToDouble(s -> s.getAmount() != null ? s.getAmount() : 0.0)
                .sum(); // Need better query for this ideally

        double totalShares = shareRepository.findAll().stream()
                .mapToDouble(s -> s.getQuantity() != null ? s.getQuantity() * 100.0 : 0.0) // Assuming 100
                                                                                           // per share
                .sum();

        List<Loan> loans = loanRepository.findAll();
        double totalLoaned = loans.stream()
                .filter(l -> "active".equalsIgnoreCase(l.getStatus()) || "completed".equalsIgnoreCase(l.getStatus()))
                .mapToDouble(Loan::getApprovedAmount)
                .sum();

        Map<String, Object> report = new HashMap<>();
        report.put("totalSavings", totalSavings);
        report.put("totalSharesValue", totalShares);
        report.put("totalLoanedOut", totalLoaned);
        report.put("totalWelfare", welfarePaymentRepository.count() * 200.0); // Rough estimate

        return report;
    }

    // Stub for async report generation
    public Report generateReportAsync(String type, User user) {
        Report report = new Report();
        report.setReportType(type);
        report.setGeneratedBy(user);
        report.setStatus("PENDING");
        report.setCreatedAt(LocalDateTime.now());

        return reportRepository.save(report);
    }
}
