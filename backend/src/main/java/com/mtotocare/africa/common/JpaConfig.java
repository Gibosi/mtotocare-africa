package com.mtotocare.africa.common;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

@Configuration
@EnableJpaAuditing
@EnableJpaRepositories(basePackages = "com.mtotocare.africa")
public class JpaConfig {
}
