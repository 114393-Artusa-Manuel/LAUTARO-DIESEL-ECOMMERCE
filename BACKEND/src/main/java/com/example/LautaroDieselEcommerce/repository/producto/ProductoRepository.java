package com.example.LautaroDieselEcommerce.repository.producto;

import com.example.LautaroDieselEcommerce.entity.producto.ProductoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<ProductoEntity, Long> {
    Optional<ProductoEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);

    @Query("""
        SELECT DISTINCT p FROM ProductoEntity p
        LEFT JOIN FETCH p.categorias c
        LEFT JOIN FETCH p.marcas m
        LEFT JOIN FETCH p.imagenes i
        WHERE (:categoriaId IS NULL OR c.idCategoria = :categoriaId)
        AND (:marcaId IS NULL OR m.idMarca = :marcaId)
        AND (:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
        AND p.activo = true
        ORDER BY p.fechaCreacion DESC
    """)
    List<ProductoEntity> filtrarProductos(
            @Param("categoriaId") Long categoriaId,
            @Param("marcaId") Long marcaId,
            @Param("nombre") String nombre
    );

    @Query("""
    SELECT p
    FROM ProductoEntity p
    WHERE p.activo = true
      AND p.stock <= :threshold
    ORDER BY p.stock ASC, p.nombre ASC
  """)
    List<ProductoEntity> findLowStock(@Param("threshold") Integer threshold);
}
