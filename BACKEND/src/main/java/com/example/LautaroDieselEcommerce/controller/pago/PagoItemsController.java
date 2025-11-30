package com.example.LautaroDieselEcommerce.controller.pago;

import com.example.LautaroDieselEcommerce.config.BaseResponse;
import com.example.LautaroDieselEcommerce.dto.pago.PagoItemDto;
import com.example.LautaroDieselEcommerce.entity.orden.ItemOrdenEntity;
import com.example.LautaroDieselEcommerce.entity.orden.OrdenEntity;
import com.example.LautaroDieselEcommerce.entity.pago.PagoEntity;
import com.example.LautaroDieselEcommerce.repository.orden.OrdenRepository;
import com.example.LautaroDieselEcommerce.repository.pago.PagoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.example.LautaroDieselEcommerce.repository.producto.VarianteRepository;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
public class PagoItemsController {

    private final PagoRepository pagoRepository;
    private final OrdenRepository ordenRepository;
    private final VarianteRepository varianteRepository;

    @GetMapping("/{pagoId}/items")
    public ResponseEntity<BaseResponse<List<PagoItemDto>>> getItemsByPagoId(@PathVariable Long pagoId) {
        Optional<PagoEntity> optPago = pagoRepository.findById(pagoId);
        if (optPago.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new BaseResponse<>("Pago no encontrado", HttpStatus.NOT_FOUND.value(), Collections.emptyList()));
        }
        PagoEntity pago = optPago.get();
        String orderIdStr = pago.getOrderId();
        try {
            Long orderId = Long.parseLong(orderIdStr);
            return getItemsByOrderIdInternal(orderId);
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new BaseResponse<>("orderId del pago no es numérico: " + orderIdStr, HttpStatus.BAD_REQUEST.value(), Collections.emptyList()));
        }
    }

    @GetMapping("/order/{orderId}/items")
    public ResponseEntity<BaseResponse<List<PagoItemDto>>> getItemsByOrderId(@PathVariable Long orderId) {
        return getItemsByOrderIdInternal(orderId);
    }

    private ResponseEntity<BaseResponse<List<PagoItemDto>>> getItemsByOrderIdInternal(Long orderId) {
        Optional<OrdenEntity> optOrden = ordenRepository.findByIdWithItemsAndProducts(orderId);
        if (optOrden.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new BaseResponse<>("Orden no encontrada", HttpStatus.NOT_FOUND.value(), Collections.emptyList()));
        }
        OrdenEntity orden = optOrden.get();
        List<ItemOrdenEntity> items = orden.getItems();
        List<PagoItemDto> dtos = items == null ? Collections.emptyList() : items.stream().map(i -> {
            // Determine effective unit price as BigDecimal: item.precioUnitario -> producto.precio -> variante.precioBase
            BigDecimal precioUnitBd = BigDecimal.ZERO;

            if (i.getPrecioUnitario() != null && i.getPrecioUnitario() > 0) {
                precioUnitBd = BigDecimal.valueOf(i.getPrecioUnitario());
            } else if (i.getProducto() != null && i.getProducto().getPrecio() != null
                    && i.getProducto().getPrecio().compareTo(BigDecimal.ZERO) > 0) {
                precioUnitBd = i.getProducto().getPrecio();
            } else if (i.getProducto() != null && i.getProducto().getIdProducto() != null) {
                precioUnitBd = varianteRepository
                        .findFirstByProducto_IdProductoOrderByIdVarianteAsc(i.getProducto().getIdProducto())
                        .flatMap(v -> java.util.Optional.ofNullable(v.getPrecioBase()))
                        .orElse(BigDecimal.ZERO);
            }

            BigDecimal subtotal = precioUnitBd.multiply(BigDecimal.valueOf(i.getCantidad() == null ? 0 : i.getCantidad()));

            return PagoItemDto.builder()
                    .idItemOrden(i.getIdItemOrden())
                    .idProducto(i.getProducto() == null ? null : i.getProducto().getIdProducto())
                    .productoNombre(i.getProducto() == null ? null : i.getProducto().getNombre())
                    .cantidad(i.getCantidad())
                    .precioUnitario(precioUnitBd)
                    .subtotal(subtotal)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(new BaseResponse<>("Items de la orden", HttpStatus.OK.value(), dtos));
    }
}
