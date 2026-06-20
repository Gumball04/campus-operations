package com.amr.campus_operations_ai.config;

import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.amr.campus_operations_ai.course.entity.Course;
import com.amr.campus_operations_ai.course.repository.CourseRepository;
import com.amr.campus_operations_ai.recommendation.dto.RecommendationResponse;
import com.amr.campus_operations_ai.room.entity.Room;
import com.amr.campus_operations_ai.room.repository.RoomRepository;
import com.amr.campus_operations_ai.security.Role;
import com.amr.campus_operations_ai.security.User;
import com.amr.campus_operations_ai.security.UserRepository;
import com.amr.campus_operations_ai.schedule.entity.Schedule;
import com.amr.campus_operations_ai.schedule.repository.ScheduleRepository;
import com.amr.campus_operations_ai.student.entity.Student;
import com.amr.campus_operations_ai.student.repository.StudentRepository;

@Component
public class SeedData implements ApplicationRunner {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final RoomRepository rooms;
    private final CourseRepository courses;
    private final ScheduleRepository schedules;
    private final StudentRepository students;

    public SeedData(UserRepository users, PasswordEncoder encoder, RoomRepository rooms, CourseRepository courses, ScheduleRepository schedules, StudentRepository students) {
        this.users = users;
        this.encoder = encoder;
        this.rooms = rooms;
        this.courses = courses;
        this.schedules = schedules;
        this.students = students;
    }

    @Override
    public void run(ApplicationArguments args) throws Exception {
        // Seed admin
        if (!users.existsByEmail("admin@campus.ai")) {
            User u = User.builder()
                    .fullName("Default Admin")
                    .email("admin@campus.ai")
                    .password(encoder.encode("Admin123!"))
                    .role(Role.ADMIN)
                    .createdAt(java.time.LocalDateTime.now())
                    .build();
            users.save(u);
        }

        if (rooms.count() < 10) {
            List<Room> list = new ArrayList<>();
            for (int i = 1; i <= 10; i++) {
                list.add(Room.builder()
                        .name("R" + i)
                        .building(i <= 5 ? "A" : "B")
                        .floor((i % 3) + 1)
                        .capacity(20 + i)
                        .build());
            }
            rooms.saveAll(list);
        }

        if (courses.count() < 10) {
            List<Course> list = new ArrayList<>();
            for (int i = 1; i <= 10; i++) {
                list.add(Course.builder()
                        .code("CSE" + (100 + i))
                        .name("Course " + i)
                        .studentCount(10 + i)
                        .build());
            }
            courses.saveAll(list);
        }

        if (schedules.count() < 20) {
            List<Schedule> list = new ArrayList<>();
            List<Course> courseList = courses.findAll();
            List<Room> roomList = rooms.findAll();
            int idx = 0;
            for (int i = 0; i < 20; i++) {
                Course c = courseList.get(idx % courseList.size());
                Room r = roomList.get((idx + 1) % roomList.size());
                Schedule s = Schedule.builder()
                        .course(c)
                        .room(r)
                        .day(DayOfWeek.of((i % 7) + 1))
                        .startTime(LocalTime.of(8 + (i % 8), 0))
                        .endTime(LocalTime.of(9 + (i % 8), 30))
                        .build();
                list.add(s);
                idx++;
            }
            schedules.saveAll(list);
        }

        if (students.count() < 50) {
            List<Student> list = new ArrayList<>();
            for (int i = 1; i <= 50; i++) {
                list.add(Student.builder()
                        .studentNumber(String.format("S%05d", i))
                        .fullName("Student " + i)
                        .email("student" + i + "@example.com")
                        .department(i % 2 == 0 ? "CS" : "EE")
                        .createdAt(java.time.LocalDateTime.now())
                        .build());
            }
            students.saveAll(list);
        }
    }
}
