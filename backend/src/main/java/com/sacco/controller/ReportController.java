package com.sacco.controller;

import com.sacco.entity.Report;
import com.sacco.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final com.sacco.repository.UserRepository userRepository;

    @GetMapping("/loans")
    @PreAuthorize("hasRole('ADMIN') or hasRole('RISK') or hasRole('FINANCE')")
    public ResponseEntity<Map<String, Object>> getLoanPortfolio() {
        return ResponseEntity.ok(reportService.getLoanPortfolioReport());
    }

    @GetMapping("/members")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STAFF')")
    public ResponseEntity<Map<String, Object>> getMemberStats() {
        return ResponseEntity.ok(reportService.getMemberStatsReport());
    }

    @GetMapping("/financial")
    @PreAuthorize("hasRole('ADMIN') or hasRole('FINANCE')")
    public ResponseEntity<Map<String, Object>> getFinancialSummary() {
        return ResponseEntity.ok(reportService.getFinancialSummary());
    }

    @PostMapping("/generate")
    public ResponseEntity<Report> generateReport(
            @RequestParam String type,
            @AuthenticationPrincipal UserDetails userDetails) {
        com.sacco.entity.User user = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
        return ResponseEntity.ok(reportService.generateReportAsync(type, user));
    }
}
