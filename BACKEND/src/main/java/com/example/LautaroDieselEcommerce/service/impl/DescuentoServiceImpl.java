package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.descuento.DescuentoDto;
import com.example.LautaroDieselEcommerce.dto.usuario.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.descuento.DescuentoEntity;
import com.example.LautaroDieselEcommerce.repository.descuento.DescuentoRepository;
import com.example.LautaroDieselEcommerce.service.DescuentoService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DescuentoServiceImpl implements DescuentoService {

    @Autowired
    private DescuentoRepository descuentoRepository;

    @Override
    @Transactional
    public BaseResponse<DescuentoDto> create(DescuentoDto dto) {
        DescuentoEntity entity = DescuentoEntity.builder()
                .porcentaje(dto.getPorcentaje())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();
        descuentoRepository.save(entity);
        return new BaseResponse<>("Descuento creado correctamente", 201, dto);
    }

    @Override
    public BaseResponse<List<DescuentoDto>> getAll() {
        var list = descuentoRepository.findAll().stream().map(d ->
                DescuentoDto.builder()
                        .idDescuento(d.getIdDescuento())
                        .porcentaje(d.getPorcentaje())
                        .fechaInicio(d.getFechaInicio())
                        .fechaFin(d.getFechaFin())
                        .activo(d.getActivo())
                        .build()
        ).collect(Collectors.toList());
        return new BaseResponse<>("Listado de descuentos", 200, list);
    }

    @Override
    public BaseResponse<?> aplicarDescuentosCarrito(Long idUsuario) {
        var ahora = LocalDateTime.now();
        var descuentos = descuentoRepository.findByActivoTrueAndFechaInicioBeforeAndFechaFinAfter(ahora, ahora);
        return new BaseResponse<>("Descuentos aplicables", 200, descuentos);
    }
}
