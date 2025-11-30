package com.example.LautaroDieselEcommerce.dto.pago;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoFullDto {
    private Long id;
    private String orderId;
    private String preferenceId;
    private String paymentId;
    private String status;
    private String statusDetail;
    private BigDecimal amount;
    private String currency;
    private String payerEmail;
    private String paymentMethod;
    private LocalDateTime dateCreated;
    private LocalDateTime dateApproved;
    private LocalDateTime updatedAt;
    private String rawNotificationJson;
}
