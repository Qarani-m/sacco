package com.sacco.repository;

import com.sacco.entity.ActionVerification;
import com.sacco.entity.PendingAction;
import com.sacco.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActionVerificationRepository extends JpaRepository<ActionVerification, String> {

    List<ActionVerification> findByPendingAction(PendingAction pendingAction);

    Optional<ActionVerification> findByPendingActionAndVerifier(PendingAction pendingAction, User verifier);

    boolean existsByPendingActionAndVerifier(PendingAction pendingAction, User verifier);
}
