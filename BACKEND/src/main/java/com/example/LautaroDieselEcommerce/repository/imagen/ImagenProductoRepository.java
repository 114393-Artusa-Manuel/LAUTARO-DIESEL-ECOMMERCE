package com.example.LautaroDieselEcommerce.repository.imagen;

import com.example.LautaroDieselEcommerce.entity.imagen.ImagenProductoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ImagenProductoRepository extends JpaRepository<ImagenProductoEntity, Long> {
    List<ImagenProductoEntity> findByProducto_IdProductoOrderByOrdenAsc(Long idProducto);
}

