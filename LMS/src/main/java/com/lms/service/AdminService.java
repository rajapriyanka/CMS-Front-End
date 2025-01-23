package com.lms.service;

import com.lms.dto.RegistrationResponse;
import com.lms.entity.Student;
import com.lms.entity.Batch;
import com.lms.entity.Course;
import com.lms.entity.Faculty;
import com.lms.entity.User;
import com.lms.repository.StudentRepository;
import com.lms.repository.BatchRepository;
import com.lms.repository.CourseRepository;
import com.lms.repository.FacultyRepository;
import com.lms.repository.UserRepository;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private CourseRepository courseRepository;
    
    @Autowired
    private BatchRepository batchRepository;
    
    @Autowired
    private BatchService batchService;

    @Autowired
    private PasswordEncoder passwordEncoder;
    

    @Transactional
    public Batch addBatch(Batch batch) {
        return batchService.addBatch(batch);
    }

    @Transactional
    public Batch updateBatch(Long id, Batch batchDetails) {
        return batchService.updateBatch(id, batchDetails);
    }

    @Transactional
    public void deleteBatch(Long id) {
        batchService.deleteBatch(id);
    }

    public List<Batch> getAllBatches() {
        return batchService.getAllBatches();
    }

    public Batch getBatchById(Long id) {
        return batchService.getBatchById(id)
                .orElseThrow(() -> new IllegalStateException("Batch not found"));
    }

    
    @Transactional
    public Course addCourse(Course course) {
        if (courseRepository.findByCourseCode(course.getCourseCode()) != null) {
            throw new IllegalStateException("Course with this code already exists");
        }
        return courseRepository.save(course);
    }

    @Transactional
    public Course updateCourse(Long id, Course courseDetails) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Course not found"));

        course.setCourseCode(courseDetails.getCourseCode());
        course.setCourseTitle(courseDetails.getCourseTitle());

        return courseRepository.save(course);
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalStateException("Course not found"));
        courseRepository.delete(course);
    }

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Transactional
    public RegistrationResponse registerStudent(Student studentData) {
        if (studentData == null) {
            throw new IllegalArgumentException("Student data cannot be null");
        }
        
        validateStudentData(studentData);

        if (studentRepository.findByEmail(studentData.getEmail()) != null) {
            throw new IllegalStateException("Student with this email already exists");
        }

        Student student = new Student();
        student.setName(studentData.getName());
        student.setDNo(studentData.getDNo());
        student.setDepartment(studentData.getDepartment());
        student.setEmail(studentData.getEmail());
        
        try {
            student = studentRepository.save(student);
        } catch (Exception e) {
            throw new RuntimeException("Error saving student: " + e.getMessage());
        }

        String username = generateStudentUsername(student.getName());
        String password = generateStudentPassword(student.getName(), student.getDNo());

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("ROLE_STUDENT");
        
        try {
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Error creating user account: " + e.getMessage());
        }

        return new RegistrationResponse(
            student.getId(),
            student.getName(),
            student.getEmail(),
            username,
            password
        );
    }

    @Transactional
    public RegistrationResponse registerFaculty(Faculty facultyData) {
        if (facultyData == null) {
            throw new IllegalArgumentException("Faculty data cannot be null");
        }
        
        validateFacultyData(facultyData);

        if (facultyRepository.findByEmail(facultyData.getEmail()) != null) {
            throw new IllegalStateException("Faculty with this email already exists");
        }

        Faculty faculty = new Faculty();
        faculty.setName(facultyData.getName());
        faculty.setDepartment(facultyData.getDepartment());
        faculty.setEmail(facultyData.getEmail());
        
        try {
            faculty = facultyRepository.save(faculty);
        } catch (Exception e) {
            throw new RuntimeException("Error saving faculty: " + e.getMessage());
        }

        String username = generateFacultyUsername(faculty.getName(), faculty.getDepartment());
        String password = generateFacultyPassword(faculty.getEmail());

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole("ROLE_FACULTY");
        
        try {
            userRepository.save(user);
        } catch (Exception e) {
            throw new RuntimeException("Error creating user account: " + e.getMessage());
        }

        return new RegistrationResponse(
            faculty.getId(),
            faculty.getName(),
            faculty.getEmail(),
            username,
            password
        );
    }

    private void validateStudentData(Student student) {
        if (student.getName() == null || student.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Student name is required");
        }
        if (student.getDNo() == null) {
            throw new IllegalArgumentException("Department number is required");
        }
        if (student.getDepartment() == null || student.getDepartment().trim().isEmpty()) {
            throw new IllegalArgumentException("Department is required");
        }
        if (student.getEmail() == null || student.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
    }

    private void validateFacultyData(Faculty faculty) {
        if (faculty.getName() == null || faculty.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("Faculty name is required");
        }
        if (faculty.getDepartment() == null || faculty.getDepartment().trim().isEmpty()) {
            throw new IllegalArgumentException("Department is required");
        }
        if (faculty.getEmail() == null || faculty.getEmail().trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }
    }

    private String generateStudentUsername(String name) {
        return name.toLowerCase().replaceAll("\\s+", "");
    }

    private String generateStudentPassword(String name, Long dno) {
        return name.substring(0, 1).toLowerCase() + dno;
    }

    private String generateFacultyUsername(String name, String department) {
        return (name + department).toLowerCase().replaceAll("\\s+", "");
    }

    private String generateFacultyPassword(String email) {
        return email.split("@")[0];
    }
}

