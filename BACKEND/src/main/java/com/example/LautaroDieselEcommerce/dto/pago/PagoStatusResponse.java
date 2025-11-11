package com.example.LautaroDieselEcommerce.dto.pago;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoStatusResponse {
    private String orderId;
    private String preferenceId;
    private String paymentId;
    private String status;
    private String statusDetail;
}
