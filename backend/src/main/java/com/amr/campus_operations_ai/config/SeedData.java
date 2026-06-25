package com.amr.campus_operations_ai.config;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.function.Function;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

import com.amr.campus_operations_ai.course.entity.Course;
import com.amr.campus_operations_ai.course.repository.CourseRepository;
import com.amr.campus_operations_ai.room.entity.Room;
import com.amr.campus_operations_ai.room.repository.RoomRepository;
import com.amr.campus_operations_ai.schedule.entity.Schedule;
import com.amr.campus_operations_ai.schedule.repository.ScheduleRepository;
import com.amr.campus_operations_ai.security.Role;
import com.amr.campus_operations_ai.security.User;
import com.amr.campus_operations_ai.security.UserRepository;
import com.amr.campus_operations_ai.student.entity.Student;
import com.amr.campus_operations_ai.student.repository.StudentRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
@Transactional
public class SeedData implements ApplicationRunner {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final RoomRepository rooms;
    private final CourseRepository courses;
    private final ScheduleRepository schedules;
    private final StudentRepository students;

    @Override
    public void run(ApplicationArguments args) {
        seedAdmin();
        seedRooms();
        seedCourses();
        seedSchedules();
        seedStudents();
    }

    private void seedAdmin() {
        if (users.existsByEmail("admin@campus.ai")) {
            return;
        }

        users.save(User.builder()
                .fullName("Default Admin")
                .email("admin@campus.ai")
                .password(encoder.encode("Admin123!"))
                .role(Role.ADMIN)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private void seedRooms() {
        Set<String> existing = rooms.findAll().stream()
                .map(room -> room.getName().toLowerCase())
                .collect(Collectors.toSet());

        List<Room> missing = List.of(
                room("Atlas 101", "Atlas", 1, 28),
                room("Atlas 102", "Atlas", 1, 35),
                room("Atlas 201", "Atlas", 2, 45),
                room("Atlas 202", "Atlas", 2, 55),
                room("Atlas 301", "Atlas", 3, 80),
                room("Borealis 101", "Borealis", 1, 24),
                room("Borealis 102", "Borealis", 1, 30),
                room("Borealis 201", "Borealis", 2, 60),
                room("Borealis 202", "Borealis", 2, 72),
                room("Cedar 101", "Cedar", 1, 90)).stream()
                .filter(room -> !existing.contains(room.getName().toLowerCase()))
                .toList();

        if (!missing.isEmpty()) {
            rooms.saveAll(missing);
        }
    }

    private void seedCourses() {
        Set<String> existing = courses.findAll().stream()
                .map(course -> course.getCode().toLowerCase())
                .collect(Collectors.toSet());

        List<Course> missing = List.of(
                course("CSE201", "Data Structures", 78),
                course("MAT105", "Calculus II", 64),
                course("BUS210", "Project Management", 52),
                course("ENG101", "Academic Writing", 22),
                course("HIS201", "Modern History", 18),
                course("PHY110", "Physics Lab", 30),
                course("ART120", "Design Thinking", 26),
                course("BIO130", "Biotechnology Foundations", 40)).stream()
                .filter(course -> !existing.contains(course.getCode().toLowerCase()))
                .toList();

        if (!missing.isEmpty()) {
            courses.saveAll(missing);
        }
    }

    private void seedSchedules() {
        Map<String, Course> courseByCode = courses.findAll().stream()
                .collect(Collectors.toMap(
                        Course::getCode,
                        Function.identity(),
                        (existing, duplicate) -> existing));
        Map<String, Room> roomByName = rooms.findAll().stream()
                .collect(Collectors.toMap(
                        Room::getName,
                        Function.identity(),
                        (existing, duplicate) -> existing));

        List<ScheduleSpec> desired = List.of(
                new ScheduleSpec("CSE201", "Atlas 101", DayOfWeek.MONDAY, "09:00", "10:30"),
                new ScheduleSpec("MAT105", "Atlas 101", DayOfWeek.MONDAY, "10:00", "11:30"),
                new ScheduleSpec("BUS210", "Borealis 201", DayOfWeek.TUESDAY, "13:00", "14:30"),
                new ScheduleSpec("PHY110", "Borealis 201", DayOfWeek.TUESDAY, "14:00", "15:30"),
                new ScheduleSpec("ENG101", "Atlas 202", DayOfWeek.WEDNESDAY, "08:30", "10:00"),
                new ScheduleSpec("ART120", "Atlas 301", DayOfWeek.WEDNESDAY, "10:15", "11:45"),
                new ScheduleSpec("HIS201", "Borealis 102", DayOfWeek.WEDNESDAY, "12:00", "13:30"),
                new ScheduleSpec("BIO130", "Borealis 202", DayOfWeek.THURSDAY, "09:00", "10:30"),
                new ScheduleSpec("CSE201", "Atlas 301", DayOfWeek.THURSDAY, "11:00", "12:30"),
                new ScheduleSpec("MAT105", "Atlas 201", DayOfWeek.THURSDAY, "13:00", "14:30"),
                new ScheduleSpec("BUS210", "Atlas 202", DayOfWeek.FRIDAY, "08:00", "09:30"),
                new ScheduleSpec("PHY110", "Borealis 102", DayOfWeek.FRIDAY, "10:00", "11:30"),
                new ScheduleSpec("ENG101", "Borealis 201", DayOfWeek.FRIDAY, "12:00", "13:30"),
                new ScheduleSpec("ART120", "Atlas 201", DayOfWeek.SUNDAY, "09:00", "10:30"),
                new ScheduleSpec("HIS201", "Cedar 101", DayOfWeek.SUNDAY, "11:00", "12:30"),
                new ScheduleSpec("BIO130", "Atlas 301", DayOfWeek.SUNDAY, "13:00", "14:30"),
                new ScheduleSpec("ENG101", "Borealis 101", DayOfWeek.MONDAY, "12:00", "13:30"),
                new ScheduleSpec("ART120", "Atlas 102", DayOfWeek.TUESDAY, "08:00", "09:30"),
                new ScheduleSpec("HIS201", "Cedar 101", DayOfWeek.TUESDAY, "10:00", "11:30"),
                new ScheduleSpec("BIO130", "Borealis 202", DayOfWeek.SATURDAY, "09:00", "10:30"));

        Set<String> existing = schedules.findAll().stream()
                .map(schedule -> scheduleKey(
                        schedule.getCourse().getCode(),
                        schedule.getRoom().getName(),
                        schedule.getDay(),
                        schedule.getStartTime(),
                        schedule.getEndTime()))
                .collect(Collectors.toSet());

        List<Schedule> missing = desired.stream()
                .filter(spec -> !existing.contains(spec.key()))
                .map(spec -> schedule(courseByCode, roomByName, spec.courseCode(), spec.roomName(), spec.day(), spec.start(), spec.end()))
                .toList();

        if (!missing.isEmpty()) {
            schedules.saveAll(missing);
        }
    }

    private void seedStudents() {
        Set<String> existing = students.findAll().stream()
                .map(student -> student.getStudentNumber().toLowerCase())
                .collect(Collectors.toSet());

        List<Student> missing = List.of(
                student("S00001", "Amina Hassan", "amina.hassan@example.edu", "Computer Science"),
                student("S00002", "Omar Saleh", "omar.saleh@example.edu", "Computer Science"),
                student("S00003", "Lina Haddad", "lina.haddad@example.edu", "Business"),
                student("S00004", "Yousef Nasser", "yousef.nasser@example.edu", "Engineering"),
                student("S00005", "Maya Rami", "maya.rami@example.edu", "Liberal Arts"),
                student("S00006", "Samer Qasim", "samer.qasim@example.edu", "Sciences"),
                student("S00007", "Noor Khalil", "noor.khalil@example.edu", "Business"),
                student("S00008", "Zaid Faris", "zaid.faris@example.edu", "Engineering"),
                student("S00009", "Huda Ali", "huda.ali@example.edu", "Sciences"),
                student("S00010", "Salma Karim", "salma.karim@example.edu", "Liberal Arts"),
                student("S00011", "Kareem Othman", "kareem.othman@example.edu", "Computer Science"),
                student("S00012", "Rana Issa", "rana.issa@example.edu", "Business"),
                student("S00013", "Tariq Mahmoud", "tariq.mahmoud@example.edu", "Engineering"),
                student("S00014", "Dalia Amin", "dalia.amin@example.edu", "Sciences"),
                student("S00015", "Hassan Eid", "hassan.eid@example.edu", "Computer Science"),
                student("S00016", "Nour Saad", "nour.saad@example.edu", "Business"),
                student("S00017", "Jana Fadel", "jana.fadel@example.edu", "Engineering"),
                student("S00018", "Faris Zaki", "faris.zaki@example.edu", "Sciences"),
                student("S00019", "Reem Saleh", "reem.saleh@example.edu", "Liberal Arts"),
                student("S00020", "Bassam Sami", "bassam.sami@example.edu", "Computer Science"),
                student("S00021", "Hanin Yassin", "hanin.yassin@example.edu", "Business"),
                student("S00022", "Adel Nabil", "adel.nabil@example.edu", "Engineering"),
                student("S00023", "Rayan Shadi", "rayan.shadi@example.edu", "Sciences"),
                student("S00024", "Mona Walid", "mona.walid@example.edu", "Liberal Arts"),
                student("S00025", "Tala Jamal", "tala.jamal@example.edu", "Computer Science")).stream()
                .filter(student -> !existing.contains(student.getStudentNumber().toLowerCase()))
                .toList();

        if (!missing.isEmpty()) {
            students.saveAll(missing);
        }
    }

    private Room room(String name, String building, Integer floor, Integer capacity) {
        return Room.builder()
                .name(name)
                .building(building)
                .floor(floor)
                .capacity(capacity)
                .build();
    }

    private Course course(String code, String name, Integer studentCount) {
        return Course.builder()
                .code(code)
                .name(name)
                .studentCount(studentCount)
                .build();
    }

    private Student student(String number, String fullName, String email, String department) {
        return Student.builder()
                .studentNumber(number)
                .fullName(fullName)
                .email(email)
                .department(department)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private Schedule schedule(Map<String, Course> courseByCode, Map<String, Room> roomByName,
            String courseCode, String roomName, DayOfWeek day, String start, String end) {
        return Schedule.builder()
                .course(courseByCode.get(courseCode))
                .room(roomByName.get(roomName))
                .day(day)
                .startTime(LocalTime.parse(start))
                .endTime(LocalTime.parse(end))
                .build();
    }

    private String scheduleKey(String courseCode, String roomName, DayOfWeek day, LocalTime start, LocalTime end) {
        return String.join("|",
                courseCode.toLowerCase(),
                roomName.toLowerCase(),
                day.name(),
                start.toString(),
                end.toString());
    }

    private record ScheduleSpec(String courseCode, String roomName, DayOfWeek day, String start, String end) {
        String key() {
            return String.join("|",
                    courseCode.toLowerCase(),
                    roomName.toLowerCase(),
                    day.name(),
                    start,
                    end);
        }
    }
}
