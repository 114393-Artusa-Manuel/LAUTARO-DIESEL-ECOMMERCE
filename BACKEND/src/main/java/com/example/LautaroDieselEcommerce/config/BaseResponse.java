package com.example.LautaroDieselEcommerce.config;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BaseResponse<T> {
    private String mensaje;
    private int status;
    private T data;
}
