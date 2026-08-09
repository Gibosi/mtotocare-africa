package com.mtotocare.africa.user;

import lombok.Data;

@Data
public class UserUpdateRequest {
    private String fullName;
    private String phoneNumber;
    private String preferredLanguage;
}
