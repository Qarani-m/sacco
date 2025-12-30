package com.sacco.repository;

import com.sacco.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    List<Message> findByRecipientIdOrderBySentAtDesc(UUID recipientId);

    List<Message> findBySenderIdOrderBySentAtDesc(UUID senderId);

    long countByRecipientIdAndIsReadFalse(UUID recipientId);
}
