package com.example.LautaroDieselEcommerce.service.impl;

import com.example.LautaroDieselEcommerce.dto.producto.CategoriaDto;
import com.example.LautaroDieselEcommerce.config.BaseResponse;
import com.example.LautaroDieselEcommerce.entity.producto.CategoriaEntity;
import com.example.LautaroDieselEcommerce.repository.producto.CategoriaRepository;
import com.example.LautaroDieselEcommerce.service.CategoriaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoriaServiceImpl implements CategoriaService {
    private final CategoriaRepository repo;

    @Override
    public BaseResponse<List<CategoriaDto>> getAll(){
        var list = repo.findAll().stream().map(this::toDto).toList();
        return new BaseResponse<>("OK",200,list);
    }

    @Override
    public BaseResponse<List<CategoriaDto>> getAllActivas(){
        var list = repo.findAllByActivaTrueOrderByNombreAsc().stream().map(this::toDto).toList();
        return new BaseResponse<>("OK",200,list);
    }

        @Override
        public BaseResponse<CategoriaDto> getById(Long id){
                return repo.findById(id)
                    .map(e-> new BaseResponse<CategoriaDto>("OK",200,toDto(e)))
                    .orElse(new BaseResponse<CategoriaDto>("No encontrada",404,null));
        }

    @Override
    public BaseResponse<CategoriaDto> create(CategoriaDto dto){
    if (dto.getNombre()==null || dto.getNombre().isBlank())
        return new BaseResponse<>("Nombre requerido",400,null);

    // slug: usar el que venga o generarlo desde nombre
    String slug = (dto.getSlug()==null || dto.getSlug().isBlank())
            ? generarSlug(dto.getNombre())
            : normalizarSlug(dto.getSlug());

    if (repo.existsByNombreIgnoreCase(dto.getNombre()))
        return new BaseResponse<CategoriaDto>("Nombre duplicado",400,null);
    if (repo.existsBySlugIgnoreCase(slug))
        return new BaseResponse<CategoriaDto>("Slug duplicado",400,null);

    var e = CategoriaEntity.builder()
            .nombre(dto.getNombre().trim())
            .slug(slug)
            .idPadre(dto.getIdPadre())
            .activa(dto.getActiva()==null?true:dto.getActiva())
            .build();

    return new BaseResponse<CategoriaDto>("Creada",201,toDto(repo.save(e)));
}

    @Override
    public BaseResponse<CategoriaDto> update(Long id, CategoriaDto dto){
    return repo.findById(id).map(e->{
        if (dto.getNombre()!=null && !dto.getNombre().isBlank())
            e.setNombre(dto.getNombre().trim());

        if (dto.getSlug()!=null) {
            String nuevo = dto.getSlug().isBlank()
                    ? generarSlug(e.getNombre())
                    : normalizarSlug(dto.getSlug());
            if (!nuevo.equalsIgnoreCase(e.getSlug()) && repo.existsBySlugIgnoreCase(nuevo))
                return new BaseResponse<CategoriaDto>("Slug duplicado",400,null);
            e.setSlug(nuevo);
        }

        if (dto.getIdPadre()!=null) e.setIdPadre(dto.getIdPadre());
        if (dto.getActiva()!=null)  e.setActiva(dto.getActiva());

        return new BaseResponse<CategoriaDto>("Actualizada",200,toDto(repo.save(e)));
    }).orElse(new BaseResponse<CategoriaDto>("No encontrada",404,null));
}

    private String generarSlug(String s){
    if (s == null) return "categoria";
    String ascii = java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
            .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
    String base = ascii.toLowerCase()
            .replaceAll("[^a-z0-9]+","-")
            .replaceAll("^-+|-+$","");
    return base.isBlank()? "categoria" : base;
}
    private String normalizarSlug(String s){
        if (s==null) return "categoria";
        return generarSlug(s);
    }

        private CategoriaDto toDto(CategoriaEntity e){
    return CategoriaDto.builder()
      .idCategoria(e.getIdCategoria())
      .nombre(e.getNombre())
      .slug(e.getSlug())
      .idPadre(e.getIdPadre())
      .activa(e.getActiva())
      .build();
}

        @Override
    public BaseResponse<String> delete(Long id) {
        if (!repo.existsById(id))
            return new BaseResponse<>("No encontrada", 404, null);
        repo.deleteById(id);
        return new BaseResponse<>("Eliminada", 200, null);
    }
}
