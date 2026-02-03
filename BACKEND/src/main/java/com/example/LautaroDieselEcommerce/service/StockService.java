package com.example.LautaroDieselEcommerce.service;

import com.example.LautaroDieselEcommerce.dto.stock.CrearSolicitudReposicionRequest;
import com.example.LautaroDieselEcommerce.dto.stock.CrearSolicitudReposicionResponse;
import com.example.LautaroDieselEcommerce.dto.stock.StockLowItemDto;

import java.util.List;

public interface StockService {
    List<StockLowItemDto> getLowStock(Integer threshold, Integer targetStock);
    CrearSolicitudReposicionResponse crearSolicitudReposicion(CrearSolicitudReposicionRequest req);
}
