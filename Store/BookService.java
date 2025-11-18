package com.backend.school_erp.service.Store;

import com.backend.school_erp.DTO.Store.BookDTO;
import com.backend.school_erp.entity.Store.Book;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

@Service
@Slf4j
public class BookService {
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
            return new HikariDataSource(config);
        });
    }

    private JdbcTemplate getJdbcTemplate(String schoolId) {
        return new JdbcTemplate(getDataSource(schoolId));
    }

    private void ensureTableExists(JdbcTemplate jdbc) {
        jdbc.execute("""
            CREATE TABLE IF NOT EXISTS books (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                book_name VARCHAR(100) NOT NULL,
                amount DOUBLE NOT NULL,
                category VARCHAR(100),
                school_id VARCHAR(50) NOT NULL,
                academic_year VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE KEY unique_book (book_name, school_id, academic_year)
            )
        """);
    }

    public List<Book> getBooks(String schoolId, String academicYear) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);
        return jdbc.query(
                "SELECT * FROM books WHERE school_id = ? AND academic_year = ? ORDER BY id DESC",
                new BeanPropertyRowMapper<>(Book.class),
                schoolId, academicYear
        );
    }

    public Book addBook(String schoolId, BookDTO dto) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);

        try {
            jdbc.update(
                    "INSERT INTO books (book_name, amount, category, school_id, academic_year) VALUES (?, ?, ?, ?, ?)",
                    dto.getBookName(), dto.getAmount(), dto.getCategory(), schoolId, dto.getAcademicYear()
            );
        } catch (DuplicateKeyException e) {
            throw new RuntimeException("Book already exists for name: " + dto.getBookName());
        }

        Long lastId = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        return Book.builder()
                .id(lastId)
                .bookName(dto.getBookName())
                .amount(dto.getAmount())
                .category(dto.getCategory())
                .schoolId(schoolId)
                .academicYear(dto.getAcademicYear())
                .build();
    }

    public Book updateBook(String schoolId, Long id, BookDTO dto) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);

        int rows = jdbc.update(
                "UPDATE books SET book_name = ?, amount = ?, category = ? WHERE id = ?",
                dto.getBookName(), dto.getAmount(), dto.getCategory(), id
        );
        if (rows == 0) throw new RuntimeException("Book not found with id " + id);

        return jdbc.queryForObject(
                "SELECT * FROM books WHERE id = ?",
                new BeanPropertyRowMapper<>(Book.class),
                id
        );
    }

    public void deleteBook(String schoolId, Long id) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);

        int rows = jdbc.update("DELETE FROM books WHERE id = ?", id);
        if (rows == 0) throw new RuntimeException("Book not found with id " + id);
    }
}