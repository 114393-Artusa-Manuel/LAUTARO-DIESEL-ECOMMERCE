package com.example.LautaroDieselEcommerce.dto.pago;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearPreferenciaResponse {
    private String preferenceId;
    private String initPoint;
    private String sandboxInitPoint;
}
