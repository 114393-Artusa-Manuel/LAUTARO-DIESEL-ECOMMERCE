package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.orden.OrdenRequestDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.orden.ItemOrdenEntity;
import com.example.LautaroDieselEcommerce.entity.orden.OrdenEntity;
import com.example.LautaroDieselEcommerce.entity.producto.ProductoEntity;
import com.example.LautaroDieselEcommerce.repository.orden.OrdenRepository;
import com.example.LautaroDieselEcommerce.repository.producto.ProductoRepository;
import com.example.LautaroDieselEcommerce.service.OrdenService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OrdenServiceImpl implements OrdenService {

    private final ProductoRepository productoRepository;
    private final OrdenRepository ordenRepository;

    @Override
    @Transactional
    public BaseResponse<?> confirmarOrden(OrdenRequestDto request) {
        if (request.getItems() == null || request.getItems().isEmpty()) {
            return new BaseResponse<>("La orden no tiene productos", 400, null);
        }

        // Validar stock
        for (var item : request.getItems()) {
            ProductoEntity producto = productoRepository.findById(item.getIdProducto())
                    .orElse(null);

            if (producto == null) {
                return new BaseResponse<>("Producto no encontrado (ID: " + item.getIdProducto() + ")", 404, null);
            }

            if (producto.getStock() == null || producto.getStock() < item.getCantidad()) {
                return new BaseResponse<>("Stock insuficiente para el producto: " + producto.getNombre(), 400, null);
            }
        }

        // Crear la orden y descontar stock
        OrdenEntity orden = new OrdenEntity();
        orden.setFechaCreacion(LocalDateTime.now());
        orden.setEstado("CONFIRMADA");

        List<ItemOrdenEntity> items = request.getItems().stream().map(item -> {
            ProductoEntity producto = productoRepository.findById(item.getIdProducto()).orElseThrow();
            producto.setStock(producto.getStock() - item.getCantidad());
            productoRepository.save(producto);

            return ItemOrdenEntity.builder()
                    .orden(orden)
                    .producto(producto)
                    .cantidad(item.getCantidad())
                    .precioUnitario(
                            producto.getPrecio() != null ?
                                    producto.getPrecio().doubleValue() :
                                    0.0
                    )
                    .build();
        }).toList();

        orden.setItems(items);
        ordenRepository.save(orden);

        return new BaseResponse<>("Orden confirmada correctamente", 201, orden.getIdOrden());
    }
}
