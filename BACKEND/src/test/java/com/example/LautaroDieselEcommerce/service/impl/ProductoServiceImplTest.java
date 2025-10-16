package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.producto.ProductoDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.producto.CategoriaEntity;
import com.example.LautaroDieselEcommerce.entity.producto.MarcaEntity;
import com.example.LautaroDieselEcommerce.entity.producto.ProductoEntity;
import com.example.LautaroDieselEcommerce.repository.producto.ProductoRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProductoServiceImplTest {

    @Mock
    private ProductoRepository productoRepository;

    @InjectMocks
    private ProductoServiceImpl productoService;

    private ProductoEntity productoEntity;
    private ProductoDto productoDto;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        MarcaEntity marca = MarcaEntity.builder().idMarca(1L).build();
        CategoriaEntity categoria = CategoriaEntity.builder().idCategoria(2L).build();

        productoEntity = ProductoEntity.builder()
                .idProducto(1L)
                .nombre("Aceite Shell Helix 10W40")
                .slug("aceite-shell-helix-10w40")
                .descripcion("Aceite sintético de alto rendimiento")
                .activo(true)
                .marcas(Set.of(marca))
                .categorias(Set.of(categoria))
                .build();

        productoDto = ProductoDto.builder()
                .idProducto(1L)
                .nombre("Aceite Shell Helix 10W40")
                .slug("aceite-shell-helix-10w40")
                .descripcion("Aceite sintético de alto rendimiento")
                .activo(true)
                .marcasIds(Set.of(1L))
                .categoriasIds(Set.of(2L))
                .build();
    }


    @Test
    void getAll_DeberiaRetornarListaDeProductos() {
        when(productoRepository.findAll()).thenReturn(List.of(productoEntity));

        BaseResponse<List<ProductoDto>> response = productoService.getAll();

        assertEquals(200, response.getCodigo());
        assertEquals("Lista de productos obtenida correctamente", response.getMensaje());
        assertEquals(1, response.getData().size());
        verify(productoRepository, times(1)).findAll();
    }

    @Test
    void getAll_ListaVacia_DeberiaRetornarListaVacia() {
        when(productoRepository.findAll()).thenReturn(Collections.emptyList());

        BaseResponse<List<ProductoDto>> response = productoService.getAll();

        assertNotNull(response);
        assertEquals(0, response.getData().size());
        verify(productoRepository, times(1)).findAll();
    }

    @Test
    void getById_Existente_DeberiaRetornarProducto() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoEntity));

        BaseResponse<ProductoDto> response = productoService.getById(1L);

        assertEquals(200, response.getCodigo());
        assertEquals("Producto encontrado", response.getMensaje());
        assertEquals("Aceite Shell Helix 10W40", response.getData().getNombre());
    }

    @Test
    void getById_NoExistente_DeberiaRetornar404() {
        when(productoRepository.findById(1L)).thenReturn(Optional.empty());

        BaseResponse<ProductoDto> response = productoService.getById(1L);

        assertEquals(404, response.getCodigo());
        assertEquals("Producto no encontrado", response.getMensaje());
        assertNull(response.getData());
    }

    @Test
    void create_SlugDuplicado_DeberiaRetornar400() {
        when(productoRepository.existsBySlug(productoDto.getSlug())).thenReturn(true);

        BaseResponse<ProductoDto> response = productoService.create(productoDto);

        assertEquals(400, response.getCodigo());
        assertEquals("El slug ya existe", response.getMensaje());
        verify(productoRepository, never()).save(any());
    }

    @Test
    void create_Exitoso_DeberiaRetornar201() {
        when(productoRepository.existsBySlug(productoDto.getSlug())).thenReturn(false);
        when(productoRepository.save(any())).thenReturn(productoEntity);

        BaseResponse<ProductoDto> response = productoService.create(productoDto);

        assertEquals(201, response.getCodigo());
        assertEquals("Producto creado correctamente", response.getMensaje());
        verify(productoRepository, times(1)).save(any());
    }

    @Test
    void update_Existente_DeberiaActualizarYRetornar200() {
        when(productoRepository.findById(1L)).thenReturn(Optional.of(productoEntity));
        when(productoRepository.save(any())).thenReturn(productoEntity);

        BaseResponse<ProductoDto> response = productoService.update(1L, productoDto);

        assertEquals(200, response.getCodigo());
        assertEquals("Producto actualizado correctamente", response.getMensaje());
        verify(productoRepository, times(1)).save(any());
    }

    @Test
    void update_NoExistente_DeberiaRetornar404() {
        when(productoRepository.findById(99L)).thenReturn(Optional.empty());

        BaseResponse<ProductoDto> response = productoService.update(99L, productoDto);

        assertEquals(404, response.getCodigo());
        assertEquals("Producto no encontrado", response.getMensaje());
    }
    
    @Test
    void delete_Existente_DeberiaEliminarYRetornar200() {
        when(productoRepository.existsById(1L)).thenReturn(true);
        doNothing().when(productoRepository).deleteById(1L);

        BaseResponse<String> response = productoService.delete(1L);

        assertEquals(200, response.getCodigo());
        assertEquals("Producto eliminado correctamente", response.getMensaje());
        verify(productoRepository, times(1)).deleteById(1L);
    }

    @Test
    void delete_NoExistente_DeberiaRetornar404() {
        when(productoRepository.existsById(99L)).thenReturn(false);

        BaseResponse<String> response = productoService.delete(99L);

        assertEquals(404, response.getCodigo());
        assertEquals("Producto no encontrado", response.getMensaje());
        verify(productoRepository, never()).deleteById(any());
    }
}
