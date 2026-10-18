package dev.sumi.api.content;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import dev.sumi.api.content.ContentViews.CatalogView;
import dev.sumi.api.content.ContentViews.CourseView;
import dev.sumi.api.content.ContentViews.ExampleView;
import dev.sumi.api.content.ContentViews.GlyphView;
import dev.sumi.api.content.ContentViews.GrammarLessonView;
import dev.sumi.api.content.ContentViews.GrammarPointView;
import dev.sumi.api.content.ContentViews.LessonView;
import dev.sumi.api.content.ContentViews.WordView;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class ContentService {
  private final GlyphRepository glyphs;
  private final WordRepository words;
  private final GrammarLessonRepository grammar;
  private final ObjectMapper json;
  private final String stack;

  public ContentService(
      GlyphRepository glyphs,
      WordRepository words,
      GrammarLessonRepository grammar,
      ObjectMapper json,
      @Value("${sumi.stack}") String stack) {
    this.glyphs = glyphs;
    this.words = words;
    this.grammar = grammar;
    this.json = json;
    this.stack = stack;
  }

  public CatalogView catalog() {
    long points = grammar.countPoints();
    return new CatalogView(glyphs.count(), words.count(), words.findAll().stream().map(WordEntity::getLesson).distinct().count(), points, stack);
  }

  public String stack() {
    return stack;
  }

  public List<GlyphView> glyphs(String script) {
    List<GlyphEntity> rows =
        script == null || script.isBlank()
            ? glyphs.findAllByOrderByIdAsc()
            : glyphs.findByScriptOrderByIdAsc(parseScript(script));
    return rows.stream().map(this::toGlyph).toList();
  }

  public List<WordView> words(String lesson) {
    List<WordEntity> rows =
        lesson == null || lesson.isBlank() ? words.findAllByOrderByIdAsc() : words.findByLessonOrderByIdAsc(lesson);
    return rows.stream().map(this::toWord).toList();
  }

  public List<CourseView> courses() {
    LinkedHashMap<String, List<WordEntity>> grouped = new LinkedHashMap<>();
    for (WordEntity word : words.findAllByOrderByIdAsc()) {
      grouped.computeIfAbsent(word.getCourse(), key -> new ArrayList<>()).add(word);
    }
    List<CourseView> result = new ArrayList<>();
    grouped.forEach(
        (course, items) -> {
          LinkedHashMap<String, Integer> counts = new LinkedHashMap<>();
          for (WordEntity item : items) {
            counts.merge(item.getLesson(), 1, Integer::sum);
          }
          List<LessonView> lessons =
              counts.entrySet().stream()
                  .map(entry -> new LessonView(entry.getKey(), shortTitle(entry.getKey()), entry.getValue()))
                  .toList();
          result.add(new CourseView(course, lessons));
        });
    return result;
  }

  public List<GrammarLessonView> grammar() {
    return grammar.findAllDetailed().stream().map(this::toLesson).toList();
  }

  private GlyphView toGlyph(GlyphEntity glyph) {
    return new GlyphView(
        glyph.getId(),
        glyph.getGlyphChar(),
        glyph.getScript().name(),
        glyph.getRowName(),
        glyph.getRomaji(),
        glyph.getOnyomi(),
        glyph.getKunyomi(),
        glyph.getExample());
  }

  private WordView toWord(WordEntity word) {
    return new WordView(
        word.getId(), word.getCourse(), word.getLesson(), word.getWord(), word.getReading(), word.getMeaning(), word.getExample());
  }

  private GrammarLessonView toLesson(GrammarLessonEntity lesson) {
    return new GrammarLessonView(
        lesson.getId(),
        lesson.getTitle(),
        lesson.getSubtitle(),
        lesson.getDescription(),
        lesson.getPoints().stream().map(this::toPoint).toList());
  }

  private GrammarPointView toPoint(GrammarPointEntity point) {
    return new GrammarPointView(
        point.getId(),
        point.getStructureJp(),
        point.getStructureVi(),
        point.getFormula(),
        point.getExplanation(),
        point.getUsage(),
        point.getNote(),
        readChips(point.getChipsJson()),
        point.getExamples().stream()
            .map(example -> new ExampleView(example.getJp(), example.getReading(), example.getRomaji(), example.getVi()))
            .toList());
  }

  private List<String> readChips(String raw) {
    if (raw == null || raw.isBlank()) return List.of();
    try {
      return json.readValue(raw, new TypeReference<List<String>>() {});
    } catch (Exception error) {
      return List.of();
    }
  }

  private static ScriptType parseScript(String script) {
    try {
      return ScriptType.valueOf(script);
    } catch (IllegalArgumentException error) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "script không hợp lệ");
    }
  }

  private static String shortTitle(String lesson) {
    return lesson.replaceFirst("^JPD\\d+\\s*-\\s*", "");
  }
}
