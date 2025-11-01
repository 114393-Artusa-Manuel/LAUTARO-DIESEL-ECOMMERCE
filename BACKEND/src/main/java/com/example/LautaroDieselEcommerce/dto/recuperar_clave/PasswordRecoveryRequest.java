package com.example.LautaroDieselEcommerce.dto.recuperar_clave;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordRecoveryRequest {
    @NotBlank @Email
    private String correo;
}
