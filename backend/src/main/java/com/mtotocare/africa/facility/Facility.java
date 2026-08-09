package com.mtotocare.africa.facility;

import com.mtotocare.africa.common.BaseEntity;
import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "facilities", indexes = {
    @Index(name = "idx_facility_region", columnList = "region"),
    @Index(name = "idx_facility_type", columnList = "facility_type")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Facility extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "facility_type", length = 50)
    private String facilityType;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "region", length = 100)
    private String region;

    @Column(name = "district", length = 100)
    private String district;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "latitude")
    private Double latitude;

    @Column(name = "longitude")
    private Double longitude;

    @Column(name = "operating_hours", length = 200)
    private String operatingHours;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}
