package com.sacco.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class MpesaService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${mpesa.consumer-key}")
    private String consumerKey;

    @Value("${mpesa.consumer-secret}")
    private String consumerSecret;

    @Value("${mpesa.short-code}")
    private String shortCode;

    @Value("${mpesa.passkey}")
    private String passkey;

    @Value("${mpesa.callback-url}")
    private String callbackUrl;

    @Value("${mpesa.env}")
    private String env;

    private String getBaseUrl() {
        return "sandbox".equalsIgnoreCase(env)
                ? "https://sandbox.safaricom.co.ke"
                : "https://api.safaricom.co.ke";
    }

    public String getAccessToken() {
        String url = getBaseUrl() + "/oauth/v1/generate?grant_type=client_credentials";
        String authHeader = "Basic "
                + Base64.getEncoder().encodeToString((consumerKey + ":" + consumerSecret).getBytes());

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", authHeader);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.GET, entity, Map.class);
            return (String) response.getBody().get("access_token");
        } catch (Exception e) {
            log.error("Failed to get M-Pesa access token: {}", e.getMessage());
            return null;
        }
    }

    public Map<String, Object> initiateStkPush(String phoneNumber, Double amount, String reference,
            String description) {
        String accessToken = getAccessToken();
        if (accessToken == null)
            return Map.of("error", "Failed to get access token");

        String url = getBaseUrl() + "/mpesa/stkpush/v1/processrequest";
        String timestamp = java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss")
                .format(java.time.LocalDateTime.now());
        String password = Base64.getEncoder().encodeToString((shortCode + passkey + timestamp).getBytes());

        // Format phone number to 254...
        if (phoneNumber.startsWith("0"))
            phoneNumber = "254" + phoneNumber.substring(1);
        else if (phoneNumber.startsWith("+"))
            phoneNumber = phoneNumber.substring(1);

        Map<String, Object> body = new HashMap<>();
        body.put("BusinessShortCode", shortCode);
        body.put("Password", password);
        body.put("Timestamp", timestamp);
        body.put("TransactionType", "CustomerPayBillOnline");
        body.put("Amount", Math.round(amount));
        body.put("PartyA", phoneNumber);
        body.put("PartyB", shortCode);
        body.put("PhoneNumber", phoneNumber);
        body.put("CallBackURL", callbackUrl);
        body.put("AccountReference", reference);
        body.put("TransactionDesc", description);

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            log.error("M-Pesa STK Push failed: {}", e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }
}
