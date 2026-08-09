package com.mtotocare.africa.medical;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.exception.ApiException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HealthRecordService {

    private final HealthRecordRepository repository;
    private final ChildRepository childRepository;

    @Transactional
    public HealthRecord add(Long childId, HealthRecord record) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        record.setChild(child);
        return repository.save(record);
    }

    @Transactional(readOnly = true)
    public List<HealthRecord> getForChild(Long childId) {
        return repository.findByChildIdOrderByRecordDateDesc(childId);
    }

    @Transactional
    public void delete(Long id) {
        repository.deleteById(id);
    }
}
