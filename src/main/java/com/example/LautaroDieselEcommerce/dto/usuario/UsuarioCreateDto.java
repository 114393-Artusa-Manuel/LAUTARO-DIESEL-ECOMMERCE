package com.example.LautaroDieselEcommerce.dto.usuario;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioCreateDto {

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    private String correo;

    @NotBlank(message = "La clave es obligatoria")
    private String clave;

    @NotBlank(message = "El nombre completo es obligatorio")
    private String nombreCompleto;

    private String telefono;

    private String segmento;

    private Set<Long> rolesIds;
}
