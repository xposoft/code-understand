package com.backend.school_erp.entity.Store;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Book {
    private Long id;
    private String bookName;
    private Double amount;
    private String category;
    private String schoolId;
    private String academicYear;
}