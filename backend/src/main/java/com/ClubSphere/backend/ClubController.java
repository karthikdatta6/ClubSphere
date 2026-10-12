
package com.ClubSphere.backend;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/clubs")
@CrossOrigin(origins = "http://localhost:5173")
public class ClubController {

    private final ClubRepository clubRepository;

    public ClubController(ClubRepository clubRepository) {
        this.clubRepository = clubRepository;
    }

    // Get all clubs
    @GetMapping
    public List<Club> getAllClubs() {
        return clubRepository.findAll();
    }

    // Get a club by ID
    @GetMapping("/{id}")
    public ResponseEntity<Club> getClubById(@PathVariable Long id) {
        Optional<Club> club = clubRepository.findById(id);

        return club.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    // Register a new club
    @PostMapping
    public ResponseEntity<Club> createClub(@RequestBody Club club) {
        club.setStatus("PENDING_APPROVAL");

        Club savedClub = clubRepository.save(club);

        return ResponseEntity.status(HttpStatus.CREATED).body(savedClub);
    }

    // Get clubs by approval status
    @GetMapping("/status/{status}")
    public List<Club> getClubsByStatus(@PathVariable String status) {
        return clubRepository.findByStatus(status.toUpperCase());
    }

    // Search clubs by category
    @GetMapping("/category/{category}")
    public List<Club> getClubsByCategory(@PathVariable String category) {
        return clubRepository.findByCategoryIgnoreCase(category);
    }

    // Search clubs by country
    @GetMapping("/country/{country}")
    public List<Club> getClubsByCountry(@PathVariable String country) {
        return clubRepository.findByCountryIgnoreCase(country);
    }

    // Search clubs by name
    @GetMapping("/search")
    public List<Club> searchClubs(@RequestParam String name) {
        return clubRepository.findByNameContainingIgnoreCase(name);
    }

    // Approve a club
    @PatchMapping("/{id}/approve")
    public ResponseEntity<Club> approveClub(@PathVariable Long id) {
        Optional<Club> optionalClub = clubRepository.findById(id);

        if (optionalClub.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Club club = optionalClub.get();
        club.setStatus("APPROVED");

        return ResponseEntity.ok(clubRepository.save(club));
    }

    // Reject a club
    @PatchMapping("/{id}/reject")
    public ResponseEntity<Club> rejectClub(@PathVariable Long id) {
        Optional<Club> optionalClub = clubRepository.findById(id);

        if (optionalClub.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Club club = optionalClub.get();
        club.setStatus("REJECTED");

        return ResponseEntity.ok(clubRepository.save(club));
    }
}
