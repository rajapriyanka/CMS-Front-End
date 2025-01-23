package com.lms.controller;

import com.lms.dto.RegistrationResponse;
import com.lms.entity.Student;
import com.lms.entity.Faculty;
import com.lms.entity.Course;
import com.lms.entity.Batch;
import com.lms.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private static final Logger logger = LoggerFactory.getLogger(AdminController.class);

    @Autowired
    private AdminService adminService;

    @PostMapping("/register/student")
    public ResponseEntity<?> registerStudent(@Validated @RequestBody Student student, BindingResult bindingResult) {
        logger.info("Received request to register student: {}", student.getEmail());
        
        if (bindingResult.hasErrors()) {
            logger.error("Validation errors in student registration: {}", bindingResult.getAllErrors());
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }
        
        if (student.getDNo() == null) {
            logger.error("Department number cannot be null");
            return ResponseEntity.badRequest().body("Department number is required");
        }
        
        try {
            RegistrationResponse response = adminService.registerStudent(student);
            logger.info("Student registered successfully: {}", response.getEmail());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid input data: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            logger.error("Business rule violation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error registering student: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error registering student: " + e.getMessage());
        }
    }

    @PostMapping("/register/faculty")
    public ResponseEntity<?> registerFaculty(@Validated @RequestBody Faculty faculty, BindingResult bindingResult) {
        logger.info("Received request to register faculty: {}", faculty.getEmail());
        
        if (bindingResult.hasErrors()) {
            logger.error("Validation errors in faculty registration: {}", bindingResult.getAllErrors());
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }
        
        try {
            RegistrationResponse response = adminService.registerFaculty(faculty);
            logger.info("Faculty registered successfully: {}", response.getEmail());
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            logger.error("Invalid input data: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IllegalStateException e) {
            logger.error("Business rule violation: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            logger.error("Error registering faculty: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("Error registering faculty: " + e.getMessage());
        }
    }

    // Course management endpoints
    @PostMapping("/courses")
    public ResponseEntity<?> addCourse(@Validated @RequestBody Course course, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }
        try {
            Course newCourse = adminService.addCourse(course);
            return ResponseEntity.ok(newCourse);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<?> updateCourse(@PathVariable Long id, @Validated @RequestBody Course course, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }
        try {
            Course updatedCourse = adminService.updateCourse(id, course);
            return ResponseEntity.ok(updatedCourse);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<?> deleteCourse(@PathVariable Long id) {
        try {
            adminService.deleteCourse(id);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/courses")
    public ResponseEntity<List<Course>> getAllCourses() {
        List<Course> courses = adminService.getAllCourses();
        return ResponseEntity.ok(courses);
    }

    // Batch management endpoints
    @PostMapping("/batches")
    public ResponseEntity<?> addBatch(@Validated @RequestBody Batch batch, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }
        try {
            Batch newBatch = adminService.addBatch(batch);
            return ResponseEntity.ok(newBatch);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/batches/{id}")
    public ResponseEntity<?> updateBatch(@PathVariable Long id, @Validated @RequestBody Batch batch, BindingResult bindingResult) {
        if (bindingResult.hasErrors()) {
            return ResponseEntity.badRequest().body(bindingResult.getAllErrors());
        }
        try {
            Batch updatedBatch = adminService.updateBatch(id, batch);
            return ResponseEntity.ok(updatedBatch);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/batches/{id}")
    public ResponseEntity<?> deleteBatch(@PathVariable Long id) {
        try {
            adminService.deleteBatch(id);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/batches")
    public ResponseEntity<List<Batch>> getAllBatches() {
        List<Batch> batches = adminService.getAllBatches();
        return ResponseEntity.ok(batches);
    }

    @GetMapping("/batches/{id}")
    public ResponseEntity<?> getBatchById(@PathVariable Long id) {
        try {
            Batch batch = adminService.getBatchById(id);
            return ResponseEntity.ok(batch);
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}

