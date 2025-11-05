package com.example.LautaroDieselEcommerce.repository.descuento;

import com.example.LautaroDieselEcommerce.entity.descuento.DescuentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DescuentoRepository extends JpaRepository<DescuentoEntity, Long> {

    List<DescuentoEntity> findByActivoTrueAndFechaInicioBeforeAndFechaFinAfter(LocalDateTime now1, LocalDateTime now2);
}
