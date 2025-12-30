package com.sacco.service;

import com.sacco.entity.Message;
import com.sacco.entity.User;
import com.sacco.repository.MessageRepository;
import com.sacco.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public Message sendMessage(UUID senderId, UUID recipientId, String subject, String body) {
        User sender = userRepository.findById(senderId).orElseThrow();
        User recipient = userRepository.findById(recipientId).orElseThrow();

        Message msg = new Message();
        msg.setSender(sender);
        msg.setRecipient(recipient);
        msg.setSubject(subject);
        msg.setBody(body);
        msg.setSentAt(LocalDateTime.now());
        msg.setRead(false);

        return messageRepository.save(msg);
    }

    public List<Message> getInbox(UUID userId) {
        return messageRepository.findByRecipientIdOrderBySentAtDesc(userId);
    }

    public List<Message> getOutbox(UUID userId) {
        return messageRepository.findBySenderIdOrderBySentAtDesc(userId);
    }

    @Transactional
    public void markAsRead(UUID messageId) {
        Message msg = messageRepository.findById(messageId).orElseThrow();
        msg.setRead(true);
        messageRepository.save(msg);
    }
}
