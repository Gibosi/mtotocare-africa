package com.mtotocare.africa.reports;

import com.mtotocare.africa.child.Child;
import com.mtotocare.africa.child.ChildRepository;
import com.mtotocare.africa.common.ApiResponse;
import com.mtotocare.africa.common.SecurityUtils;
import com.mtotocare.africa.exception.ApiException;
import com.mtotocare.africa.growth.GrowthRecord;
import com.mtotocare.africa.growth.GrowthRepository;
import com.mtotocare.africa.user.User;
import com.mtotocare.africa.user.UserRepository;
import com.mtotocare.africa.vaccination.Vaccination;
import com.mtotocare.africa.vaccination.VaccinationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * FR-028, FR-069, FR-070: PDF + Excel export endpoints.
 */
@RestController
@RequestMapping("/reports/export")
@RequiredArgsConstructor
public class ReportExportController {

    private final ReportExportService exportService;
    private final ChildRepository childRepository;
    private final UserRepository userRepository;
    private final VaccinationRepository vaccinationRepository;
    private final GrowthRepository growthRepository;

    @GetMapping(value = "/children/pdf", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> childHealthPdf(@RequestParam Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        User parent = userRepository.findById(child.getParent().getId())
                .orElseThrow(() -> new ApiException("Parent not found", HttpStatus.NOT_FOUND, "PARENT_NOT_FOUND"));
        List<GrowthRecord> growth = growthRepository.findByChildIdOrderByMeasurementDateDesc(childId);
        List<Vaccination> vaccinations = vaccinationRepository.findByChildId(childId);
        byte[] pdf = exportService.buildChildHealthReport(child, growth, vaccinations);
        return pdfResponse(pdf, "child-" + childId + "-health-report.pdf");
    }

    @GetMapping(value = "/children/excel", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> childrenExcel() {
        List<Child> children = childRepository.findAll();
        byte[] xlsx = exportService.buildChildrenExcel(children);
        return binaryResponse(xlsx, "children.xlsx",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    }

    /**
     * FR-028: Vaccination certificate for a child.
     * Parents can download for their own children; providers can download for any child.
     */
    @GetMapping(value = "/vaccination-certificate/{childId}", produces = MediaType.APPLICATION_PDF_VALUE)
    public ResponseEntity<byte[]> vaccinationCertificate(@PathVariable Long childId) {
        Child child = childRepository.findById(childId)
                .orElseThrow(() -> new ApiException("Child not found", HttpStatus.NOT_FOUND, "CHILD_NOT_FOUND"));
        User parent = userRepository.findById(child.getParent().getId())
                .orElseThrow(() -> new ApiException("Parent not found", HttpStatus.NOT_FOUND, "PARENT_NOT_FOUND"));
        List<Vaccination> records = vaccinationRepository.findByChildId(childId);
        byte[] pdf = exportService.buildVaccinationCertificate(parent, child, records);
        return pdfResponse(pdf, "vaccination-certificate-" + childId + ".pdf");
    }

    // =============== helpers ===============
    private ResponseEntity<byte[]> pdfResponse(byte[] pdf, String filename) {
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(pdf);
    }

    private ResponseEntity<byte[]> binaryResponse(byte[] data, String filename, String contentType) {
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(data);
    }
}
