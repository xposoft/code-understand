package com.backend.school_erp.controller.Store;

import com.backend.school_erp.DTO.Store.BookSetupClassDTO;
import com.backend.school_erp.entity.Store.BookSetupClass;
import com.backend.school_erp.service.Store.BookSetupClassService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/store/book-setup-classes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class BookSetupClassController {
    private final BookSetupClassService service;

    @GetMapping
    public ResponseEntity<List<BookSetupClass>> getBookSetupClasses(
            @RequestParam String schoolId,
            @RequestParam String year
    ) {
        try {
            return ResponseEntity.ok(service.getBookSetupClasses(schoolId, year));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PostMapping
    public ResponseEntity<BookSetupClass> createBookSetupClass(
            @RequestParam String schoolId,
            @RequestParam String year,
            @RequestBody BookSetupClassDTO dto
    ) {
        try {
            dto.setAcademicYear(year);
            BookSetupClass result = service.addBookSetupClass(schoolId, dto);
            return ResponseEntity.ok(result);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BookSetupClass> updateBookSetupClass(
            @RequestParam String schoolId,
            @RequestParam String year,
            @PathVariable Long id,
            @RequestBody BookSetupClassDTO dto
    ) {
        try {
            dto.setAcademicYear(year);
            return ResponseEntity.ok(service.updateBookSetupClass(schoolId, id, dto));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBookSetupClass(
            @RequestParam String schoolId,
            @PathVariable Long id
    ) {
        try {
            service.deleteBookSetupClass(schoolId, id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(500).build();
        }
    }
}