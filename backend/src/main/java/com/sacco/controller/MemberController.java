package com.sacco.controller;

import com.sacco.entity.*;
import com.sacco.service.MemberService;
import com.sacco.service.SavingsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/members")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MemberController {

    private final MemberService memberService;
    private final SavingsService savingsService;
    private final com.sacco.repository.UserRepository userRepository;

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(memberService.getDashboardData(getUserId(userDetails)));
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(memberService.getProfile(getUserId(userDetails)));
    }

    @PutMapping("/profile")
    public ResponseEntity<User> updateProfile(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody User updates) {
        return ResponseEntity.ok(memberService.updateProfile(getUserId(userDetails), updates));
    }

    @PostMapping("/profile/guarantor-settings")
    public ResponseEntity<User> updateGuarantorSettings(@AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, Object> body) {
        boolean canBeGuarantor = (boolean) body.get("canBeGuarantor");
        Double maxShares = Double.valueOf(body.get("maxShares").toString());
        return ResponseEntity
                .ok(memberService.updateGuarantorSettings(getUserId(userDetails), canBeGuarantor, maxShares));
    }

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(memberService.getNotifications(getUserId(userDetails)));
    }

    @PostMapping("/notifications/{id}/read")
    public ResponseEntity<Void> markRead(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id) {
        memberService.markNotificationAsRead(getUserId(userDetails), id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/guarantor-requests")
    public ResponseEntity<List<LoanGuarantor>> getGuarantorRequests(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(memberService.getGuarantorRequests(getUserId(userDetails)));
    }

    @PostMapping("/guarantor-requests/{id}/respond")
    public ResponseEntity<Void> respondRequest(@AuthenticationPrincipal UserDetails userDetails, @PathVariable UUID id,
            @RequestBody Map<String, String> body) {
        memberService.respondToGuarantorRequest(getUserId(userDetails), id, body.get("status"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/registration/pay")
    public ResponseEntity<Void> payRegistration(@AuthenticationPrincipal UserDetails userDetails) {
        memberService.payRegistrationFee(getUserId(userDetails));
        return ResponseEntity.ok().build();
    }

    // Savings fallback for parity
    @GetMapping("/savings/total")
    public ResponseEntity<Map<String, Object>> getSavingsTotal(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(Map.of("totalSavings", savingsService.getTotalSavings(getUserId(userDetails))));
    }
}
