package com.nmcnpm.scholarslate.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Slf4j
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    @Value("${grok.api.key}")
    private String groqApiKey;

    @Value("${grok.api.url}")
    private String groqUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();


    public String summarizeText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }

        // Gọi Groq (Grok) trước
        String prompt = "Summarize the following scientific abstract into 3-4 concise and easy-to-understand sentences. You MUST output ONLY the summary strictly in English. DO NOT include any introductory or concluding text like 'Here is a summary':\n\n" + text;

        try {
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.1-8b-instant");
            requestBody.put("messages", List.of(message));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(groqUrl, requestEntity, String.class);

            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode contentNode = rootNode.path("choices").get(0)
                                           .path("message")
                                           .path("content");

            return contentNode.asText().trim();

        } catch (Exception e) {
            log.warn("Lỗi khi gọi Groq API: {}. Chuyển sang Gemini API làm fallback...", e.getMessage());
            return callGeminiFallback(text, prompt);
        }
    }

    private String callGeminiFallback(String text, String prompt) {
        String fullUrl = apiUrl + apiKey;

        try {
            Map<String, Object> textPart = new HashMap<>();
            textPart.put("text", prompt);

            Map<String, Object> parts = new HashMap<>();
            parts.put("parts", List.of(textPart));

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(parts));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(fullUrl, requestEntity, String.class);

            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode textNode = rootNode.path("candidates").get(0)
                                        .path("content")
                                        .path("parts").get(0)
                                        .path("text");

            return textNode.asText().trim();

        } catch (Exception e) {
            log.error("Lỗi khi gọi Gemini API fallback: {}", e.getMessage());
            return null;
        }
    }

    public Float scorePaper(String abstractText) {
        if (abstractText == null || abstractText.trim().isEmpty()) {
            return null;
        }

        String prompt = "You are an expert scientific evaluator. Score the following scientific paper based on its abstract. " +
                "Evaluate based on these 4 criteria summing up to 100 points:\n" +
                "1. Novelty (30 points)\n" +
                "2. Practical Impact (30 points)\n" +
                "3. Methodology Clarity (20 points)\n" +
                "4. Trend Alignment (20 points)\n\n" +
                "You MUST output ONLY a single integer number between 0 and 100 representing the total score. " +
                "DO NOT output any explanation, text, or markdown, ONLY the number.\n\nAbstract:\n" + abstractText;

        try {
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", "llama-3.1-8b-instant");
            requestBody.put("messages", List.of(message));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(groqApiKey);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);

            String response = restTemplate.postForObject(groqUrl, requestEntity, String.class);

            JsonNode rootNode = objectMapper.readTree(response);
            JsonNode contentNode = rootNode.path("choices").get(0)
                                           .path("message")
                                           .path("content");

            String resultText = contentNode.asText().trim();
            return Float.parseFloat(resultText);

        } catch (Exception e) {
            log.warn("Lỗi khi gọi Groq API cho score: {}. Chuyển sang Gemini API làm fallback...", e.getMessage());
            String fallbackResult = callGeminiFallback(abstractText, prompt);
            if (fallbackResult != null) {
                try {
                    return Float.parseFloat(fallbackResult);
                } catch (NumberFormatException ex) {
                    log.error("Không thể parse kết quả từ Gemini thành Float: {}", fallbackResult);
                }
            }
            return null;
        }
    }
}
