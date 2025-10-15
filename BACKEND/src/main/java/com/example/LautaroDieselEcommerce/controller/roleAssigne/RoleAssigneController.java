package com.example.LautaroDieselEcommerce.controller.roleAssigne;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import com.example.LautaroDieselEcommerce.dto.usuario_roles.RoleAssignRequest;
import com.example.LautaroDieselEcommerce.entity.usuario.RolEntity;
import com.example.LautaroDieselEcommerce.service.UsuarioRoleService;
import com.example.LautaroDieselEcommerce.config.JwtTokenUtil;



@RestController
@RequestMapping("/RoleAssigne")
public class RoleAssigneController {
    private final UsuarioRoleService usuarioRoleService;
    private final JwtTokenUtil jwtTokenUtil;

    public RoleAssigneController(UsuarioRoleService usuarioRoleService, JwtTokenUtil jwtTokenUtil) {
        this.usuarioRoleService = usuarioRoleService;
        this.jwtTokenUtil = jwtTokenUtil;
    }
    @GetMapping("/{idUsuario}/roles")
    public ResponseEntity<Object> getUserRoles(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(usuarioRoleService.getRoles(idUsuario));
    }

    @PatchMapping("/{idUsuario}/roles/add")
    public ResponseEntity<?> addRole(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("idUsuario") Long idUsuario,
            @RequestBody RoleAssignRequest body) {

        if (body == null || body.getRoleId() == null) {
            return ResponseEntity.badRequest().body("roleId is required in request body");
        }

        // Verificar token Bearer
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(401).body("Authorization header missing or invalid");
        }

        String token = authorization.substring("Bearer ".length());
        try {
            var roles = jwtTokenUtil.getRolesFromToken(token);
            boolean isAdmin = roles.stream().anyMatch(r -> r.equalsIgnoreCase("admin"));
            if (!isAdmin) {
                return ResponseEntity.status(403).body("Forbidden: admin role required");
            }
        } catch (Exception ex) {
            return ResponseEntity.status(401).body("Invalid token: " + ex.getMessage());
        }

        try {
            usuarioRoleService.addRole(idUsuario, body.getRoleId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }

    @PutMapping("/{idUsuario}/roles")
    public ResponseEntity<?> setRoles(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long idUsuario,
            @RequestBody RoleIds body) {

        if (body == null || body.roleIds == null)
            return ResponseEntity.badRequest().body("roleIds required");

        if (!isAdmin(authorization)) return ResponseEntity.status(403).body("Forbidden");

        try {
            usuarioRoleService.setRoles(idUsuario, body.roleIds);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }
    @DeleteMapping("/{idUsuario}/roles/remove")
    public ResponseEntity<?> removeRoles(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long idUsuario,
            @RequestBody RoleIds body) {

        if (body == null || body.roleIds == null)
            return ResponseEntity.badRequest().body("roleIds required");

        if (!isAdmin(authorization)) return ResponseEntity.status(403).body("Forbidden");

        try {
            usuarioRoleService.removeRole(idUsuario, body.roleIds);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }
    @PatchMapping("/{idUsuario}/roles/add")
    public ResponseEntity<?> addRole(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long idUsuario,
            @RequestBody RoleIds body) {

        if (body == null || (body.roleIds == null && body.roleId == null))
            return ResponseEntity.badRequest().body("roleIds or roleId required");

        if (!isAdmin(authorization)) return ResponseEntity.status(403).body("Forbidden");

        try {
            if (body.roleIds != null) usuarioRoleService.addRole(idUsuario, body.roleIds);
            else usuarioRoleService.addRole(idUsuario, body.roleId);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }
    private boolean isAdmin(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) return false;
        String token = authorization.substring("Bearer ".length());
        var roles = jwtTokenUtil.getRolesFromToken(token);
        return roles.stream().anyMatch(r -> r.equalsIgnoreCase("admin"));
    }
    public static class RoleIds {
        public Long roleId;           // soporte body antiguo
        public List<Long> roleIds;    // preferido
    }
}
