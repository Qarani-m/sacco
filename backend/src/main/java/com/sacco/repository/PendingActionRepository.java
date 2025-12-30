package com.sacco.repository;

import com.sacco.entity.PendingAction;
import com.sacco.entity.PendingAction.ActionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PendingActionRepository extends JpaRepository<PendingAction, String> {

    List<PendingAction> findByStatus(ActionStatus status);

    List<PendingAction> findByEntityTypeAndEntityId(String entityType, String entityId);

    @Query("SELECT pa FROM PendingAction pa LEFT JOIN FETCH pa.verifications WHERE pa.status = :status")
    List<PendingAction> findByStatusWithVerifications(ActionStatus status);

    long countByStatus(ActionStatus status);
}
