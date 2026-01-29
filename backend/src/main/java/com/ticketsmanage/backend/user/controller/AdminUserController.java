package com.ticketsmanage.backend.user.controller;

import com.ticketsmanage.backend.user.dto.UpdateUserRoleRequest;
import com.ticketsmanage.backend.user.dto.UpdateUserStatusRequest;
import com.ticketsmanage.backend.user.service.AdminUserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    // UPDATE ROLE
    @PutMapping("/{id}/role")
    public void updateRole(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateUserRoleRequest request) {
        adminUserService.updateUserRole(id, request);
    }

    // ENABLE / DISABLE
    @PutMapping("/{id}/status")
    public void updateStatus(
            @PathVariable UUID id,
            @RequestBody @Valid UpdateUserStatusRequest request) {
        adminUserService.updateUserStatus(id, request);
    }

    // UPLOAD PHOTO
    @PostMapping(value = "/{id}/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void uploadPhoto(
            @PathVariable UUID id,
            @RequestParam("file") MultipartFile file) {
        adminUserService.updateUserPhoto(id, file);
    }
}
