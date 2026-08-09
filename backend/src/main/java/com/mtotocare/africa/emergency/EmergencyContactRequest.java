package com.mtotocare.africa.emergency;

import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

@Data
public class EmergencyContactRequest {
    @NotBlank
    private String name;
    private String relationship;
    @NotBlank
    private String phoneNumber;
    private String alternatePhone;
    private String email;
    private String address;
    @NotNull
    private Boolean isPrimary;
    private Integer priority;
    private Boolean canPickupChild;
    private String notes;
}
