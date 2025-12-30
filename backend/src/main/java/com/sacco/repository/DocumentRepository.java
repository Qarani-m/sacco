package com.sacco.repository;

import com.sacco.entity.Document;
import com.sacco.entity.Document.DocumentStatus;
import com.sacco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, String> {

    List<Document> findByStatus(DocumentStatus status);

    List<Document> findByUser(User user);

    List<Document> findByUserAndStatus(User user, DocumentStatus status);

    long countByStatus(DocumentStatus status);
}
