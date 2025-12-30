package com.sacco.controller;

import com.sacco.entity.Message;
import com.sacco.service.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MessageController {

    private final MessageService messageService;
    private final com.sacco.repository.UserRepository userRepository;

    private UUID getUserId(UserDetails userDetails) {
        return userRepository.findByEmail(userDetails.getUsername()).orElseThrow().getId();
    }

    @PostMapping("/send")
    public ResponseEntity<Message> send(@RequestBody Map<String, String> payload,
            @AuthenticationPrincipal UserDetails userDetails) {
        UUID recipientId = UUID.fromString(payload.get("recipientId"));
        String subject = payload.get("subject");
        String body = payload.get("body");

        return ResponseEntity.ok(messageService.sendMessage(getUserId(userDetails), recipientId, subject, body));
    }

    @GetMapping("/inbox")
    public ResponseEntity<List<Message>> getInbox(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(messageService.getInbox(getUserId(userDetails)));
    }

    @GetMapping("/outbox")
    public ResponseEntity<List<Message>> getOutbox(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(messageService.getOutbox(getUserId(userDetails)));
    }
}
