package com.backend.school_erp.service.Store;

import com.backend.school_erp.DTO.Store.BookSetupClassDTO;
import com.backend.school_erp.entity.Store.BookSetupClass;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

@Service
@Slf4j
public class BookSetupClassService {
    private final Map<String, DataSource> dataSourceCache = new ConcurrentHashMap<>();

    private DataSource getDataSource(String schoolId) {
        return dataSourceCache.computeIfAbsent(schoolId, id -> {
            log.info("Creating HikariCP DataSource for school: {}", id);
            HikariConfig config = new HikariConfig();
            config.setJdbcUrl("jdbc:mysql://localhost:3306/" + id + "?useSSL=false&allowPublicKeyRetrieval=true");
            config.setUsername("root");
            config.setPassword("MySQL@3306");
            config.setDriverClassName("com.mysql.cj.jdbc.Driver");
            config.setMaximumPoolSize(10);
            config.setMinimumIdle(2);
            config.setIdleTimeout(30000);
            config.setMaxLifetime(1800000);
            config.setConnectionTimeout(10000);
            config.setAutoCommit(true); // Ensure auto-commit
            return new HikariDataSource(config);
        });
    }

    private JdbcTemplate getJdbcTemplate(String schoolId) {
        return new JdbcTemplate(getDataSource(schoolId));
    }

    private void ensureTableExists(JdbcTemplate jdbc) {
        try {
            jdbc.execute("""
                CREATE TABLE IF NOT EXISTS book_setup_classes (
                    id BIGINT AUTO_INCREMENT PRIMARY KEY,
                    standard VARCHAR(50) NOT NULL,
                    book_id VARCHAR(50) NOT NULL,
                    quantity INT NOT NULL,
                    amount DOUBLE NOT NULL,
                    total_quantity INT NOT NULL,
                    school_id VARCHAR(50) NOT NULL,
                    academic_year VARCHAR(50) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    UNIQUE KEY unique_book_setup (standard, book_id, school_id, academic_year)
                )
            """);
            log.info("Ensured book_setup_classes table exists");
        } catch (Exception e) {
            log.error("Error creating book_setup_classes table: {}", e.getMessage());
            throw new RuntimeException("Failed to create book_setup_classes table: " + e.getMessage());
        }
    }

