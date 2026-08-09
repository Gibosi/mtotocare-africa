package com.mtotocare.africa.consent;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/consents")
@RequiredArgsConstructor
public class ConsentController {

    private final ConsentService service;

    @PostMapping
    public ApiResponse<ConsentDto> record(@Valid @RequestBody ConsentRequest request, HttpServletRequest httpRequest) {
        String ip = httpRequest.getRemoteAddr();
        String userAgent = httpRequest.getHeader("User-Agent");
        return ApiResponse.success("Consent recorded", service.record(request, ip, userAgent));
    }

    @GetMapping
    public ApiResponse<List<ConsentDto>> list() {
        return ApiResponse.success(service.list());
    }
}
