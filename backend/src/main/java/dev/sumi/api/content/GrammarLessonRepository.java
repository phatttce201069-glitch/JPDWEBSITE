package dev.sumi.api.content;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface GrammarLessonRepository extends JpaRepository<GrammarLessonEntity, String> {
  @Query(
      """
      select distinct lesson from GrammarLessonEntity lesson
      left join fetch lesson.points
      order by lesson.id
      """)
  List<GrammarLessonEntity> findAllDetailed();

  @Query("select count(point) from GrammarPointEntity point")
  long countPoints();
}
