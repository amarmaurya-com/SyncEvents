package org.codes.backend.service;

import org.codes.backend.model.Event;
import org.codes.backend.repository.EventRepo;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Service
public class KnowledgeService {
    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");

    private final EventRepo eventRepo;

    public KnowledgeService(EventRepo eventRepo) {
        this.eventRepo = eventRepo;
    }

    public String answer(String question, Integer eventId) {
        if (eventId == null) {
            return "Select an event first, then ask about its rules, venue, deadline, prizes, or team setup.";
        }

        Event event = eventRepo.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found."));

        String normalized = question == null ? "" : question.toLowerCase(Locale.ROOT);

        if (normalized.contains("rule")) {
            return event.getRules() == null || event.getRules().isBlank()
                    ? "No rules have been added for " + event.getName() + " yet."
                    : event.getRules();
        }

        if (normalized.contains("deadline") || normalized.contains("last") || normalized.contains("registration")) {
            return event.getRegistrationEndDate() == null
                    ? "No registration deadline has been set for " + event.getName() + "."
                    : "Registration closes on " + event.getRegistrationEndDate().format(DATE_FORMAT) + ".";
        }

        if (normalized.contains("venue") || normalized.contains("where") || normalized.contains("location")) {
            return event.getVenue() == null || event.getVenue().isBlank()
                    ? "No venue has been set for " + event.getName() + " yet."
                    : event.getName() + " will be held at " + event.getVenue() + ".";
        }

        if (normalized.contains("prize")) {
            return event.getPrizes() == null || event.getPrizes().isEmpty()
                    ? "No prizes have been listed for " + event.getName() + " yet."
                    : "Prizes: " + String.join(", ", event.getPrizes()) + ".";
        }

        if (normalized.contains("team")) {
            if (event.getTeamConfig() == null) {
                return event.getName() + " is an individual event.";
            }

            return "Team size for " + event.getName() + " is "
                    + event.getTeamConfig().getMinSize()
                    + " to "
                    + event.getTeamConfig().getMaxSize()
                    + " members.";
        }

        if (normalized.contains("date") || normalized.contains("when")) {
            return event.getEventDate() == null
                    ? "No event date has been set for " + event.getName() + " yet."
                    : event.getName() + " is scheduled on " + event.getEventDate().format(DATE_FORMAT) + ".";
        }

        return event.getName() + ": "
                + (event.getDescription() == null || event.getDescription().isBlank()
                ? "Ask about rules, deadline, venue, prizes, date, or team setup."
                : event.getDescription());
    }
}
