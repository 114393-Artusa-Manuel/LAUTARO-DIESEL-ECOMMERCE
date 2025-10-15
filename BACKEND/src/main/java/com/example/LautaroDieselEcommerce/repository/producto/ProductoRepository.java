package com.example.LautaroDieselEcommerce.repository.producto;

import com.example.LautaroDieselEcommerce.entity.producto.ProductoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<ProductoEntity, Long> {
    Optional<ProductoEntity> findBySlug(String slug);
    boolean existsBySlug(String slug);
}
