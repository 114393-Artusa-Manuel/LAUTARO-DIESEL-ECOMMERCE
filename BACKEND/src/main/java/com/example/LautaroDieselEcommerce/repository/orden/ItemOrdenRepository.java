package com.example.LautaroDieselEcommerce.repository.orden;

import com.example.LautaroDieselEcommerce.dto.report.TopItemDto;
import com.example.LautaroDieselEcommerce.entity.orden.ItemOrdenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ItemOrdenRepository extends JpaRepository<ItemOrdenEntity, Long> {

    @Query("select new com.example.LautaroDieselEcommerce.dto.report.TopItemDto(" +
            "i.producto.idProducto, i.producto.nombre, sum(i.cantidad), sum(i.precioUnitario * i.cantidad) ) " +
            "from ItemOrdenEntity i " +
            "where i.orden.fechaCreacion >= :from and i.orden.fechaCreacion <= :to " +
            "group by i.producto.idProducto, i.producto.nombre " +
            "order by sum(i.cantidad) desc")
    List<TopItemDto> findTopItemsBetween(@Param("from") LocalDateTime from, @Param("to") LocalDateTime to);
}
