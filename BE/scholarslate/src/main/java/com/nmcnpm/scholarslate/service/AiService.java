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
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class AiService {

    @Value("${openrouter.api.key}")
    private String openrouterApiKey;

    @Value("${openrouter.api.url}")
    private String openrouterUrl;

    @Value("${grok.api.key}")
    private String groqApiKey;

    @Value("${grok.api.url}")
    private String groqUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    private final AtomicInteger currentGroqKeyIndex = new AtomicInteger(0);

    private String getNextGroqKey() {
        if (groqApiKey == null || groqApiKey.trim().isEmpty()) {
            return null;
        }
        String[] keys = groqApiKey.split(",");
        // Use Math.abs to prevent negative values from overflow
        int index = Math.abs(currentGroqKeyIndex.getAndIncrement()) % keys.length;
        return keys[index].trim();
    }

    private String callOpenAiCompatibleApi(String text, String prompt, String url, String key, String model) {
        try {
            Map<String, Object> message = new HashMap<>();
            message.put("role", "user");
            message.put("content", prompt);

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(message));

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(key);

            HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestBody, headers);
            String response = restTemplate.postForObject(url, requestEntity, String.class);

            JsonNode rootNode = objectMapper.readTree(response);
            return rootNode.path("choices").get(0).path("message").path("content").asText().trim();
        } catch (Exception e) {
            log.error("Lỗi khi gọi API tới {}: {}", url, e.getMessage());
            return null;
        }
    }

    public String summarizeText(String text) {
        if (text == null || text.trim().isEmpty()) {
            return "";
        }

        String prompt = "Summarize the following scientific abstract into 3-4 concise and easy-to-understand sentences. You MUST output ONLY the summary strictly in English. DO NOT include any introductory or concluding text like 'Here is a summary':\n\n" + text;

        // Gọi Groq trước với cơ chế xoay vòng Key (Round-Robin)
        String currentGroqKey = getNextGroqKey();
        String result = callOpenAiCompatibleApi(text, prompt, groqUrl, currentGroqKey, "llama-3.1-8b-instant");
        
        if (result == null) {
            log.warn("Lỗi gọi Groq. Chuyển sang OpenRouter API làm fallback...");
            result = callOpenAiCompatibleApi(text, prompt, openrouterUrl, openrouterApiKey, "meta-llama/llama-3.2-3b-instruct:free");
        }

        return result != null ? result : "";
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

        // Gọi Groq trước với cơ chế xoay vòng Key (Round-Robin)
        String currentGroqKey = getNextGroqKey();
        String resultText = callOpenAiCompatibleApi(abstractText, prompt, groqUrl, currentGroqKey, "llama-3.1-8b-instant");
        
        if (resultText == null) {
            log.warn("Lỗi gọi Groq cho score. Chuyển sang OpenRouter API làm fallback...");
            resultText = callOpenAiCompatibleApi(abstractText, prompt, openrouterUrl, openrouterApiKey, "meta-llama/llama-3.2-3b-instruct:free");
        }

        if (resultText != null) {
            try {
                return Float.parseFloat(resultText);
            } catch (NumberFormatException ex) {
                log.error("Không thể parse kết quả thành Float: {}", resultText);
            }
        }
        return null;
    }
}
