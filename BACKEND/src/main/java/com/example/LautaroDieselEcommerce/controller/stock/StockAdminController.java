package com.example.LautaroDieselEcommerce.controller.stock;

import com.example.LautaroDieselEcommerce.config.BaseResponse;
import com.example.LautaroDieselEcommerce.dto.stock.CrearSolicitudReposicionRequest;
import com.example.LautaroDieselEcommerce.dto.stock.CrearSolicitudReposicionResponse;
import com.example.LautaroDieselEcommerce.dto.stock.StockLowItemDto;
import com.example.LautaroDieselEcommerce.service.StockService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/stock")
public class StockAdminController {

    private final StockService stockService;

    public StockAdminController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/low")
    public ResponseEntity<BaseResponse<List<StockLowItemDto>>> lowStock(
            @RequestParam(required = false) Integer threshold,
            @RequestParam(required = false) Integer targetStock
    ) {
        List<StockLowItemDto> data = stockService.getLowStock(threshold, targetStock);
        BaseResponse<List<StockLowItemDto>> resp = new BaseResponse<>("Low stock", 200, data);
        return ResponseEntity.ok(resp);
    }

    @PostMapping("/replenishments")
    public ResponseEntity<BaseResponse<CrearSolicitudReposicionResponse>> createReplenishment(
            @RequestBody CrearSolicitudReposicionRequest req
    ) {
        CrearSolicitudReposicionResponse data = stockService.crearSolicitudReposicion(req);
        BaseResponse<CrearSolicitudReposicionResponse> resp = new BaseResponse<>("Solicitud creada", 200, data);
        return ResponseEntity.ok(resp);
    }
}
