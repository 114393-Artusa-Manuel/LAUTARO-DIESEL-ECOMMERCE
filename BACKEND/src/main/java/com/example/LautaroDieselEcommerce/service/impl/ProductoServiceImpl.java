package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.producto.ProductoDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.producto.CategoriaEntity;
import com.example.LautaroDieselEcommerce.entity.producto.MarcaEntity;
import com.example.LautaroDieselEcommerce.entity.producto.ProductoEntity;
import com.example.LautaroDieselEcommerce.repository.producto.ProductoRepository;
import com.example.LautaroDieselEcommerce.service.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductoServiceImpl implements ProductoService {

    private final ProductoRepository productoRepository;

    @Override
    public BaseResponse<List<ProductoDto>> getAll() {
        List<ProductoDto> productos = productoRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
        return new BaseResponse<>("Lista de productos obtenida correctamente", 200, productos);
    }

    @Override
    public BaseResponse<ProductoDto> getById(Long id) {
        return productoRepository.findById(id)
                .map(p -> new BaseResponse<>("Producto encontrado", 200, toDto(p)))
                .orElse(new BaseResponse<>("Producto no encontrado", 404, null));
    }

    @Override
    public BaseResponse<ProductoDto> create(ProductoDto dto) {
        if (productoRepository.existsBySlug(dto.getSlug())) {
            return new BaseResponse<>("El slug ya existe", 400, null);
        }
        ProductoEntity entity = toEntity(dto);
        entity.setFechaCreacion(LocalDateTime.now());
        entity.setFechaActualizacion(LocalDateTime.now());
        ProductoEntity saved = productoRepository.save(entity);
        return new BaseResponse<>("Producto creado correctamente", 201, toDto(saved));
    }

    @Override
    public BaseResponse<ProductoDto> update(Long id, ProductoDto dto) {
        return productoRepository.findById(id)
                .map(producto -> {
                    producto.setNombre(dto.getNombre());
                    producto.setSlug(dto.getSlug());
                    producto.setDescripcion(dto.getDescripcion());
                    producto.setActivo(dto.getActivo());
                    producto.setFechaActualizacion(LocalDateTime.now());

                    // 🔹 Actualizar marcas
                    if (dto.getMarcasIds() != null) {
                        Set<MarcaEntity> marcas = dto.getMarcasIds().stream()
                                .map(mid -> MarcaEntity.builder().idMarca(mid).build())
                                .collect(Collectors.toSet());
                        producto.setMarcas(marcas);
                    }

                    // 🔹 Actualizar categorías
                    if (dto.getCategoriasIds() != null) {
                        Set<CategoriaEntity> categorias = dto.getCategoriasIds().stream()
                                .map(cid -> CategoriaEntity.builder().idCategoria(cid).build())
                                .collect(Collectors.toSet());
                        producto.setCategorias(categorias);
                    }

                    ProductoEntity updated = productoRepository.save(producto);
                    return new BaseResponse<>("Producto actualizado correctamente", 200, toDto(updated));
                })
                .orElse(new BaseResponse<>("Producto no encontrado", 404, null));
    }


    @Override
    public BaseResponse<String> delete(Long id) {
        if (!productoRepository.existsById(id)) {
            return new BaseResponse<>("Producto no encontrado", 404, null);
        }
        productoRepository.deleteById(id);
        return new BaseResponse<>("Producto eliminado correctamente", 200, null);
    }

    private ProductoDto toDto(ProductoEntity entity) {
        return ProductoDto.builder()
                .idProducto(entity.getIdProducto())
                .nombre(entity.getNombre())
                .slug(entity.getSlug())
                .descripcion(entity.getDescripcion())
                .activo(entity.getActivo())
                .marcasIds(entity.getMarcas() != null
                        ? entity.getMarcas().stream().map(MarcaEntity::getIdMarca).collect(Collectors.toSet())
                        : new HashSet<>())
                .categoriasIds(entity.getCategorias() != null
                        ? entity.getCategorias().stream().map(CategoriaEntity::getIdCategoria).collect(Collectors.toSet())
                        : new HashSet<>())
                .build();
    }


    private ProductoEntity toEntity(ProductoDto dto) {
        ProductoEntity producto = ProductoEntity.builder()
                .nombre(dto.getNombre())
                .slug(dto.getSlug())
                .descripcion(dto.getDescripcion())
                .activo(dto.getActivo())
                .build();

        if (dto.getMarcasIds() != null) {
            Set<MarcaEntity> marcas = dto.getMarcasIds().stream()
                    .map(id -> MarcaEntity.builder().idMarca(id).build())
                    .collect(Collectors.toSet());
            producto.setMarcas(marcas);
        }

        if (dto.getCategoriasIds() != null) {
            Set<CategoriaEntity> categorias = dto.getCategoriasIds().stream()
                    .map(id -> CategoriaEntity.builder().idCategoria(id).build())
                    .collect(Collectors.toSet());
            producto.setCategorias(categorias);
        }

        return producto;
    }

}
