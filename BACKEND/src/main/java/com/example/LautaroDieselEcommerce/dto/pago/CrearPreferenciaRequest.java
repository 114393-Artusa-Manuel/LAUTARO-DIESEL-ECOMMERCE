package com.example.LautaroDieselEcommerce.dto.pago;

import lombok.*;
import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CrearPreferenciaRequest {
    private String orderId;
    private String payerEmail;
    private String currency; // e.g. "ARS"
    private List<Item> items;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Item {
        private String id;
        private String title;
        private int quantity;
        private BigDecimal unitPrice;
    }
}
