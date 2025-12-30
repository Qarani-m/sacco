package com.sacco.service;

import com.sacco.entity.*;
import com.sacco.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final LoanRepository loanRepository;
    private final DocumentRepository documentRepository;
    private final PendingActionRepository pendingActionRepository;
    private final ActionVerificationRepository actionVerificationRepository;
    private final MessageRepository messageRepository;
    private final NotificationRepository notificationRepository;

    // ==================== Dashboard ====================

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalMembers", userRepository.count());
        stats.put("activeMembers", userRepository.countByIsActive(true));
        stats.put("pendingDocuments", documentRepository.countByStatus(Document.DocumentStatus.PENDING));
        stats.put("pendingActions", pendingActionRepository.countByStatus(PendingAction.ActionStatus.PENDING));
        stats.put("totalLoans", loanRepository.count());
        stats.put("pendingLoans", loanRepository.countByStatus("pending"));

        return stats;
    }

    // ==================== Member Management ====================

    public List<User> getAllMembers() {
        return userRepository.findAll();
    }

    public Optional<User> getMemberById(String id) {
        return userRepository.findById(UUID.fromString(id));
    }

    @Transactional
    public User updateMember(String id, User updates) {
        User user = userRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (updates.getFullName() != null)
            user.setFullName(updates.getFullName());
        if (updates.getEmail() != null)
            user.setEmail(updates.getEmail());
        if (updates.getPhoneNumber() != null)
            user.setPhoneNumber(updates.getPhoneNumber());
        if (updates.getRole() != null)
            user.setRole(updates.getRole());

        return userRepository.save(user);
    }

    @Transactional
    public void approveMember(String id) {
        User user = userRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(true);
        user.setEmailVerified(true);
        userRepository.save(user);
    }

    @Transactional
    public void suspendMember(String id) {
        User user = userRepository.findById(UUID.fromString(id))
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setActive(false);
        userRepository.save(user);
    }

    // ==================== Loan Management ====================

    public List<Loan> getAllLoans(String status) {
        if (status != null && !status.isEmpty()) {
            return loanRepository.findByStatus(status);
        }
        return loanRepository.findAll();
    }

    public Optional<Loan> getLoanById(String id) {
        return loanRepository.findById(UUID.fromString(id));
    }

    @Transactional
    public void approveLoan(String loanId, User admin) {
        Loan loan = loanRepository.findById(UUID.fromString(loanId))
                .orElseThrow(() -> new RuntimeException("Loan not found"));

        // Check if requires workflow
        if (requiresWorkflow(loan.getRequestedAmount())) {
            createPendingAction("APPROVE_LOAN", "loan", loanId, "Loan approval", admin);
        } else {
            loan.setStatus("approved");
            loan.setApprovedAmount(loan.getRequestedAmount());
            loanRepository.save(loan);
        }
    }

    @Transactional
    public void rejectLoan(String loanId, String reason) {
        Loan loan = loanRepository.findById(UUID.fromString(loanId))
                .orElseThrow(() -> new RuntimeException("Loan not found"));
        loan.setStatus("rejected");
        loanRepository.save(loan);
    }

    @Transactional
    public void disburseLoan(String loanId) {
        Loan loan = loanRepository.findById(UUID.fromString(loanId))
                .orElseThrow(() -> new RuntimeException("Loan not found"));
        loan.setStatus("active");
        loan.setDisbursedAt(LocalDateTime.now());
        loanRepository.save(loan);
    }

    // ==================== Document Verification ====================

    public List<Document> getAllDocuments(String status) {
        if (status != null && !status.isEmpty()) {
            return documentRepository.findByStatus(Document.DocumentStatus.valueOf(status.toUpperCase()));
        }
        return documentRepository.findAll();
    }

    public Optional<Document> getDocumentById(String id) {
        return documentRepository.findById(id);
    }

    @Transactional
    public void approveDocument(String documentId, User admin) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        document.setStatus(Document.DocumentStatus.APPROVED);
        document.setVerifiedBy(admin);
        documentRepository.save(document);
    }

    @Transactional
    public void rejectDocument(String documentId, String reason, User admin) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));
        document.setStatus(Document.DocumentStatus.REJECTED);
        document.setRejectionReason(reason);
        document.setVerifiedBy(admin);
        documentRepository.save(document);
    }

    // ==================== Pending Actions (2/3 Approval) ====================

    public List<Map<String, Object>> getPendingActions() {
        List<PendingAction> actions = pendingActionRepository
                .findByStatusWithVerifications(PendingAction.ActionStatus.PENDING);

        return actions.stream().map(action -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", action.getId());
            map.put("actionType", action.getActionType());
            map.put("entityType", action.getEntityType());
            map.put("entityId", action.getEntityId());
            map.put("reason", action.getReason());
            map.put("initiatedBy", action.getInitiatedBy().getId());
            map.put("initiatorName", action.getInitiatedBy().getFullName());
            map.put("status", action.getStatus());
            map.put("approvalCount", action.getApprovalCount());
            map.put("createdAt", action.getCreatedAt());

            List<Map<String, Object>> verifications = action.getVerifications().stream().map(v -> {
                Map<String, Object> vMap = new HashMap<>();
                vMap.put("id", v.getId());
                vMap.put("verifierId", v.getVerifier().getId());
                vMap.put("verifierName", v.getVerifier().getFullName());
                vMap.put("decision", v.getDecision());
                vMap.put("comment", v.getComment());
                vMap.put("createdAt", v.getCreatedAt());
                return vMap;
            }).collect(Collectors.toList());

            map.put("verifications", verifications);
            return map;
        }).collect(Collectors.toList());
    }

    @Transactional
    public void verifyAction(String actionId, String decision, String comment, User verifier) {
        PendingAction action = pendingActionRepository.findById(actionId)
                .orElseThrow(() -> new RuntimeException("Pending action not found"));

        // Check if user already verified
        if (actionVerificationRepository.existsByPendingActionAndVerifier(action, verifier)) {
            throw new RuntimeException("You have already verified this action");
        }

        // Create verification
        ActionVerification verification = new ActionVerification();
        verification.setPendingAction(action);
        verification.setVerifier(verifier);
        verification.setDecision(ActionVerification.Decision.valueOf(decision.toUpperCase()));
        verification.setComment(comment);
        actionVerificationRepository.save(verification);

        // Update counts
        if ("approved".equalsIgnoreCase(decision)) {
            action.setApprovalCount(action.getApprovalCount() + 1);
        } else {
            action.setRejectionCount(action.getRejectionCount() + 1);
        }

        // Check if threshold met
        if (action.getApprovalCount() >= action.getRequiredApprovals()) {
            action.setStatus(PendingAction.ActionStatus.APPROVED);
            action.setCompletedAt(LocalDateTime.now());
            executeAction(action);
        } else if (action.getRejectionCount() >= action.getRequiredApprovals()) {
            action.setStatus(PendingAction.ActionStatus.REJECTED);
            action.setCompletedAt(LocalDateTime.now());
        }

        pendingActionRepository.save(action);
    }

    @Transactional
    protected void createPendingAction(String actionType, String entityType, String entityId, String reason,
            User initiator) {
        PendingAction action = new PendingAction();
        action.setActionType(actionType);
        action.setEntityType(entityType);
        action.setEntityId(entityId);
        action.setReason(reason);
        action.setInitiatedBy(initiator);
        action.setRequiredApprovals(2); // 2/3 approval
        pendingActionRepository.save(action);
    }

    @Transactional
    protected void executeAction(PendingAction action) {
        // Execute the approved action
        switch (action.getActionType()) {
            case "APPROVE_LOAN":
                Loan loan = loanRepository.findById(UUID.fromString(action.getEntityId())).orElse(null);
                if (loan != null) {
                    loan.setStatus("approved");
                    loan.setApprovedAmount(loan.getRequestedAmount());
                    loanRepository.save(loan);
                }
                break;
            // Add other action types as needed
        }
    }

    private boolean requiresWorkflow(Double amount) {
        return amount != null && amount > 50000; // Loans over 50k require workflow
    }

    // ==================== Messages ====================

    public List<Message> getAdminMessages() {
        return messageRepository.findAll();
    }

    public Optional<Message> getMessageById(String id) {
        return messageRepository.findById(UUID.fromString(id));
    }

    @Transactional
    public Message sendMessage(Message message) {
        return messageRepository.save(message);
    }

    // ==================== Notifications ====================

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAll();
    }

    @Transactional
    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    @Transactional
    public void broadcastNotification(String title, String message, List<User> recipients) {
        for (User recipient : recipients) {
            Notification notification = new Notification();
            notification.setUser(recipient);
            notification.setTitle(title);
            notification.setMessage(message);
            notification.setRead(false);
            notificationRepository.save(notification);
        }
    }
}
