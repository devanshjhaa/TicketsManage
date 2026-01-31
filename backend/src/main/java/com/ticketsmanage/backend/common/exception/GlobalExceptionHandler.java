package com.ticketsmanage.backend.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidation(
            MethodArgumentNotValidException ex,
            HttpServletRequest request
    ) {

        Map<String, String> errors = new HashMap<>();

        ex.getBindingResult()
                .getFieldErrors()
                .forEach(err ->
                        errors.put(err.getField(), err.getDefaultMessage())
                );

        return ResponseEntity.badRequest().body(
                new ApiError(
                        400,
                        "VALIDATION_ERROR",
                        errors.toString(),
                        request.getRequestURI(),
                        Instant.now()
                )
        );
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> handleAccessDenied(
            AccessDeniedException ex,
            HttpServletRequest request
    ) {

        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ApiError(
                        403,
                        "FORBIDDEN",
                        ex.getMessage(),
                        request.getRequestURI(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(
            IllegalArgumentException ex,
            HttpServletRequest request
    ) {

        return ResponseEntity.badRequest()
                .body(new ApiError(
                        400,
                        "BAD_REQUEST",
                        ex.getMessage(),
                        request.getRequestURI(),
                        Instant.now()
                ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<?> handleAny(
            Exception ex,
            HttpServletRequest request
    ) {

        log.error("Unhandled exception: {}", ex.getMessage(), ex);

        return ResponseEntity.status(500)
                .body(new ApiError(
                        500,
                        "INTERNAL_ERROR",
                        ex.getMessage(),
                        request.getRequestURI(),
                        Instant.now()
                ));
    }
}
