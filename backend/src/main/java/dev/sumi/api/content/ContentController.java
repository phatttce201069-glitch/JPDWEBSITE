package dev.sumi.api.content;

import dev.sumi.api.content.ContentViews.CatalogView;
import dev.sumi.api.content.ContentViews.CourseView;
import dev.sumi.api.content.ContentViews.GlyphView;
import dev.sumi.api.content.ContentViews.GrammarLessonView;
import dev.sumi.api.content.ContentViews.HealthView;
import dev.sumi.api.content.ContentViews.WordView;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class ContentController {
  private final ContentService content;

  public ContentController(ContentService content) {
    this.content = content;
  }

  @GetMapping("/health")
  public HealthView health() {
    return new HealthView("ok", "sumi-api", content.stack());
  }

  @GetMapping("/catalog")
  public CatalogView catalog() {
    return content.catalog();
  }

  @GetMapping("/glyphs")
  public List<GlyphView> glyphs(@RequestParam(required = false) String script) {
    return content.glyphs(script);
  }

  @GetMapping("/words")
  public List<WordView> words(@RequestParam(required = false) String lesson) {
    return content.words(lesson);
  }

  @GetMapping("/courses")
  public List<CourseView> courses() {
    return content.courses();
  }

  @GetMapping("/grammar")
  public List<GrammarLessonView> grammar() {
    return content.grammar();
  }
}
