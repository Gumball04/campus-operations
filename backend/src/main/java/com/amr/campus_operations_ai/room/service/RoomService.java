package com.amr.campus_operations_ai.room.service;

import java.util.List;

import jakarta.persistence.EntityNotFoundException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.amr.campus_operations_ai.room.dto.CreateRoomRequest;
import com.amr.campus_operations_ai.room.dto.RoomResponse;
import com.amr.campus_operations_ai.room.dto.UpdateRoomRequest;
import com.amr.campus_operations_ai.room.entity.Room;
import com.amr.campus_operations_ai.room.repository.RoomRepository;
import com.amr.campus_operations_ai.schedule.repository.ScheduleRepository;

import lombok.RequiredArgsConstructor;

/**
 * Provides room management operations.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {

    private final RoomRepository roomRepository;

    private final ScheduleRepository scheduleRepository;

    /**
     * Creates a room.
     *
     * @param request room creation payload
     * @return created room
     */
    @Transactional
    public RoomResponse createRoom(CreateRoomRequest request) {
        Room room = Room.builder()
                .name(request.getName().trim())
                .building(request.getBuilding().trim())
                .floor(request.getFloor())
                .capacity(request.getCapacity())
                .build();
        return toResponse(roomRepository.save(room));
    }

    /**
     * Returns all rooms.
     *
     * @return all rooms
     */
    public List<RoomResponse> getAllRooms() {
        return roomRepository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    /**
     * Returns a room by id.
     *
     * @param id room identifier
     * @return room
     */
    public RoomResponse getRoomById(Long id) {
        return toResponse(findRoomById(id));
    }

    /**
     * Updates a room.
     *
     * @param id room identifier
     * @param request room update payload
     * @return updated room
     */
    @Transactional
    public RoomResponse updateRoom(Long id, UpdateRoomRequest request) {
        Room room = findRoomById(id);
        room.setName(request.getName().trim());
        room.setBuilding(request.getBuilding().trim());
        room.setFloor(request.getFloor());
        room.setCapacity(request.getCapacity());
        return toResponse(roomRepository.save(room));
    }

    /**
     * Deletes a room.
     *
     * @param id room identifier
     */
    @Transactional
    public void deleteRoom(Long id) {
        if (scheduleRepository.existsByRoomId(id)) {
            throw new IllegalArgumentException("Room cannot be deleted because it is assigned to schedules");
        }
        Room room = findRoomById(id);
        roomRepository.delete(room);
    }

    private Room findRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Room not found with id " + id));
    }

    private RoomResponse toResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .name(room.getName())
                .building(room.getBuilding())
                .floor(room.getFloor())
                .capacity(room.getCapacity())
                .build();
    }
}
