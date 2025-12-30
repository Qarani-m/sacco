package com.sacco.controller;

import com.sacco.dto.LoanRequest;
import com.sacco.entity.Loan;
import com.sacco.service.LoanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/loans")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LoanController {

    private final LoanService loanService;
    private final com.sacco.repository.UserRepository userRepository;

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/request")
    public ResponseEntity<Loan> requestLoan(@RequestBody LoanRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(loanService.requestLoan(getUserId(userDetails), request));
    }

    @GetMapping("/my-loans")
    public ResponseEntity<List<Loan>> getMyLoans(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(loanService.getMyLoans(getUserId(userDetails)));
    }

    @GetMapping("/all")
    public ResponseEntity<List<Loan>> getAllLoans() {
        // In real app, check @PreAuthorize("hasRole('ADMIN')")
        return ResponseEntity.ok(loanService.getAllLoans());
    }

    // Admin actions would go here

    @PostMapping("/{id}/repay")
    public ResponseEntity<com.sacco.entity.LoanRepayment> repayLoan(@PathVariable UUID id,
            @RequestBody java.util.Map<String, Double> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(loanService.repayLoan(getUserId(userDetails), id, payload.get("amount")));
    }

    @GetMapping("/{id}/schedule")
    public ResponseEntity<List<java.util.Map<String, Object>>> getRepaymentSchedule(@PathVariable UUID id) {
        return ResponseEntity.ok(loanService.getRepaymentSchedule(id));
    }

    @GetMapping("/{id}/guarantors")
    public ResponseEntity<List<com.sacco.entity.LoanGuarantor>> getLoanGuarantors(@PathVariable UUID id) {
        return ResponseEntity.ok(loanService.getLoanGuarantors(id));
    }

    @GetMapping("/eligibility")
    public ResponseEntity<java.util.Map<String, Object>> checkEligibility(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(loanService.checkEligibility(getUserId(userDetails)));
    }

    @DeleteMapping("/{id}/cancel")
    public ResponseEntity<Void> cancelLoan(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        loanService.cancelLoanRequest(getUserId(userDetails), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/max-amount")
    public ResponseEntity<java.util.Map<String, Double>> getMaxAmount(
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity
                .ok(java.util.Map.of("maxAmount", loanService.calculateMaxLoanAmount(getUserId(userDetails))));
    }

    @GetMapping("/guarantors-needed")
    public ResponseEntity<java.util.Map<String, Integer>> getGuarantorsNeeded(@RequestParam Double amount) {
        return ResponseEntity.ok(java.util.Map.of("count", loanService.calculateGuarantorsNeeded(amount)));
    }
}
