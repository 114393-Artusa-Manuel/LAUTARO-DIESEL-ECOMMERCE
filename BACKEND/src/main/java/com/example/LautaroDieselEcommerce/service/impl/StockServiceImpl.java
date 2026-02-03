package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.stock.CrearSolicitudReposicionRequest;
import com.example.LautaroDieselEcommerce.dto.stock.CrearSolicitudReposicionResponse;
import com.example.LautaroDieselEcommerce.dto.stock.StockLowItemDto;
import com.example.LautaroDieselEcommerce.entity.producto.CategoriaEntity;
import com.example.LautaroDieselEcommerce.entity.producto.MarcaEntity;
import com.example.LautaroDieselEcommerce.entity.producto.ProductoEntity;
import com.example.LautaroDieselEcommerce.repository.producto.ProductoRepository;
import com.example.LautaroDieselEcommerce.service.StockService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockServiceImpl implements StockService {

    private final ProductoRepository productoRepository;

    public StockServiceImpl(ProductoRepository productoRepository) {
        this.productoRepository = productoRepository;
    }

    @Override
    public List<StockLowItemDto> getLowStock(Integer threshold, Integer targetStock) {
        int th = (threshold == null ? 2 : threshold);
        int target = (targetStock == null ? 10 : targetStock);

        return productoRepository.findLowStock(th)
                .stream()
                .map(p -> mapToLowStockDto(p, th, target))
                .collect(Collectors.toList());
    }

    private StockLowItemDto mapToLowStockDto(ProductoEntity p, int th, int target) {
        StockLowItemDto dto = new StockLowItemDto();

        dto.setProductoId(p.getIdProducto());
        dto.setNombre(p.getNombre());

        // marcas/categorias son SET -> tomamos la primera (o null)
        dto.setMarca(getFirstMarcaNombre(p));
        dto.setCategoria(getFirstCategoriaNombre(p));

        int stockActual = (p.getStock() == null ? 0 : p.getStock());
        dto.setStockActual(stockActual);

        dto.setUmbral(th);
        dto.setSugeridoReponer(Math.max(0, target - stockActual));
        dto.setActivo(p.getActivo() != null ? p.getActivo() : true);

        return dto;
    }

    private String getFirstMarcaNombre(ProductoEntity p) {
        if (p.getMarcas() == null || p.getMarcas().isEmpty()) return null;
        MarcaEntity m = p.getMarcas().iterator().next();
        return m != null ? m.getNombre() : null;
    }

    private String getFirstCategoriaNombre(ProductoEntity p) {
        if (p.getCategorias() == null || p.getCategorias().isEmpty()) return null;
        CategoriaEntity c = p.getCategorias().iterator().next();
        return c != null ? c.getNombre() : null;
    }

    @Override
    public CrearSolicitudReposicionResponse crearSolicitudReposicion(CrearSolicitudReposicionRequest req) {
        if (req == null || req.getItems() == null || req.getItems().isEmpty()) {
            throw new RuntimeException("Debe incluir items");
        }

        // ✅ SIMULADO: no persiste en DB (por ahora)
        CrearSolicitudReposicionResponse resp = new CrearSolicitudReposicionResponse();
        resp.setSolicitudId(System.currentTimeMillis());
        resp.setTotalItems(req.getItems().size());
        resp.setEstado("PENDIENTE");
        return resp;
    }
}
