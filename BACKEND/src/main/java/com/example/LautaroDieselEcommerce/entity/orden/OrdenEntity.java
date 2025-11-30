package com.example.LautaroDieselEcommerce.entity.orden;

import com.example.LautaroDieselEcommerce.entity.usuario.UsuarioEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "Orden")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrdenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idOrden;

    private LocalDateTime fechaCreacion;

    private String estado; // "PENDIENTE", "CONFIRMADA", "RECHAZADA"

    @Column(precision = 10, scale = 2)
    private BigDecimal total;

    @ManyToOne
    @JoinColumn(name = "IdUsuario", nullable = true)
    private UsuarioEntity usuario;


    @OneToMany(mappedBy = "orden", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemOrdenEntity> items;
}
