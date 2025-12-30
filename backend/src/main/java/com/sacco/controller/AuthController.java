package com.sacco.controller;

import com.sacco.dto.AuthRequest;
import com.sacco.dto.AuthResponse;
import com.sacco.dto.RegisterRequest;
import com.sacco.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*") // Allow frontend access
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody AuthRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<Void> forgotPassword(@RequestBody java.util.Map<String, String> request) {
        authService.initiatePasswordReset(request.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/reset-password/{token}")
    public ResponseEntity<Void> resetPassword(@PathVariable String token,
            @RequestBody java.util.Map<String, String> request) {
        authService.resetPassword(token, request.get("password"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<Void> resendVerification(@RequestBody java.util.Map<String, String> request) {
        authService.resendVerification(request.get("email"));
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-email/{token}")
    public ResponseEntity<Void> verifyEmail(@PathVariable String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/change-password")
    public ResponseEntity<Void> changePassword(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody java.util.Map<String, String> request) {
        // Find user ID from email
        UUID userId = ((com.sacco.security.UserPrincipal) userDetails).getId();
        authService.changePassword(userId, request.get("oldPassword"), request.get("newPassword"));
        return ResponseEntity.ok().build();
    }
}
