package com.amr.campus_operations_ai.room.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.amr.campus_operations_ai.room.entity.Room;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
}
