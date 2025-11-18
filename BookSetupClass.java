package com.backend.school_erp.entity.Store;

import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookSetupClass {
    private Long id;
    private String standard;
    private String bookId; // Single book ID
    private Integer quantity; // Quantity for this book
    private Double amount; // Amount for this book
    private Integer totalQuantity; // Sum of quantities for the standard
    private String schoolId;
    private String academicYear;
}