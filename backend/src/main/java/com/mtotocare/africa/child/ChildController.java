package com.mtotocare.africa.child;

import com.mtotocare.africa.common.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;

@RestController
@RequestMapping("/children")
@RequiredArgsConstructor
@Slf4j
public class ChildController {

    private final ChildService childService;

    @PostMapping
    public ResponseEntity<ApiResponse<ChildDto>> addChild(@Valid @RequestBody ChildCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Child added successfully", childService.addChild(request)));
    }

    @GetMapping
    public ApiResponse<List<ChildDto>> getChildren() {
        return ApiResponse.success(childService.getChildrenForParent());
    }

    @GetMapping("/{id}")
    public ApiResponse<ChildDto> getChild(@PathVariable Long id) {
        return ApiResponse.success(childService.getChild(id));
    }

    @PutMapping("/{id}")
    public ApiResponse<ChildDto> updateChild(@PathVariable Long id, @RequestBody ChildRequest request) {
        return ApiResponse.success("Child updated", childService.updateChild(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteChild(@PathVariable Long id) {
        childService.deleteChild(id);
        return ApiResponse.success("Child deleted", null);
    }
}
