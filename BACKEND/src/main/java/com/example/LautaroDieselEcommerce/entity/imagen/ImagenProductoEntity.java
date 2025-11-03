package com.example.LautaroDieselEcommerce.entity.imagen;

import com.example.LautaroDieselEcommerce.entity.producto.ProductoEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "ImagenProducto")
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ImagenProductoEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdImagen")
    private Long idImagen;

    @Column(name = "Url", nullable = false, length = 500)
    private String url;

    @Column(name = "TextoAlt", length = 200)
    private String textoAlt;

    @Column(name = "Orden", nullable = false)
    private int orden;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "IdProducto", nullable = false)
    private ProductoEntity producto;
}
