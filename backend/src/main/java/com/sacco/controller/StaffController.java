package com.sacco.controller;

import com.sacco.entity.Loan;
import com.sacco.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
public class StaffController {

    private final StaffService staffService;

    // ==================== Finance ====================

    @GetMapping("/finance/dashboard")
    @PreAuthorize("hasRole('FINANCE') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getFinanceDashboard() {
        return ResponseEntity.ok(staffService.getFinanceDashboard());
    }

    @GetMapping("/finance/collections")
    @PreAuthorize("hasRole('FINANCE') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getCollections() {
        return ResponseEntity.ok(staffService.getCollectionsTracking());
    }

    // ==================== Risk ====================

    @GetMapping("/risk/dashboard")
    @PreAuthorize("hasRole('RISK') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getRiskDashboard() {
        return ResponseEntity.ok(staffService.getRiskDashboard());
    }

    @GetMapping("/risk/defaulters")
    @PreAuthorize("hasRole('RISK') or hasRole('ADMIN')")
    public ResponseEntity<List<Loan>> getDefaulters() {
        return ResponseEntity.ok(staffService.getDefaulters());
    }

    // ==================== Disbursement ====================

    @GetMapping("/disbursement/dashboard")
    @PreAuthorize("hasRole('DISBURSEMENT') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDisbursementDashboard() {
        return ResponseEntity.ok(staffService.getDisbursementDashboard());
    }

    @GetMapping("/disbursement/pending")
    @PreAuthorize("hasRole('DISBURSEMENT') or hasRole('ADMIN')")
    public ResponseEntity<List<Loan>> getPendingDisbursements() {
        return ResponseEntity.ok(staffService.getPendingDisbursements());
    }

    // ==================== Customer Service ====================

    @GetMapping("/customer-service/dashboard")
    @PreAuthorize("hasRole('CUSTOMER_SERVICE') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getCustomerServiceDashboard() {
        return ResponseEntity.ok(staffService.getCustomerServiceDashboard());
    }
}
