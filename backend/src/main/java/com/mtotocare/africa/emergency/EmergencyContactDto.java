package com.mtotocare.africa.emergency;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyContactDto {
    private Long id;
    private String name;
    private String relationship;
    private String phoneNumber;
    private String alternatePhone;
    private String email;
    private String address;
    private Boolean isPrimary;
    private Integer priority;
    private Boolean canPickupChild;
    private String notes;

    public static EmergencyContactDto from(EmergencyContact c) {
        return EmergencyContactDto.builder()
                .id(c.getId())
                .name(c.getName())
                .relationship(c.getRelationship())
                .phoneNumber(c.getPhoneNumber())
                .alternatePhone(c.getAlternatePhone())
                .email(c.getEmail())
                .address(c.getAddress())
                .isPrimary(c.getIsPrimary())
                .priority(c.getPriority())
                .canPickupChild(c.getCanPickupChild())
                .notes(c.getNotes())
                .build();
    }
}
