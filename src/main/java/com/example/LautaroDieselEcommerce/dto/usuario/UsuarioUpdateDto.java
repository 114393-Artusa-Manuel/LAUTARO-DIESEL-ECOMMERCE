package com.example.LautaroDieselEcommerce.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UsuarioUpdateDto {

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    private String correo;

    private String clave; // opcional al editar

    @NotBlank(message = "El nombre completo es obligatorio")
    private String nombreCompleto;

    private String telefono;

    private String segmento;

    private Set<Long> rolesIds;
}
