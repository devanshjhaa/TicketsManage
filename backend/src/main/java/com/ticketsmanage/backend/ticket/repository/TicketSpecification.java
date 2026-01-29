package com.ticketsmanage.backend.ticket.repository;

import com.ticketsmanage.backend.ticket.entity.TicketEntity;
import com.ticketsmanage.backend.ticket.entity.TicketPriority;
import com.ticketsmanage.backend.ticket.entity.TicketStatus;
import com.ticketsmanage.backend.user.entity.UserEntity;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class TicketSpecification {

    public static Specification<TicketEntity> withFilters(
            TicketStatus status,
            TicketPriority priority,
            UserEntity owner,
            UserEntity assignee,
            String search,
            boolean isDeleted) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Status
            if (status != null) {
                predicates.add(criteriaBuilder.equal(root.get("status"), status));
            }

            // Priority
            if (priority != null) {
                predicates.add(criteriaBuilder.equal(root.get("priority"), priority));
            }

            // Owner
            if (owner != null) {
                predicates.add(criteriaBuilder.equal(root.get("owner"), owner));
            }

            // Assignee
            if (assignee != null) {
                predicates.add(criteriaBuilder.equal(root.get("assignee"), assignee));
            }

            // Deleted
            predicates.add(criteriaBuilder.equal(root.get("deleted"), isDeleted));

            // Text Search (Title or Description)
            if (search != null && !search.trim().isEmpty()) {
                String likePattern = "%" + search.toLowerCase() + "%";
                Predicate titleLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("title")), likePattern);
                Predicate descLike = criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), likePattern);
                predicates.add(criteriaBuilder.or(titleLike, descLike));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
