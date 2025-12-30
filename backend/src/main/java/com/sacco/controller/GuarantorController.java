package com.sacco.controller;

import com.sacco.entity.LoanGuarantor;
import com.sacco.service.GuarantorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/guarantors")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GuarantorController {

    private final GuarantorService guarantorService;
    private final com.sacco.repository.UserRepository userRepository;

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/request")
    public ResponseEntity<LoanGuarantor> request(@RequestBody Map<String, Object> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID loanId = UUID.fromString((String) payload.get("loanId"));
        UUID guarantorId = UUID.fromString((String) payload.get("guarantorId"));
        Integer shares = (Integer) payload.get("shares");

        return ResponseEntity
                .ok(guarantorService.requestGuarantee(getUserId(userDetails), loanId, guarantorId, shares));
    }

    @PostMapping("/respond/{requestId}")
    public ResponseEntity<LoanGuarantor> respond(@PathVariable UUID requestId,
            @RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        String status = payload.get("status"); // accepted / rejected
        return ResponseEntity.ok(guarantorService.respondToRequest(getUserId(userDetails), requestId, status));
    }

    @GetMapping("/requests")
    public ResponseEntity<List<LoanGuarantor>> getMyRequests(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(guarantorService.getRequests(getUserId(userDetails)));
    }
}
