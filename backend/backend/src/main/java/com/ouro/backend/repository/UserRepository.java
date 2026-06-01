package com.ouro.backend.repository;

import com.ouro.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

//import java.util.Optional;
import java.util.UUID;

//public interface UserRepository extends JpaRepository<User, UUID> {
//  Optional<User> findByEmail(String email);
//}
public interface UserRepository extends JpaRepository<User, UUID> {

  User findByEmail(String email);
  User findByEmailIgnoreCase(String email);
}