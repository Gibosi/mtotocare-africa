package com.mtotocare.africa.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Spring-Data-style paginated response. Mobile/web clients expect this shape.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResponse<T> {
    private List<T> content;
    private int totalElements;
    private int totalPages;
    private int size;
    private int number;
}
