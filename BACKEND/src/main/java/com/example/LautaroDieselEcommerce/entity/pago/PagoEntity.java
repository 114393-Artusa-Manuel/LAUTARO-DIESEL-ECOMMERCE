package com.example.LautaroDieselEcommerce.entity.pago;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Pagos")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PagoEntity {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false) private String orderId;       // relaciona con tu Orden
    @Column(nullable = false) private String preferenceId;  // MP preference ID
    private String paymentId;                               // MP payment ID
    private String status;                                  // approved, pending, rejected
    private String statusDetail;                            // detalle de MP

    @Column(precision = 18, scale = 2)
    private BigDecimal amount;
    private String currency;                                // ARS
    private String payerEmail;

    private LocalDateTime dateCreated;
    private LocalDateTime dateApproved;
    private LocalDateTime updatedAt;

    @Lob
    private String rawNotificationJson;                     // opcional
}
