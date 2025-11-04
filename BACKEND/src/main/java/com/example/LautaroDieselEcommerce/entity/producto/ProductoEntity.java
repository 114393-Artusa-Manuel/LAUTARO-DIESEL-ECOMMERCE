package com.example.LautaroDieselEcommerce.entity.producto;

import com.example.LautaroDieselEcommerce.entity.imagen.ImagenProductoEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "Producto")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProductoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "IdProducto")
    private Long idProducto;

    @Column(name = "Nombre", nullable = false, length = 200)
    private String nombre;

    @Column(name = "Slug", nullable = false, length = 220, unique = true)
    private String slug;

    @Column(name = "Descripcion", columnDefinition = "NVARCHAR(MAX)")
    private String descripcion;

    @Column(name = "Activo", nullable = false)
    private Boolean activo = true;

    @Column(name = "Precio", nullable = false)
    private BigDecimal precio = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(name = "Descuento")
    private Integer descuento = 0;

    @Column(name = "FechaCreacion", nullable = false)
    private LocalDateTime fechaCreacion = LocalDateTime.now();

    @Column(name = "FechaActualizacion", nullable = false)
    private LocalDateTime fechaActualizacion = LocalDateTime.now();

    /* ==== Relaciones ==== */
    @ManyToMany
@JoinTable(
    name = "ProductoMarca",
    joinColumns = @JoinColumn(name = "IdProducto"),
    inverseJoinColumns = @JoinColumn(name = "IdMarca")
)
private Set<MarcaEntity> marcas = new HashSet<>();

@ManyToMany
@JoinTable(
    name = "ProductoCategoria",
    joinColumns = @JoinColumn(name = "IdProducto"),
    inverseJoinColumns = @JoinColumn(name = "IdCategoria")
)
private Set<CategoriaEntity> categorias = new HashSet<>();

    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orden ASC")
    private List<ImagenProductoEntity> imagenes;

}
