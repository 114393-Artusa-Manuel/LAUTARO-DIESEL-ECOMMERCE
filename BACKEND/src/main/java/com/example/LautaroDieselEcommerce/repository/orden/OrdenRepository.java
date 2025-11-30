package com.example.LautaroDieselEcommerce.repository.orden;

import com.example.LautaroDieselEcommerce.entity.orden.OrdenEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface OrdenRepository extends JpaRepository<OrdenEntity, Long> {
	@Query("select o from OrdenEntity o left join fetch o.items it left join fetch it.producto p where o.idOrden = :id")
	java.util.Optional<OrdenEntity> findByIdWithItemsAndProducts(@Param("id") Long id);
}
