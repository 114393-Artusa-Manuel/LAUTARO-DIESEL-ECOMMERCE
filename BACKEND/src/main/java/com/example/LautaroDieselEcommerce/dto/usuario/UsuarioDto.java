package com.example.LautaroDieselEcommerce.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioDto {

    private Long id;
    private String correo;
    private String nombreCompleto;
    private String telefono;
    private String segmento;
    private Boolean activo;
    private List<String> roles;
}
