package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.imagen.ImagenProductoDto;
import com.example.LautaroDieselEcommerce.dto.producto.ProductoDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.producto.CategoriaEntity;
import com.example.LautaroDieselEcommerce.entity.producto.MarcaEntity;
import com.example.LautaroDieselEcommerce.entity.producto.ProductoEntity;
import com.example.LautaroDieselEcommerce.entity.producto.VarianteEntity;
import com.example.LautaroDieselEcommerce.repository.producto.ProductoRepository;
import com.example.LautaroDieselEcommerce.repository.producto.VarianteRepository;
import com.example.LautaroDieselEcommerce.service.ProductoService;
import com.example.LautaroDieselEcommerce.service.MarcaService;
import com.example.LautaroDieselEcommerce.service.CategoriaService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    @Autowired
    private ProductoRepository productoRepository;
    private final VarianteRepository varianteRepository;
    private final MarcaService marcaService;
    private final CategoriaService categoriaService;

    @Override
    @Transactional
    public BaseResponse<ProductoDto> create(ProductoDto dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank())
            return new BaseResponse<>("Nombre requerido", 400, null);
        if (dto.getSlug() == null || dto.getSlug().isBlank())
            return new BaseResponse<>("Slug requerido", 400, null);
        if (productoRepository.existsBySlug(dto.getSlug()))
            return new BaseResponse<>("El slug ya existe", 400, null);

    // Validate marcas / categorias IDs using services (if provided)
    if (dto.getMarcasIds() != null && !dto.getMarcasIds().isEmpty()) {
        var invalid = dto.getMarcasIds().stream()
            .filter(mid -> mid != null && mid > 0)
            .filter(mid -> marcaService.getById(mid).getStatus() != 200)
            .toList();
        if (!invalid.isEmpty()) return new BaseResponse<ProductoDto>("Marcas inválidas: " + invalid, 400, null);
    }
    if (dto.getCategoriasIds() != null && !dto.getCategoriasIds().isEmpty()) {
        var invalidCat = dto.getCategoriasIds().stream()
            .filter(cid -> cid != null && cid > 0)
            .filter(cid -> categoriaService.getById(cid).getStatus() != 200)
            .toList();
        if (!invalidCat.isEmpty()) return new BaseResponse<ProductoDto>("Categorias inválidas: " + invalidCat, 400, null);
    }

    // Producto
        ProductoEntity entity = toEntity(dto);
        entity.setFechaCreacion(LocalDateTime.now());
        entity.setFechaActualizacion(LocalDateTime.now());
        ProductoEntity saved = productoRepository.save(entity);

        // Variante por defecto
    VarianteEntity variante = VarianteEntity.builder()
        .producto(saved)
        .sku(generarSkuAuto(saved))                 // OBLIGATORIO
        .precioBase(safePrecio(dto.getPrecio()))
        .moneda(safeMoneda(dto.getMoneda()))
        .activo(dto.getVarianteActiva() == null ? true : dto.getVarianteActiva())
        .build();

    // Ensure non-null required fields before persisting to avoid DB constraint violations
    if (variante.getActivo() == null) variante.setActivo(true);
    if (variante.getMoneda() == null || variante.getMoneda().isBlank()) variante.setMoneda("ARS");
    if (variante.getFechaCreacion() == null) variante.setFechaCreacion(LocalDateTime.now());
    if (variante.getFechaActualizacion() == null) variante.setFechaActualizacion(LocalDateTime.now());

        System.out.println("💰 Precio recibido en DTO: " + dto.getPrecio());

        varianteRepository.save(variante);

        return new BaseResponse<>("Producto creado correctamente", 201, toDto(saved));
    }

    @Override
    @Transactional
    public BaseResponse<ProductoDto> update(Long id, ProductoDto dto) {
        return productoRepository.findById(id)
                .map(producto -> {
                    if (dto.getNombre() != null) producto.setNombre(dto.getNombre());
                    if (dto.getSlug() != null)   producto.setSlug(dto.getSlug());
                    producto.setDescripcion(dto.getDescripcion());
                    if (dto.getActivo() != null) producto.setActivo(dto.getActivo());
                    producto.setFechaActualizacion(LocalDateTime.now());
                    if (dto.getStock() != null) producto.setStock(dto.getStock());

                    if (dto.getMarcasIds() != null) {
            // validate marca ids
            var invalid = dto.getMarcasIds().stream()
                .filter(mid -> mid != null && mid > 0)
                .filter(mid -> marcaService.getById(mid).getStatus() != 200)
                .toList();
            if (!invalid.isEmpty()) return new BaseResponse<ProductoDto>("Marcas inválidas: " + invalid, 400, null);

                        Set<MarcaEntity> marcas = dto.getMarcasIds().stream()
                                .filter(mid -> mid != null && mid > 0)
                                .map(mid -> MarcaEntity.builder().idMarca(mid).build())
                                .collect(Collectors.toSet());
                        producto.setMarcas(marcas);
                    }
                    if (dto.getCategoriasIds() != null) {
            // validate categoria ids
            var invalidCat = dto.getCategoriasIds().stream()
                .filter(cid -> cid != null && cid > 0)
                .filter(cid -> categoriaService.getById(cid).getStatus() != 200)
                .toList();
            if (!invalidCat.isEmpty()) return new BaseResponse<ProductoDto>("Categorias inválidas: " + invalidCat, 400, null);

                        Set<CategoriaEntity> categorias = dto.getCategoriasIds().stream()
                                .filter(cid -> cid != null && cid > 0)
                                .map(cid -> CategoriaEntity.builder().idCategoria(cid).build())
                                .collect(Collectors.toSet());
                        producto.setCategorias(categorias);
                    }

                    ProductoEntity updated = productoRepository.save(producto);

                    if (dto.getPrecio() != null || dto.getMoneda() != null || dto.getVarianteActiva() != null) {
                        VarianteEntity v = varianteRepository
                                .findFirstByProducto_IdProductoOrderByIdVarianteAsc(id)
                                .orElseGet(() -> VarianteEntity.builder()
                                        .producto(updated)
                                        .sku(generarSkuAuto(updated))
                                        .precioBase(BigDecimal.ZERO)
                                        .moneda("ARS")
                                        .activo(true)
                                        .build());

                        if (dto.getPrecio() != null)         v.setPrecioBase(safePrecio(dto.getPrecio()));
                        if (dto.getMoneda() != null)         v.setMoneda(safeMoneda(dto.getMoneda()));
                        if (dto.getVarianteActiva() != null) v.setActivo(dto.getVarianteActiva());

                        varianteRepository.save(v);
                    }

                    return new BaseResponse<>("Producto actualizado correctamente", 200, toDto(updated));
                })
                .orElse(new BaseResponse<>("Producto no encontrado", 404, null));
    }

    @Override
    public BaseResponse<java.util.List<ProductoDto>> getAll() {
        var items = productoRepository.findAll()
                .stream().map(this::toDto).collect(Collectors.toList());
        return new BaseResponse<>("Listado de productos", 200, items);
    }

    @Override
    public BaseResponse<ProductoDto> getById(Long id) {
        return productoRepository.findById(id)
                .map(p -> new BaseResponse<>("Producto encontrado", 200, toDto(p)))
                .orElse(new BaseResponse<>("Producto no encontrado", 404, null));
    }

    @Override
    public BaseResponse<String> delete(Long id) {
        if (!productoRepository.existsById(id))
            return new BaseResponse<>("Producto no encontrado", 404, null);
        productoRepository.deleteById(id);
        return new BaseResponse<>("Producto eliminado", 200, null);
    }

    // ===== Helpers =====

    private ProductoEntity toEntity(ProductoDto dto) {
        ProductoEntity producto = ProductoEntity.builder()
                .nombre(dto.getNombre())
                .slug(dto.getSlug())
                .descripcion(dto.getDescripcion())
                .activo(dto.getActivo() == null ? true : dto.getActivo())
                .precio(safePrecio(dto.getPrecio()))
                .stock(dto.getStock() != null ? dto.getStock() : 0)
                .build();

        if (dto.getMarcasIds() != null) {
            producto.setMarcas(dto.getMarcasIds().stream()
                    .filter(id -> id != null && id > 0) // evita 0 y nulos
                    .map(id -> MarcaEntity.builder().idMarca(id).build())
                    .collect(Collectors.toSet()));
        }
        if (dto.getCategoriasIds() != null) {
            producto.setCategorias(dto.getCategoriasIds().stream()
                    .filter(id -> id != null && id > 0)
                    .map(id -> CategoriaEntity.builder().idCategoria(id).build())
                    .collect(Collectors.toSet()));
        }
        return producto;
    }

    private ProductoDto toDto(ProductoEntity entity) {
        var optVar = varianteRepository.findFirstByProducto_IdProductoOrderByIdVarianteAsc(entity.getIdProducto());

        var dto = ProductoDto.builder()
                .idProducto(entity.getIdProducto())
                .nombre(entity.getNombre())
                .slug(entity.getSlug())
                .descripcion(entity.getDescripcion())
                .activo(entity.getActivo())
                .marcasIds(entity.getMarcas() == null ? null :
                        entity.getMarcas().stream().map(MarcaEntity::getIdMarca).collect(Collectors.toSet()))
                .categoriasIds(entity.getCategorias() == null ? null :
                        entity.getCategorias().stream().map(CategoriaEntity::getIdCategoria).collect(Collectors.toSet()))
                .build();

        // Si existe variante, completar precio/moneda/activo
        optVar.ifPresent(v -> {
            dto.setPrecio(v.getPrecioBase());
            dto.setMoneda(v.getMoneda());
            dto.setVarianteActiva(v.getActivo());
        });

        // 🔥 Mapeamos las imágenes si existen
        if (entity.getImagenes() != null && !entity.getImagenes().isEmpty()) {
            dto.setImagenes(
                    entity.getImagenes().stream()
                            .map(img -> ImagenProductoDto.builder()
                                    .url(img.getUrl())
                                    .textoAlt(img.getTextoAlt())
                                    .orden(img.getOrden())
                                    .build()
                            )
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }

    @Override
    public BaseResponse<List<ProductoEntity>> filtrarProductos(Long categoriaId, Long marcaId, String nombre) {
        List<ProductoEntity> productos = productoRepository.filtrarProductos(categoriaId, marcaId, nombre);
        return new BaseResponse<>("Productos filtrados correctamente", HttpStatus.OK.value(), productos);
    }

    private BigDecimal safePrecio(BigDecimal p) {
        return p != null && p.compareTo(BigDecimal.ZERO) >= 0 ? p : BigDecimal.ZERO;
    }

    private String safeMoneda(String m) {
        if (m == null || m.isBlank()) return "ARS";
        String t = m.trim().toUpperCase();
        return t.length() >= 3 ? t.substring(0,3) : "ARS";
    }

    private String generarSkuAuto(ProductoEntity p) {
        String base = p.getSlug() != null
                ? p.getSlug().replaceAll("[^A-Za-z0-9]+", "-").toUpperCase()
                : "PROD";
        return base + "-" + LocalDateTime.now()
                .format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
    }
}
