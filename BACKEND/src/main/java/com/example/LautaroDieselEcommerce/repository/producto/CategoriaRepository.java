package com.example.LautaroDieselEcommerce.repository.producto;

import com.example.LautaroDieselEcommerce.entity.producto.CategoriaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CategoriaRepository extends JpaRepository<CategoriaEntity, Long> {
    boolean existsByNombreIgnoreCase(String nombre);
    boolean existsBySlugIgnoreCase(String slug);
    List<CategoriaEntity> findAllByActivaTrueOrderByNombreAsc();
}
