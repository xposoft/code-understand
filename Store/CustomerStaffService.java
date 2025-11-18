package com.backend.school_erp.service.Store;

import com.backend.school_erp.DTO.Store.CustomerStaffDTO;
import com.backend.school_erp.entity.Store.CustomerStaff;
import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import javax.sql.DataSource;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Service
@Slf4j
public class CustomerStaffService {

    private final Map<String, DataSource> dataSourceCache = new ConcurrentHashMap<>();

    private DataSource getDataSource(String schoolId) {
        return dataSourceCache.computeIfAbsent(schoolId, id -> {
            log.info("🔗 Creating HikariCP DataSource for school: {}", id);
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
            CREATE TABLE IF NOT EXISTS customer_staff (
                id BIGINT AUTO_INCREMENT PRIMARY KEY,
                customer_staff_code VARCHAR(100),
                customer_staff_name VARCHAR(255) NOT NULL,
                number_street_name VARCHAR(255),
                place_pin_code VARCHAR(50),
                state_id VARCHAR(50),
                state VARCHAR(255),
                district_id VARCHAR(50),
                district VARCHAR(255),
                phone_number VARCHAR(20),
                email VARCHAR(255),
                contact_person VARCHAR(255),
                school_id VARCHAR(50) NOT NULL,
                academic_year VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP,
                UNIQUE KEY unique_entry (customer_staff_name, school_id, academic_year)
            )
        """);
    }

    public List<CustomerStaff> getAll(String schoolId, String academicYear) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);
        return jdbc.query(
                "SELECT * FROM customer_staff WHERE school_id = ? AND academic_year = ? ORDER BY id DESC",
                new BeanPropertyRowMapper<>(CustomerStaff.class),
                schoolId, academicYear
        );
    }

    public CustomerStaff add(String schoolId, CustomerStaffDTO dto) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);

        int rows = jdbc.update("""
            INSERT INTO customer_staff (customer_staff_code, customer_staff_name, number_street_name, place_pin_code, 
                state_id, state, district_id, district, phone_number, email, contact_person, school_id, academic_year)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE id = id
        """,
                dto.getCustomerStaffCode(), dto.getCustomerStaffName(), dto.getNumberStreetName(),
                dto.getPlacePinCode(), dto.getStateId(), dto.getState(), dto.getDistrictId(),
                dto.getDistrict(), dto.getPhoneNumber(), dto.getEmail(), dto.getContactPerson(),
                dto.getSchoolId(), dto.getAcademicYear());

        if (rows == 0) {
            throw new RuntimeException("Customer/Staff already exists: " + dto.getCustomerStaffName());
        }

        Long lastId = jdbc.queryForObject("SELECT LAST_INSERT_ID()", Long.class);
        return CustomerStaff.builder()
                .id(lastId)
                .customerStaffCode(dto.getCustomerStaffCode())
                .customerStaffName(dto.getCustomerStaffName())
                .numberStreetName(dto.getNumberStreetName())
                .placePinCode(dto.getPlacePinCode())
                .stateId(dto.getStateId())
                .state(dto.getState())
                .districtId(dto.getDistrictId())
                .district(dto.getDistrict())
                .phoneNumber(dto.getPhoneNumber())
                .email(dto.getEmail())
                .contactPerson(dto.getContactPerson())
                .schoolId(dto.getSchoolId())
                .academicYear(dto.getAcademicYear())
                .createdAt(LocalDateTime.now())
                .build();
    }

    public Optional<CustomerStaff> update(String schoolId, Long id, CustomerStaffDTO dto) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);

        int rows = jdbc.update("""
            UPDATE customer_staff SET 
                customer_staff_code = ?, customer_staff_name = ?, number_street_name = ?, place_pin_code = ?, 
                state_id = ?, state = ?, district_id = ?, district = ?, phone_number = ?, email = ?, 
                contact_person = ?, updated_at = ?
            WHERE id = ? AND school_id = ?
        """,
                dto.getCustomerStaffCode(), dto.getCustomerStaffName(), dto.getNumberStreetName(),
                dto.getPlacePinCode(), dto.getStateId(), dto.getState(), dto.getDistrictId(),
                dto.getDistrict(), dto.getPhoneNumber(), dto.getEmail(), dto.getContactPerson(),
                LocalDateTime.now(), id, schoolId);

        if (rows == 0) {
            return Optional.empty();
        }

        return Optional.ofNullable(jdbc.queryForObject(
                "SELECT * FROM customer_staff WHERE id = ?",
                new BeanPropertyRowMapper<>(CustomerStaff.class),
                id
        ));
    }

    public boolean delete(String schoolId, Long id) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);
        int rows = jdbc.update("DELETE FROM customer_staff WHERE id = ? AND school_id = ?", id, schoolId);
        return rows > 0;
    }

    public Optional<CustomerStaff> getById(String schoolId, Long id) {
        JdbcTemplate jdbc = getJdbcTemplate(schoolId);
        ensureTableExists(jdbc);
        try {
            CustomerStaff customerStaff = jdbc.queryForObject(
                    "SELECT * FROM customer_staff WHERE id = ? AND school_id = ?",
                    new BeanPropertyRowMapper<>(CustomerStaff.class),
                    id, schoolId
            );
            return Optional.ofNullable(customerStaff);
        } catch (Exception e) {
            log.error("Error fetching customer/staff by ID {}: {}", id, e.getMessage());
            return Optional.empty();
        }
    }
}