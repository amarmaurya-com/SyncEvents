package org.codes.backend.controller;

import org.codes.backend.service.KnowledgeService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/knowledge")
@PreAuthorize("hasRole('PARTICIPANT')")
public class KnowledgeController {
    private final KnowledgeService knowledgeService;

    public KnowledgeController(KnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @PostMapping("/answer")
    public Map<String, String> answer(@RequestBody Map<String, Object> body) {
        String question = String.valueOf(body.getOrDefault("question", ""));
        Integer eventId = body.get("eventId") instanceof Number number ? number.intValue() : null;

        return Map.of("answer", knowledgeService.answer(question, eventId));
    }
}
