package com.example.LautaroDieselEcommerce.service;

import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.dto.usuario.UsuarioCreateDto;
import com.example.LautaroDieselEcommerce.dto.usuario.UsuarioDto;
import com.example.LautaroDieselEcommerce.dto.usuario.UsuarioUpdateDto;

import java.util.List;

public interface UsuarioService {
    BaseResponse<UsuarioDto> crearUsuario(UsuarioCreateDto dto);
    BaseResponse<UsuarioDto> actualizarUsuario(Long id, UsuarioUpdateDto dto);
    BaseResponse<String> eliminarUsuario(Long id);
    BaseResponse<UsuarioDto> obtenerUsuarioPorId(Long id);
    BaseResponse<List<UsuarioDto>> listarUsuarios();
}
