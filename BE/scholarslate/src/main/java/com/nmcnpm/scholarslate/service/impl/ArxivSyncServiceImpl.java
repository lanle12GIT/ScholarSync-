package com.nmcnpm.scholarslate.service.impl;

import com.nmcnpm.scholarslate.entity.Paper;
import com.nmcnpm.scholarslate.entity.Topic;
import com.nmcnpm.scholarslate.entity.Notification;
import com.nmcnpm.scholarslate.entity.UserTopic;
import com.nmcnpm.scholarslate.repository.PaperRepository;
import com.nmcnpm.scholarslate.repository.TopicRepository;
import com.nmcnpm.scholarslate.service.ArxivSyncService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import com.nmcnpm.scholarslate.service.AiService;
import org.springframework.web.client.RestTemplate;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.ByteArrayInputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class ArxivSyncServiceImpl implements ArxivSyncService {

    private final TopicRepository topicRepository;
    private final PaperRepository paperRepository;
    private final AiService aiService;

    @Async
    @Override
    public void syncPapers() {
        log.info("=== BẮT ĐẦU SYNC PAPERS (chạy nền) ===");
        List<Topic> topics = topicRepository.findByKeyIsNotNull();
        if (topics == null || topics.isEmpty()) {
            log.warn("No topics with a valid 'key' found in the database. Synchronization aborted.");
            return;
        }

        RestTemplate restTemplate = new RestTemplate();
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().set("User-Agent", "ScholarSlateBot/1.0 (mailto:admin@scholarslate.com)");
            return execution.execute(request, body);
        });

        for (Topic topic : topics) {
            String category = topic.getKey();
            if (category == null || category.trim().isEmpty()) {
                continue;
            }

            try {
                // Fetch latest updates via RSS feed
                String url = "https://rss.arxiv.org/rss/" + category;
                log.info("Fetching arXiv papers for topic: {}, URL: {}", category, url);

                String xmlResponse = restTemplate.getForObject(url, String.class);
                if (xmlResponse == null) {
                    continue;
                }

                DocumentBuilderFactory factory = DocumentBuilderFactory.newInstance();
                DocumentBuilder builder = factory.newDocumentBuilder();
                Document doc = builder.parse(new ByteArrayInputStream(xmlResponse.getBytes("UTF-8")));
                doc.getDocumentElement().normalize();

                NodeList entryList = doc.getElementsByTagName("item");
                log.info("Found {} items for topic {}", entryList.getLength(), category);

                for (int i = 0; i < entryList.getLength(); i++) {
                    try {
                        Node node = entryList.item(i);
                        if (node.getNodeType() == Node.ELEMENT_NODE) {
                            Element element = (Element) node;

                            String arxivIdUrl = getTagValue("link", element);
                            String arxivId = extractArxivId(arxivIdUrl);

                            if (paperRepository.existsByArxivId(arxivId)) {
                                // Paper exists. Since we sort by newest, if we hit an existing paper,
                                // it means we've likely processed all newer ones. We can just skip it.
                                log.info("Found existing paper {}, breaking loop for topic.", arxivId);
                                break;
                            }

                            String title = getTagValue("title", element);

                            String abstractTextRaw = getTagValue("description", element);
                            String abstractText = abstractTextRaw;
                            if (abstractTextRaw != null) {
                                int index = abstractTextRaw.indexOf("Abstract: ");
                                if (index >= 0) {
                                    abstractText = abstractTextRaw.substring(index + "Abstract: ".length()).trim();
                                }
                            }

                            String publishedStr = getTagValue("pubDate", element); 
                            String authors = getTagValue("dc:creator", element);
                            if (authors == null) {
                                authors = "";
                            }

                            LocalDate publishedAt = null;
                            if (publishedStr != null) {
                                try {
                                    publishedAt = LocalDate.parse(publishedStr, DateTimeFormatter.RFC_1123_DATE_TIME);
                                } catch (Exception e) {
                                    log.warn("Could not parse date: {}", publishedStr);
                                }
                            }

                            // Chỉ lưu bài báo mới (trong vòng 7 ngày gần nhất)
                            // Bỏ qua các bài cũ được REPLACED hoặc CROSS LISTED lại trên RSS feed
                            if (publishedAt == null || publishedAt.isBefore(LocalDate.now().minusDays(7))) {
                                log.debug("Skipping old paper: {} (published: {})", arxivId, publishedAt);
                                continue;
                            }

                            String summary = aiService.summarizeText(abstractText);
                            Float point = aiService.scorePaper(abstractText);

                            Paper paper = Paper.builder()
                                    .arxivId(arxivId)
                                    .title(title != null ? title.replace("\n", " ").trim() : "")
                                    .abstractText(abstractText != null ? abstractText.trim() : "")
                                    .summary(summary)
                                    .point(point)
                                    .authors(authors)
                                    .link("https://arxiv.org/html/" + arxivId)
                                    .publishedAt(publishedAt)
                                    .fetchedAt(LocalDateTime.now())
                                    .build();

                            paper.getTopics().add(topic);

                            paperRepository.save(paper);
                            log.info("Saved new paper: {}", paper.getArxivId());

                            // Chờ giữa mỗi bài để an toàn
                            Thread.sleep(3_000);
                        }
                    } catch (Exception e) {
                        log.error("Error processing a paper for topic " + category + ": " + e.getMessage());
                    }
                }

                // Sleep to be polite to arXiv API
                Thread.sleep(3000);
            } catch (Exception e) {
                log.error("Error fetching papers for topic " + category, e);
            }
        }
        log.info("=== HOÀN TẤT SYNC PAPERS ===");
    }

    private String getTagValue(String tag, Element element) {
        NodeList nodeList = element.getElementsByTagName(tag);
        if (nodeList != null && nodeList.getLength() > 0) {
            Node node = nodeList.item(0).getChildNodes().item(0);
            if (node != null) {
                return node.getNodeValue();
            }
        }
        return null;
    }

    private String extractArxivId(String idUrl) {
        if (idUrl == null)
            return null;
        // idUrl is like http://arxiv.org/abs/2405.00123v1 or
        // http://arxiv.org/abs/hep-ph/0310123v3
        String httpPrefix = "http://arxiv.org/abs/";
        String httpsPrefix = "https://arxiv.org/abs/";
        if (idUrl.startsWith(httpPrefix)) {
            return idUrl.substring(httpPrefix.length());
        } else if (idUrl.startsWith(httpsPrefix)) {
            return idUrl.substring(httpsPrefix.length());
        }

        int lastSlashIndex = idUrl.lastIndexOf("/");
        if (lastSlashIndex >= 0) {
            return idUrl.substring(lastSlashIndex + 1);
        }
        return idUrl;
    }

    @Override
    @org.springframework.scheduling.annotation.Async
    public void scoreMissingPapers() {
        log.info("Starting background job to score all missing papers...");
        java.util.List<com.nmcnpm.scholarslate.entity.Paper> missingPapers = paperRepository.findByPointIsNull();
        log.info("Found {} papers with missing score.", missingPapers.size());

        int count = 0;
        for (com.nmcnpm.scholarslate.entity.Paper paper : missingPapers) {
            try {
                Float point = aiService.scorePaper(paper.getAbstractText());
                if (point != null) {
                    paper.setPoint(point);
                    log.info("Scored paper {}: {}", paper.getArxivId(), point);
                } else {
                    log.warn("Failed to score paper {}", paper.getArxivId());
                }
                
                // Nghỉ 10s trước khi gọi API summary để không bị dính rate limit
                Thread.sleep(10_000);

                String summary = paper.getSummary();
                if (summary == null || summary.trim().isEmpty()) {
                    summary = aiService.summarizeText(paper.getAbstractText());
                    if (summary != null) {
                        paper.setSummary(summary);
                        log.info("Summarized paper {}", paper.getArxivId());
                    }
                }

                paperRepository.save(paper);
                count++;

                // Sleep 10s to avoid OpenRouter's 8 requests/min limit cho lần lặp tiếp theo
                Thread.sleep(10_000);
            } catch (Exception e) {
                log.error("Error scoring paper {}: {}", paper.getArxivId(), e.getMessage());
            }
        }
        log.info("Finished background scoring job. Successfully scored {} papers.", count);
    }
}
