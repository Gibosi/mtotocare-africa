package com.mtotocare.africa.sync;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.growth.GrowthRecord;
import com.mtotocare.africa.medical.HealthRecord;
import com.mtotocare.africa.vaccination.Vaccination;
import com.mtotocare.africa.vaccination.VaccinationSchedule;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DeltaData {
    private List<Child> children;
    private List<Vaccination> vaccinations;
    private List<GrowthRecord> growthRecords;
    private List<HealthRecord> healthRecords;
    private List<VaccinationSchedule> vaccinationSchedules;
}
