package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.producto.MarcaDto;
import com.example.LautaroDieselEcommerce.config.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.producto.MarcaEntity;
import com.example.LautaroDieselEcommerce.repository.producto.MarcaRepository;
import com.example.LautaroDieselEcommerce.service.MarcaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MarcaServiceImpl implements MarcaService {

    private final MarcaRepository repo;

    @Override
    public BaseResponse<List<MarcaDto>> getAll() {
        List<MarcaDto> list = repo.findAll()
                .stream().map(this::toDto).collect(Collectors.toList());
        return new BaseResponse<>("OK", 200, list);
    }

    @Override
    public BaseResponse<List<MarcaDto>> getAllActivas() {
        List<MarcaDto> list = repo.findAllByActivaTrueOrderByNombreAsc()
                .stream().map(this::toDto).collect(Collectors.toList());
        return new BaseResponse<>("OK", 200, list);
    }

    @Override
    public BaseResponse<MarcaDto> getById(Long id) {
        return repo.findById(id)
                .map(e -> new BaseResponse<>("OK", 200, toDto(e)))
                .orElse(new BaseResponse<>("No encontrada", 404, null));
    }

    @Override
    public BaseResponse<MarcaDto> create(MarcaDto dto) {
        if (dto.getNombre() == null || dto.getNombre().isBlank())
            return new BaseResponse<>("Nombre requerido", 400, null);
        if (repo.existsByNombreIgnoreCase(dto.getNombre()))
            return new BaseResponse<>("Nombre duplicado", 400, null);

        MarcaEntity e = MarcaEntity.builder()
                .nombre(dto.getNombre().trim())
                .activa(dto.getActiva() == null ? true : dto.getActiva())
                .build();

        return new BaseResponse<>("Creada", 201, toDto(repo.save(e)));
    }

    @Override
    public BaseResponse<MarcaDto> update(Long id, MarcaDto dto) {
        return repo.findById(id).map(e -> {
            if (dto.getNombre() != null && !dto.getNombre().isBlank())
                e.setNombre(dto.getNombre().trim());
            if (dto.getActiva() != null)
                e.setActiva(dto.getActiva());
            return new BaseResponse<>("Actualizada", 200, toDto(repo.save(e)));
        }).orElse(new BaseResponse<>("No encontrada", 404, null));
    }

    @Override
    public BaseResponse<String> delete(Long id) {
        if (!repo.existsById(id))
            return new BaseResponse<>("No encontrada", 404, null);
        repo.deleteById(id);
        return new BaseResponse<>("Eliminada", 200, null);
    }

    private MarcaDto toDto(MarcaEntity e) {
        return MarcaDto.builder()
                .idMarca(e.getIdMarca())
                .nombre(e.getNombre())
                .activa(e.getActiva())
                .build();
    }
}
