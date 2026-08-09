package com.mtotocare.africa.emergency;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/emergency-contacts")
@RequiredArgsConstructor
public class EmergencyContactController {

    private final EmergencyContactService service;

    @PostMapping
    public ApiResponse<EmergencyContactDto> add(@Valid @RequestBody EmergencyContactRequest request) {
        return ApiResponse.success("Contact added", service.add(request));
    }

    @GetMapping
    public ApiResponse<List<EmergencyContactDto>> list() {
        return ApiResponse.success(service.list());
    }

    @PutMapping("/{id}")
    public ApiResponse<EmergencyContactDto> update(@PathVariable Long id, @Valid @RequestBody EmergencyContactRequest request) {
        return ApiResponse.success("Contact updated", service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> delete(@PathVariable Long id) {
        service.delete(id);
        return ApiResponse.success("Contact deleted", null);
    }
}
