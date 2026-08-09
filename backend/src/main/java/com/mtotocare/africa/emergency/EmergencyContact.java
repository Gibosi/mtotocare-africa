package com.mtotocare.africa.emergency;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.mtotocare.africa.common.BaseEntity;
import com.mtotocare.africa.user.User;
import lombok.*;

import javax.persistence.*;

@Entity
@Table(name = "emergency_contacts", indexes = {
    @Index(name = "idx_emerg_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyContact extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "name", nullable = false, length = 150)
    private String name;

    @Column(name = "relationship", length = 50)
    private String relationship; // SPOUSE, PARENT, SIBLING, FRIEND, NEIGHBOR, DOCTOR

    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    @Column(name = "alternate_phone", length = 20)
    private String alternatePhone;

    @Column(name = "email", length = 150)
    private String email;

    @Column(name = "address", length = 500)
    private String address;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "priority", nullable = false)
    @Builder.Default
    private Integer priority = 1; // 1 = highest, 5 = lowest

    @Column(name = "can_pickup_child", nullable = false)
    @Builder.Default
    private Boolean canPickupChild = false;

    @Column(name = "notes", length = 500)
    private String notes;
}
