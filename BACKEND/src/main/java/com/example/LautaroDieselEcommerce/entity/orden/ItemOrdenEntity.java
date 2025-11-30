package com.example.LautaroDieselEcommerce.entity.orden;

import com.example.LautaroDieselEcommerce.entity.producto.ProductoEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "ItemOrden")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemOrdenEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idItemOrden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdOrden")
    private OrdenEntity orden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdProducto")
    private ProductoEntity producto;

    private Integer cantidad;

    private Double precioUnitario;
}
