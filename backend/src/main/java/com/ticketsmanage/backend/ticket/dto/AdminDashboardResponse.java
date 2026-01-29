package com.ticketsmanage.backend.ticket.dto;

import java.util.Map;

public record AdminDashboardResponse(
        Long totalActive,
        Long totalDeleted,
        Map<String, Long> statusCounts,
        Map<String, Long> priorityCounts,
        Double averageResolutionSeconds,
        Map<String, Long> ticketsPerAgent
) {
}
