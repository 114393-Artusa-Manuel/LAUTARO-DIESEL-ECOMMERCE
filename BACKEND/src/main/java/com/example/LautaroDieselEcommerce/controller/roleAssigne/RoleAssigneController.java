package com.example.LautaroDieselEcommerce.controller.roleAssigne;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.LautaroDieselEcommerce.dto.usuario_roles.RoleAssignRequest;
import com.example.LautaroDieselEcommerce.service.UsuarioRoleService;



@RestController
@RequestMapping("/RoleAssigne")
public class RoleAssigneController {
    private final UsuarioRoleService usuarioRoleService;

    public RoleAssigneController(UsuarioRoleService usuarioRoleService) {
        this.usuarioRoleService = usuarioRoleService;
    }

    @PatchMapping("/{idUsuario}/roles/add")
    public ResponseEntity<?> addRole(
            @PathVariable("idUsuario") Long idUsuario,
            @RequestBody RoleAssignRequest body) {

        if (body == null || body.getRoleId() == null) {
            return ResponseEntity.badRequest().body("roleId is required in request body");
        }

        try {
            usuarioRoleService.addRole(idUsuario, body.getRoleId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(500).body(ex.getMessage());
        }
    }
}
