package org.codes.backend.dto;

import org.springframework.http.HttpStatusCode;

import java.util.List;

public record EventsListResponse(
        List<EventsListResponse> event
){
}
