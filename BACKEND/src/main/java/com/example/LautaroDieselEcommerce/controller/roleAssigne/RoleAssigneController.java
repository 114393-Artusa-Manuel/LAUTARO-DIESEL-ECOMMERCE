package com.example.LautaroDieselEcommerce.controller.roleAssigne;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.LautaroDieselEcommerce.dto.usuario_roles.RoleAssignRequest;
import com.example.LautaroDieselEcommerce.service.UsuarioRoleService;
import com.example.LautaroDieselEcommerce.config.JwtTokenUtil;

@CrossOrigin(origins = "http://localhost:4200", allowCredentials = "true")
@RestController
@RequestMapping("/RoleAssigne")
public class RoleAssigneController {

    private final UsuarioRoleService usuarioRoleService;
    private final JwtTokenUtil jwtTokenUtil;

    public RoleAssigneController(UsuarioRoleService usuarioRoleService, JwtTokenUtil jwtTokenUtil) {
        this.usuarioRoleService = usuarioRoleService;
        this.jwtTokenUtil = jwtTokenUtil;
    }

    // --- Obtener roles de un usuario ---
    @GetMapping("/{idUsuario}/roles")
    public ResponseEntity<Object> getUserRoles(@PathVariable Long idUsuario) {
        return ResponseEntity.ok(usuarioRoleService.getRoles(idUsuario));
    }

    // --- Agregar uno o varios roles ---
    @PatchMapping("/{idUsuario}/roles/add")
    public ResponseEntity<?> addRole(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("idUsuario") Long idUsuario,
            @RequestBody RoleAssignRequest body) {

        if (body == null || (body.getRoleId() == null && (body.getRoleIds() == null || body.getRoleIds().isEmpty())))
            return ResponseEntity.badRequest().body("roleId or roleIds is required in request body");

        if (!isAdmin(authorization))
            return ResponseEntity.status(403).body("Forbidden: admin role required");

        try {
            if (body.getRoleIds() != null && !body.getRoleIds().isEmpty()) {
                for (Long rid : body.getRoleIds()) usuarioRoleService.addRole(idUsuario, rid);
            } else {
                usuarioRoleService.addRole(idUsuario, body.getRoleId());
            }
            return ResponseEntity.ok().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }

    // --- Reemplazar todos los roles (idempotente) ---
    @PutMapping("/{idUsuario}/roles")
    public ResponseEntity<?> setRoles(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long idUsuario,
            @RequestBody RoleIds body) {

        if (body == null || body.roleIds == null)
            return ResponseEntity.badRequest().body("roleIds required");

        if (!isAdmin(authorization))
            return ResponseEntity.status(403).body("Forbidden: admin role required");

        try {
            usuarioRoleService.setRoles(idUsuario, body.roleIds);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }

    // --- Remover varios roles ---
    @DeleteMapping("/{idUsuario}/roles/remove")
    public ResponseEntity<?> removeRoles(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable Long idUsuario,
            @RequestBody RoleIds body) {

        if (body == null || body.roleIds == null)
            return ResponseEntity.badRequest().body("roleIds required");

        if (!isAdmin(authorization))
            return ResponseEntity.status(403).body("Forbidden: admin role required");

        try {
            usuarioRoleService.removeRole(idUsuario, body.roleIds);
            return ResponseEntity.noContent().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }

    // ---- Helper: valida Bearer y rol admin/administrador ----
    private boolean isAdmin(String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            System.out.println("AUTH header ausente o sin Bearer");
            return false;
        }
        try {
            String token = authorization.substring(7);
            var roles = jwtTokenUtil.getRolesFromToken(token); // ya en minúsculas
            System.out.println("ROLES_FROM_TOKEN=" + roles);
            if (roles == null) return false;
            for (String r : roles) {
                if (r == null) continue;
                String n = r.trim();
                if (n.equals("admin") || n.equals("Administrador") || n.contains("admin")) return true;
            }
            return false;
        } catch (Exception e) {
            System.out.println("JWT parse error: " + e.getMessage());
            return false;
        }
    }

    // ---- DTO interno para PUT/DELETE ----
    public static class RoleIds {
        public Long roleId;        // opcional legacy
        public List<Long> roleIds; // preferido
    }
}
