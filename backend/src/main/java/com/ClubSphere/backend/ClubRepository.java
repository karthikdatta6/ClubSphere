
package com.ClubSphere.backend;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClubRepository extends JpaRepository<Club, Long> {

    List<Club> findByStatus(String status);

    List<Club> findByCategoryIgnoreCase(String category);

    List<Club> findByCountryIgnoreCase(String country);

    List<Club> findByNameContainingIgnoreCase(String name);
}
