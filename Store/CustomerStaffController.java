package com.backend.school_erp.controller.Store;

import com.backend.school_erp.DTO.Store.CustomerStaffDTO;
import com.backend.school_erp.entity.Store.CustomerStaff;
import com.backend.school_erp.service.Store.CustomerStaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/store/customerstaff")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class CustomerStaffController {

    private final CustomerStaffService service;

    @GetMapping
    public ResponseEntity<?> getAll(@RequestParam String schoolId, @RequestParam String academicYear) {
        try {
            List<CustomerStaff> customerStaffList = service.getAll(schoolId, academicYear);
            return ResponseEntity.ok(customerStaffList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching customer/staff: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getOne(@PathVariable Long id, @RequestParam String schoolId) {
        try {
            Optional<CustomerStaff> customerStaff = service.getById(schoolId, id);
            if (customerStaff.isPresent()) {
                return ResponseEntity.ok(customerStaff.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching customer/staff: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> add(@RequestBody Map<String, Object> body) {
        try {
            CustomerStaffDTO dto = CustomerStaffDTO.builder()
                    .customerStaffCode((String) body.get("customerStaffCode"))
                    .customerStaffName((String) body.get("customerStaffName"))
                    .numberStreetName((String) body.get("numberStreetName"))
                    .placePinCode((String) body.get("placePinCode"))
                    .stateId((String) body.get("stateId"))
                    .state((String) body.get("state"))
                    .districtId((String) body.get("districtId"))
                    .district((String) body.get("district"))
                    .phoneNumber((String) body.get("phoneNumber"))
                    .email((String) body.get("email"))
                    .contactPerson((String) body.get("contactPerson"))
                    .schoolId((String) body.get("schoolId"))
                    .academicYear((String) body.get("academicYear"))
                    .build();

            CustomerStaff customerStaff = service.add(dto.getSchoolId(), dto);
            return ResponseEntity.ok(customerStaff);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error adding customer/staff: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        try {
            String schoolId = (String) body.get("schoolId");
            CustomerStaffDTO dto = CustomerStaffDTO.builder()
                    .customerStaffCode((String) body.get("customerStaffCode"))
                    .customerStaffName((String) body.get("customerStaffName"))
                    .numberStreetName((String) body.get("numberStreetName"))
                    .placePinCode((String) body.get("placePinCode"))
                    .stateId((String) body.get("stateId"))
                    .state((String) body.get("state"))
                    .districtId((String) body.get("districtId"))
                    .district((String) body.get("district"))
                    .phoneNumber((String) body.get("phoneNumber"))
                    .email((String) body.get("email"))
                    .contactPerson((String) body.get("contactPerson"))
                    .schoolId(schoolId)
                    .academicYear((String) body.get("academicYear"))
                    .build();

            Optional<CustomerStaff> updatedCustomerStaff = service.update(schoolId, id, dto);
            if (updatedCustomerStaff.isPresent()) {
                return ResponseEntity.ok(updatedCustomerStaff.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating customer/staff: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id, @RequestParam String schoolId) {
        try {
            boolean deleted = service.delete(schoolId, id);
            if (deleted) {
                return ResponseEntity.ok("Deleted successfully");
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting customer/staff: " + e.getMessage());
        }
    }
}