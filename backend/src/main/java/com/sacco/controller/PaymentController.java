package com.sacco.controller;

import com.sacco.dto.PaymentRequest;
import com.sacco.entity.Transaction;
import com.sacco.service.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PaymentController {

    private final PaymentService paymentService;
    private final com.sacco.repository.UserRepository userRepository;

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/initiate")
    public ResponseEntity<Transaction> initiate(@RequestBody PaymentRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentService.initiatePayment(getUserId(userDetails), request));
    }

    // For testing/simulation
    @PostMapping("/mock-callback/{reference}")
    public ResponseEntity<Transaction> mockCallback(@PathVariable String reference) {
        return ResponseEntity.ok(paymentService.completePayment(reference));
    }

    @GetMapping("/history")
    public ResponseEntity<java.util.List<Transaction>> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(paymentService.getHistory(getUserId(userDetails)));
    }

    @GetMapping("/status/{reference}")
    public ResponseEntity<Transaction> getStatus(@PathVariable String reference) {
        return ResponseEntity.ok(paymentService.completePayment(reference)); // Simulates polling/checking
    }

    @PostMapping("/verify")
    public ResponseEntity<Transaction> verify(@RequestBody java.util.Map<String, String> body) {
        return ResponseEntity.ok(paymentService.completePayment(body.get("reference")));
    }
}
