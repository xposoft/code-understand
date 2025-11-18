package com.backend.school_erp.DTO.Store;

import lombok.*;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BookSetupClassDTO {
    private String standard;
    private List<BookEntry> books; // List of book entries
    private Integer totalQuantity; // Sum of quantities
    private String academicYear;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BookEntry {
        @JsonProperty("bookId")
        private String bookId; // Book ID as string
        @JsonProperty("quantity")
        private Integer quantity;
        @JsonProperty("amount")
        private Double amount;
    }
}