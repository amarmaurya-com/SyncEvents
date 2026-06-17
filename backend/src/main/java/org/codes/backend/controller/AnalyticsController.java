package org.codes.backend.controller;

import org.codes.backend.service.AnalyticsService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;
    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/overview")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String , Object> getOverview(){
        return analyticsService.getOverview();
    }

    @GetMapping("/events")
    @PreAuthorize("hasRole('ADMIN')")
    public Object getEventReport(){
        return analyticsService.getEventReport();
    }

    @GetMapping("/coordinator/me")
    @PreAuthorize("hasRole('COORDINATOR')")
    public Map<String, Object> getCoordinatorSummary(Authentication authentication){
        return analyticsService.getCoordinatorSummary(authentication.getName());
    }

    @GetMapping("/events/{coordinatorId}/workspace")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public Map<String, Object> getCoordinatorWorkspace(@PathVariable Integer coordinatorId){
        return analyticsService.getCoordinatorWorkspace(coordinatorId);
    }

    @GetMapping("/events/{eventId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public Map<String, Object> getEventAnalytics(@PathVariable Integer eventId){
        return analyticsService.getEventAnalytics(eventId);
    }

    @GetMapping("/events/{eventId}/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public Map<String, Object> getEventAttendance(@PathVariable Integer eventId) {
        return analyticsService.getEventAttendance(eventId);
    }

    @GetMapping("/events/{eventId}/certificates")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public Map<String, Object> getEventCertificates(@PathVariable Integer eventId) {
        return analyticsService.getEventCertificates(eventId);
    }

    @GetMapping("/events/{eventId}/breakdowns")
    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    public Map<String, Object> getEventBreakdowns(@PathVariable Integer eventId) {
        return analyticsService.getEventBreakdowns(eventId);
    }

    @GetMapping("/admin/coordinators")
    @PreAuthorize("hasRole('ADMIN')")
    public Object getAdminCoordinatorAnalytics() {
        return analyticsService.getAdminCoordinatorAnalytics();
    }
}
