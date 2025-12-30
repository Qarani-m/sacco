package com.sacco.controller;

import com.sacco.entity.WelfarePayment;
import com.sacco.entity.WelfareClaim;
import com.sacco.service.WelfareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/welfare")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WelfareController {

    private final WelfareService welfareService;
    private final com.sacco.repository.UserRepository userRepository;

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/pay") // In reality this would be triggered by Payment Callback
    public ResponseEntity<WelfarePayment> pay(@RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        Double amount = Double.valueOf(payload.get("amount").toString());
        String period = (String) payload.get("period");
        return ResponseEntity.ok(welfareService.logPayment(getUserId(userDetails), amount, period));
    }

    @GetMapping("/history")
    public ResponseEntity<List<WelfarePayment>> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(welfareService.getHistory(getUserId(userDetails)));
    }

    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(Map.of("balance", welfareService.getBalance(getUserId(userDetails))));
    }

    @GetMapping("/claims")
    public ResponseEntity<List<WelfareClaim>> getClaims(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(welfareService.getClaimHistory(getUserId(userDetails)));
    }

    @PostMapping("/claims")
    public ResponseEntity<WelfareClaim> submitClaim(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody WelfareClaim claim) {
        return ResponseEntity.ok(welfareService.submitClaim(getUserId(userDetails), claim));
    }
}