    public List<BookSetupClass> getBookSetupClasses(String schoolId, String academicYear) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);
        try {
            List<BookSetupClass> setups = jdbc.query(
                    "SELECT id, standard, book_id, quantity, amount, total_quantity, school_id, academic_year, created_at " +
                            "FROM book_setup_classes WHERE school_id = ? AND academic_year = ? ORDER BY standard, id",
                    new BeanPropertyRowMapper<>(BookSetupClass.class),
                    schoolId, academicYear
            );
            log.info("Fetched {} book setup classes for schoolId: {}, academicYear: {}", setups.size(), schoolId, academicYear);
            return setups;
        } catch (Exception e) {
            log.error("Error fetching book setup classes: {}", e.getMessage());
            throw new RuntimeException("Failed to fetch book setup classes: " + e.getMessage());
        }
    }

    @Transactional
    public BookSetupClass addBookSetupClass(String schoolId, BookSetupClassDTO dto) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);

        try {
            // Validate DTO
            if (dto.getStandard() == null || dto.getStandard().isEmpty()) {
                log.error("Standard is null or empty");
                throw new IllegalArgumentException("Standard cannot be empty");
            }
            if (dto.getBooks() == null || dto.getBooks().isEmpty()) {
                log.error("Books list is null or empty for standard: {}", dto.getStandard());
                throw new IllegalArgumentException("Books list cannot be empty");
            }
            if (dto.getAcademicYear() == null || dto.getAcademicYear().isEmpty()) {
                log.error("Academic year is null or empty");
                throw new IllegalArgumentException("Academic year cannot be empty");
            }

            // Validate book entries
            for (BookSetupClassDTO.BookEntry book : dto.getBooks()) {
                if (book.getBookId() == null || book.getQuantity() == null || book.getQuantity() <= 0 || book.getAmount() == null || book.getAmount() <= 0) {
                    log.error("Invalid book entry: bookId={}, quantity={}, amount={}", book.getBookId(), book.getQuantity(), book.getAmount());
                    throw new IllegalArgumentException("Invalid book entry: bookId, quantity, and amount must be valid");
                }
            }

            Integer totalQuantity = dto.getBooks().stream().mapToInt(BookSetupClassDTO.BookEntry::getQuantity).sum();
            log.info("Inserting book setup class: standard={}, schoolId={}, academicYear={}, totalQuantity={}",
                    dto.getStandard(), schoolId, dto.getAcademicYear(), totalQuantity);

            // Insert each book entry as a separate row
            for (BookSetupClassDTO.BookEntry book : dto.getBooks()) {
                int rowsAffected = jdbc.update(
                        "INSERT INTO book_setup_classes (standard, book_id, quantity, amount, total_quantity, school_id, academic_year) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                        dto.getStandard(), book.getBookId(), book.getQuantity(), book.getAmount(), totalQuantity, schoolId, dto.getAcademicYear()
                );
                log.info("Inserted book entry: bookId={}, rowsAffected={}", book.getBookId(), rowsAffected);
            }

            // Fetch the latest inserted entry for response
            BookSetupClass inserted = jdbc.queryForObject(
                    "SELECT * FROM book_setup_classes WHERE standard = ? AND school_id = ? AND academic_year = ? ORDER BY id DESC LIMIT 1",
                    new BeanPropertyRowMapper<>(BookSetupClass.class),
                    dto.getStandard(), schoolId, dto.getAcademicYear()
            );
            log.info("Verified inserted data: {}", inserted);

            return inserted;
        } catch (Exception e) {
            log.error("Error adding book setup class: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to add book setup class: " + e.getMessage());
        }
    }

    @Transactional
    public BookSetupClass updateBookSetupClass(String schoolId, Long id, BookSetupClassDTO dto) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);

        try {
            if (dto.getBooks() == null || dto.getBooks().isEmpty()) {
                log.error("Books list is null or empty for standard: {}", dto.getStandard());
                throw new IllegalArgumentException("Books list cannot be empty");
            }
            for (BookSetupClassDTO.BookEntry book : dto.getBooks()) {
                if (book.getBookId() == null || book.getQuantity() == null || book.getQuantity() <= 0 || book.getAmount() == null || book.getAmount() <= 0) {
                    log.error("Invalid book entry: bookId={}, quantity={}, amount={}", book.getBookId(), book.getQuantity(), book.getAmount());
                    throw new IllegalArgumentException("Invalid book entry: bookId, quantity, and amount must be valid");
                }
            }

            Integer totalQuantity = dto.getBooks().stream().mapToInt(BookSetupClassDTO.BookEntry::getQuantity).sum();
            log.info("Updating book setup class ID {} with total quantity {}", id, totalQuantity);

            // Delete existing entries for this standard
            jdbc.update("DELETE FROM book_setup_classes WHERE id = ?", id);

            // Insert updated entries
            for (BookSetupClassDTO.BookEntry book : dto.getBooks()) {
                jdbc.update(
                        "INSERT INTO book_setup_classes (standard, book_id, quantity, amount, total_quantity, school_id, academic_year) " +
                                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                        dto.getStandard(), book.getBookId(), book.getQuantity(), book.getAmount(), totalQuantity, schoolId, dto.getAcademicYear()
                );
            }

            return jdbc.queryForObject(
                    "SELECT * FROM book_setup_classes WHERE standard = ? AND school_id = ? AND academic_year = ? ORDER BY id DESC LIMIT 1",
                    new BeanPropertyRowMapper<>(BookSetupClass.class),
                    dto.getStandard(), schoolId, dto.getAcademicYear()
            );
        } catch (Exception e) {
            log.error("Error updating book setup class: {}", e.getMessage());
            throw new RuntimeException("Failed to update book setup class: " + e.getMessage());
        }
    }

    @Transactional
    public void deleteBookSetupClass(String schoolId, Long id) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);

        try {
            int rows = jdbc.update("DELETE FROM book_setup_classes WHERE id = ?", id);
            if (rows == 0) {
                log.error("Book setup class not found with id {}", id);
                throw new RuntimeException("Book setup class not found with id " + id);
            }
        } catch (Exception e) {
            log.error("Error deleting book setup class: {}", e.getMessage());
            throw new RuntimeException("Failed to delete book setup class: " + e.getMessage());
        }
    }
}