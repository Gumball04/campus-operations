package com.amr.campus_operations_ai.schedule.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.amr.campus_operations_ai.schedule.entity.Schedule;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {

    boolean existsByRoomId(Long roomId);

    boolean existsByCourseId(Long courseId);
}
