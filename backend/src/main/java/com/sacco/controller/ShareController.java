package com.sacco.controller;

import com.sacco.dto.SharePurchaseRequest;
import com.sacco.entity.Share;
import com.sacco.service.ShareService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/shares")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ShareController {

    private final ShareService shareService;
    private final com.sacco.repository.UserRepository userRepository; // Direct repo access for ID lookup utility

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/purchase")
    public ResponseEntity<Share> purchaseShares(@RequestBody SharePurchaseRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(shareService.purchaseShares(getUserId(userDetails), request));
    }

    @GetMapping("/total")
    public ResponseEntity<Map<String, Object>> getTotal(@AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = getUserId(userDetails);
        Map<String, Object> response = new HashMap<>();
        response.put("totalShares", shareService.getTotalShares(userId));
        response.put("totalValue", shareService.getShareValue(userId));
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<List<Share>> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(shareService.getHistory(getUserId(userDetails)));
    }
}
