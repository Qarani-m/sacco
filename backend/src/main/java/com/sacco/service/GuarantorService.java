package com.sacco.service;

import com.sacco.entity.Loan;
import com.sacco.entity.LoanGuarantor;
import com.sacco.entity.User;
import com.sacco.repository.LoanGuarantorRepository;
import com.sacco.repository.LoanRepository;
import com.sacco.repository.ShareRepository;
import com.sacco.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class GuarantorService {

    private final LoanGuarantorRepository guarantorRepository;
    private final LoanRepository loanRepository;
    private final UserRepository userRepository;
    private final ShareRepository shareRepository;

    @Transactional
    public LoanGuarantor requestGuarantee(UUID borrowerId, UUID loanId, UUID guarantorId, Integer shareAmount) {
        Loan loan = loanRepository.findById(loanId).orElseThrow(() -> new RuntimeException("Loan not found"));
        User guarantor = userRepository.findById(guarantorId)
                .orElseThrow(() -> new RuntimeException("Guarantor not found"));

        // Validation: Cannot guarantee own loan
        if (loan.getBorrower().getId().equals(guarantorId)) {
            throw new RuntimeException("Cannot guarantee your own loan");
        }

        LoanGuarantor lg = new LoanGuarantor();
        lg.setLoan(loan);
        lg.setGuarantor(guarantor);
        lg.setSharesPledged(shareAmount);
        lg.setStatus("pending");

        return guarantorRepository.save(lg);
    }

    @Transactional
    public LoanGuarantor respondToRequest(UUID guarantorId, UUID requestId, String status) {
        LoanGuarantor lg = guarantorRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        if (!lg.getGuarantor().getId().equals(guarantorId)) {
            throw new RuntimeException("Unauthorized");
        }

        if ("accepted".equals(status)) {
            // Check share balance
            Integer activeShares = shareRepository.getActiveSharesByUser(guarantorId);
            // Logic to lock shares would go here (update share status or lock table)
            if (activeShares < lg.getSharesPledged()) {
                throw new RuntimeException("Insufficient shares to pledge");
            }
        }

        lg.setStatus(status);
        return guarantorRepository.save(lg);
    }

    public List<LoanGuarantor> getRequests(UUID guarantorId) {
        return guarantorRepository.findByGuarantorIdAndStatus(guarantorId, "pending");
    }
}
