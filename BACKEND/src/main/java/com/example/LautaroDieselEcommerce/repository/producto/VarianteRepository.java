package com.example.LautaroDieselEcommerce.repository.producto;

import com.example.LautaroDieselEcommerce.entity.producto.VarianteEntity;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface VarianteRepository extends JpaRepository<VarianteEntity, Long> {
    Optional<VarianteEntity> findFirstByProducto_IdProductoOrderByIdVarianteAsc(Long idProducto);
}