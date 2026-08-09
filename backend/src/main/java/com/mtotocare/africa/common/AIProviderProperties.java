package com.mtotocare.africa.common;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * AI provider configuration. Currently supports Groq (free, no credit card).
 * Get a key at: https://console.groq.com/keys
 */
@Data
@Component
@ConfigurationProperties(prefix = "mtotocare.ai")
public class AIProviderProperties {
    /** Provider name: "groq", "openai", or "mock". Default: "mock" (offline safe responses). */
    private String provider = "mock";

    /** API key for the provider. */
    private String apiKey = "";

    /** Model name. Defaults:
     *  - groq: "llama-3.3-70b-versatile"
     *  - openai: "gpt-4o-mini"
     *  - mock: (no model needed)
     */
    private String model = "";

    /** Request timeout in milliseconds. */
    private int timeoutMs = 20000;

    /** Max tokens in response. */
    private int maxTokens = 600;

    /** Temperature (0.0 = focused, 1.0 = creative). 0.4 is good for medical info. */
    private double temperature = 0.4;
}
