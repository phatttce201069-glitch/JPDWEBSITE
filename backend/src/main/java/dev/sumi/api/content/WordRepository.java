package dev.sumi.api.content;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordRepository extends JpaRepository<WordEntity, Integer> {
  List<WordEntity> findByLessonOrderByIdAsc(String lesson);

  List<WordEntity> findAllByOrderByIdAsc();
}
