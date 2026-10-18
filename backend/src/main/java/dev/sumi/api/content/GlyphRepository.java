package dev.sumi.api.content;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GlyphRepository extends JpaRepository<GlyphEntity, Long> {
  List<GlyphEntity> findByScriptOrderByIdAsc(ScriptType script);

  List<GlyphEntity> findAllByOrderByIdAsc();
}
