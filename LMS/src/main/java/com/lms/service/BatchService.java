package com.lms.service;

import com.lms.entity.Batch;
import com.lms.repository.BatchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class BatchService {

    @Autowired
    private BatchRepository batchRepository;

    public Batch addBatch(Batch batch) {
        return batchRepository.save(batch);
    }

    public Batch updateBatch(Long id, Batch batchDetails) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Batch not found"));

        batch.setYear(batchDetails.getYear());
        batch.setDepartment(batchDetails.getDepartment());
        batch.setSection(batchDetails.getSection());

        return batchRepository.save(batch);
    }

    public void deleteBatch(Long id) {
        Batch batch = batchRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Batch not found"));
        batchRepository.delete(batch);
    }

    public List<Batch> getAllBatches() {
        return batchRepository.findAll();
    }

    public Optional<Batch> getBatchById(Long id) {
        return batchRepository.findById(id);
    }
}
