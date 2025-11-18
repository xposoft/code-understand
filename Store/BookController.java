package com.backend.school_erp.controller.Store;

import com.backend.school_erp.DTO.Store.BookDTO;
import com.backend.school_erp.entity.Store.Book;
import com.backend.school_erp.service.Store.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/store/books")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookController {
    private final BookService service;

    @GetMapping
    public ResponseEntity<List<Book>> getBooks(
            @RequestParam String schoolId,
            @RequestParam String year
    ) {
        return ResponseEntity.ok(service.getBooks(schoolId, year));
    }

    @PostMapping
    public ResponseEntity<Book> createBook(
            @RequestParam String schoolId,
            @RequestParam String year,
            @RequestBody BookDTO dto
    ) {
        dto.setAcademicYear(year);
        return ResponseEntity.ok(service.addBook(schoolId, dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> updateBook(
            @RequestParam String schoolId,
            @RequestParam String year,
            @PathVariable Long id,
            @RequestBody BookDTO dto
    ) {
        dto.setAcademicYear(year);
        return ResponseEntity.ok(service.updateBook(schoolId, id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBook(
            @RequestParam String schoolId,
            @PathVariable Long id
    ) {
        service.deleteBook(schoolId, id);
        return ResponseEntity.noContent().build();
    }
}