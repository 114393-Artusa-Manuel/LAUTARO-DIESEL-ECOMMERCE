package com.example.LautaroDieselEcommerce.dto.orden;

import lombok.*;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdenRequestDto {
    private List<ItemOrdenDto> items;
}