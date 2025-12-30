package com.sacco.controller;

import com.sacco.entity.PaymentAllocation;
import com.sacco.entity.Transaction;
import com.sacco.service.PaymentAllocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/payment-allocation")
@RequiredArgsConstructor
public class PaymentAllocationController {

    private final PaymentAllocationService allocationService;

    @GetMapping("/pending")
    @PreAuthorize("hasRole('FINANCE') or hasRole('ADMIN')")
    public ResponseEntity<List<Transaction>> getPending() {
        return ResponseEntity.ok(allocationService.getPendingPayments());
    }

    @PostMapping("/allocate")
    @PreAuthorize("hasRole('FINANCE') or hasRole('ADMIN')")
    public ResponseEntity<PaymentAllocation> allocate(@RequestBody Map<String, Object> request) {
        String userIdStr = (String) request.get("userId");
        String txIdStr = (String) request.get("transactionId");
        String type = (String) request.get("type");
        String targetId = (String) request.get("targetId");
        Double amount = Double.valueOf(request.get("amount").toString());

        UUID userId = UUID.fromString(userIdStr);
        UUID txId = txIdStr != null ? UUID.fromString(txIdStr) : null;

        return ResponseEntity.ok(allocationService.allocateManual(userId, txId, type, targetId, amount));
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('FINANCE') or hasRole('ADMIN')")
    public ResponseEntity<List<PaymentAllocation>> getHistory() {
        return ResponseEntity.ok(allocationService.getHistory());
    }

    @PostMapping("/auto-allocate")
    @PreAuthorize("hasRole('FINANCE') or hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> autoAllocate() {
        allocationService.autoAllocate();
        return ResponseEntity.ok(Map.of("message", "Auto-allocation completed"));
    }

    @GetMapping("/rules")
    public ResponseEntity<Map<String, Object>> getRules() {
        return ResponseEntity.ok(allocationService.getRules());
    }
}
