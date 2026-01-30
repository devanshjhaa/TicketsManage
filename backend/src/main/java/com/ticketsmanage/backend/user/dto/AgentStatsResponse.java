package com.ticketsmanage.backend.user.dto;

public record AgentStatsResponse(
    long totalAssignedTickets,
    long resolvedTickets,
    long openTickets,
    long inProgressTickets,
    int totalRatings,
    Double averageRating
) {}
