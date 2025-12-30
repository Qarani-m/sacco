package com.sacco.controller;

import com.sacco.entity.*;
import com.sacco.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final com.sacco.service.RoleService roleService;
    private final com.sacco.repository.UserRepository userRepository;

    // ==================== Dashboard ====================

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ==================== Member Management ====================

    @GetMapping("/members")
    public ResponseEntity<List<User>> getAllMembers() {
        return ResponseEntity.ok(adminService.getAllMembers());
    }

    @GetMapping("/members/{id}")
    public ResponseEntity<User> getMemberById(@PathVariable String id) {
        return adminService.getMemberById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/members/{id}")
    public ResponseEntity<User> updateMember(@PathVariable String id, @RequestBody User updates) {
        try {
            User updated = adminService.updateMember(id, updates);
            return ResponseEntity.ok(updated);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/members/{id}/approve")
    public ResponseEntity<Map<String, String>> approveMember(@PathVariable String id) {
        try {
            adminService.approveMember(id);
            return ResponseEntity.ok(Map.of("message", "Member approved successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/members/{id}/suspend")
    public ResponseEntity<Map<String, String>> suspendMember(@PathVariable String id) {
        try {
            adminService.suspendMember(id);
            return ResponseEntity.ok(Map.of("message", "Member suspended successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== Loan Management ====================

    @GetMapping("/loans")
    public ResponseEntity<List<Loan>> getAllLoans(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getAllLoans(status));
    }

    @GetMapping("/loans/{id}")
    public ResponseEntity<Loan> getLoanById(@PathVariable String id) {
        return adminService.getLoanById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/loans/{id}/approve")
    public ResponseEntity<Map<String, String>> approveLoan(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User admin = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            adminService.approveLoan(id, admin);
            return ResponseEntity.ok(Map.of("message", "Loan approved successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/loans/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectLoan(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            adminService.rejectLoan(id, reason);
            return ResponseEntity.ok(Map.of("message", "Loan rejected successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/loans/{id}/disburse")
    public ResponseEntity<Map<String, String>> disburseLoan(@PathVariable String id) {
        try {
            adminService.disburseLoan(id);
            return ResponseEntity.ok(Map.of("message", "Loan disbursed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== Document Verification ====================

    @GetMapping("/documents")
    public ResponseEntity<List<Document>> getAllDocuments(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getAllDocuments(status));
    }

    @GetMapping("/documents/{id}")
    public ResponseEntity<Document> getDocumentById(@PathVariable String id) {
        return adminService.getDocumentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/documents/{id}/approve")
    public ResponseEntity<Map<String, String>> approveDocument(
            @PathVariable String id,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User admin = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            adminService.approveDocument(id, admin);
            return ResponseEntity.ok(Map.of("message", "Document approved successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/documents/{id}/reject")
    public ResponseEntity<Map<String, String>> rejectDocument(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String reason = request.get("reason");
            adminService.rejectDocument(id, reason, null);
            return ResponseEntity.ok(Map.of("message", "Document rejected successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // ==================== Pending Actions (2/3 Approval) ====================

    @GetMapping("/pending-actions")
    public ResponseEntity<List<Map<String, Object>>> getPendingActions() {
        return ResponseEntity.ok(adminService.getPendingActions());
    }

    @PostMapping("/pending-actions/{id}/verify")
    public ResponseEntity<Map<String, String>> verifyAction(
            @PathVariable String id,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User admin = userRepository.findByEmail(userDetails.getUsername()).orElseThrow();
            String decision = request.get("decision");
            String comment = request.get("comment");
            adminService.verifyAction(id, decision, comment, admin);
            return ResponseEntity.ok(Map.of("message", "Action verified successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // ==================== Messages ====================

    @GetMapping("/messages")
    public ResponseEntity<List<Message>> getMessages() {
        return ResponseEntity.ok(adminService.getAdminMessages());
    }

    @GetMapping("/messages/{id}")
    public ResponseEntity<Message> getMessageById(@PathVariable String id) {
        return adminService.getMessageById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/messages/send")
    public ResponseEntity<Message> sendMessage(@RequestBody Message message) {
        Message sent = adminService.sendMessage(message);
        return ResponseEntity.ok(sent);
    }

    // ==================== Notifications ====================

    @GetMapping("/notifications")
    public ResponseEntity<List<Notification>> getNotifications() {
        return ResponseEntity.ok(adminService.getAllNotifications());
    }

    @PostMapping("/notifications/create")
    public ResponseEntity<Notification> createNotification(@RequestBody Notification notification) {
        Notification created = adminService.createNotification(notification);
        return ResponseEntity.ok(created);
    }

    @PostMapping("/notifications/broadcast")
    public ResponseEntity<Map<String, String>> broadcastNotification(@RequestBody Map<String, Object> request) {
        String title = (String) request.get("title");
        String message = (String) request.get("message");
        // Simplified - in production, get recipients from request
        adminService.broadcastNotification(title, message, List.of());
        return ResponseEntity.ok(Map.of("message", "Notification broadcast successfully"));
    }

    // ==================== Roles ====================

    @GetMapping("/roles")
    public ResponseEntity<List<Role>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @GetMapping("/roles/{id}")
    public ResponseEntity<Role> getRoleById(@PathVariable String id) {
        try {
            java.util.UUID uuid = java.util.UUID.fromString(id);
            return ResponseEntity.ok(roleService.getRoleById(uuid));
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
