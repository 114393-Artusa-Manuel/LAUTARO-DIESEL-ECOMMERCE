package com.example.LautaroDieselEcommerce.entity.descuento;

import com.example.LautaroDieselEcommerce.entity.producto.CategoriaEntity;
import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Descuento")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class DescuentoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idDescuento;

    @Column(nullable = false)
    private BigDecimal porcentaje; // ej: 10 = 10%

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdCategoria", nullable = true)
    private CategoriaEntity categoria; // descuento por categoría

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdUsuario", nullable = true)
    private UsuarioEntity usuario; // descuento personalizado

    private LocalDateTime fechaInicio;
    private LocalDateTime fechaFin;

    private Boolean activo;
}
