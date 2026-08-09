package com.mtotocare.africa.sync;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationResult {
    private String clientOperationId;
    private String status; // SUCCESS, FAILED, CONFLICT
    private String errorMessage;
    private Long serverEntityId;
    private Object entity;
}
