package com.backend.school_erp.DTO.Store;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookDTO {
    private String bookName;
    private Double amount;
    private String category;
    private String academicYear;
}