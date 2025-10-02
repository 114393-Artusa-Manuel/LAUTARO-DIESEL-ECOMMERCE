package com.example.LautaroDieselEcommerce.controller.usuario;

import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.dto.usuario.UsuarioCreateDto;
import com.example.LautaroDieselEcommerce.dto.usuario.UsuarioDto;
import com.example.LautaroDieselEcommerce.dto.usuario.UsuarioUpdateDto;
import com.example.LautaroDieselEcommerce.service.UsuarioService;

import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @PostMapping
    public BaseResponse<UsuarioDto> crearUsuario(@Valid @RequestBody UsuarioCreateDto dto) {
        return usuarioService.crearUsuario(dto);
    }

    @PutMapping("/{id}")
    public BaseResponse<UsuarioDto> actualizarUsuario(@PathVariable Long id, @Valid @RequestBody UsuarioUpdateDto dto) {
        return usuarioService.actualizarUsuario(id, dto);
    }

    @DeleteMapping("/{id}")
    public BaseResponse<String> eliminarUsuario(@PathVariable Long id) {
        return usuarioService.eliminarUsuario(id);
    }

    @GetMapping("/{id}")
    public BaseResponse<UsuarioDto> obtenerUsuario(@PathVariable Long id) {
        return usuarioService.obtenerUsuarioPorId(id);
    }

    @GetMapping
    public BaseResponse<List<UsuarioDto>> listarUsuarios() {
        return usuarioService.listarUsuarios();
    }
}
