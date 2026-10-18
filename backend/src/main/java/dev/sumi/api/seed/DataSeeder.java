package dev.sumi.api.seed;

import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;
import dev.sumi.api.content.GlyphEntity;
import dev.sumi.api.content.GlyphRepository;
import dev.sumi.api.content.GrammarExampleEntity;
import dev.sumi.api.content.GrammarLessonEntity;
import dev.sumi.api.content.GrammarLessonRepository;
import dev.sumi.api.content.GrammarPointEntity;
import dev.sumi.api.content.ScriptType;
import dev.sumi.api.content.WordEntity;
import dev.sumi.api.content.WordRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
public class DataSeeder implements ApplicationRunner {
  private final ObjectMapper json;
  private final GlyphRepository glyphs;
  private final WordRepository words;
  private final GrammarLessonRepository grammar;

  public DataSeeder(
      ObjectMapper json, GlyphRepository glyphs, WordRepository words, GrammarLessonRepository grammar) {
    this.json = json;
    this.glyphs = glyphs;
    this.words = words;
    this.grammar = grammar;
  }

  @Override
  @Transactional
  public void run(org.springframework.boot.ApplicationArguments args) throws Exception {
    if (glyphs.count() == 0) seedGlyphs();
    if (words.count() == 0) seedWords();
    seedGrammar();
  }

  private void seedGlyphs() throws Exception {
    for (JsonNode node : read("seed/glyphs.json")) {
      GlyphEntity glyph = new GlyphEntity();
      glyph.setGlyphChar(text(node, "char"));
      glyph.setScript(ScriptType.valueOf(text(node, "type")));
      glyph.setRowName(text(node, "row"));
      glyph.setRomaji(optional(node, "romaji"));
      glyph.setOnyomi(optional(node, "onyomi"));
      glyph.setKunyomi(optional(node, "kunyomi"));
      glyph.setExample(optional(node, "example"));
      glyphs.save(glyph);
    }
  }

  private void seedWords() throws Exception {
    for (JsonNode node : read("seed/words.json")) {
      WordEntity word = new WordEntity();
      word.setId(node.path("id").asInt());
      word.setCourse(optional(node, "course") == null ? "Khác" : optional(node, "course"));
      word.setLesson(text(node, "lesson"));
      word.setWord(text(node, "word"));
      word.setReading(optional(node, "reading"));
      word.setMeaning(text(node, "meaning"));
      word.setExample(optional(node, "example"));
      words.save(word);
    }
  }

  private void seedGrammar() throws Exception {
    JsonNode root = read("seed/grammar.json");
    int expected = 0;
    for (JsonNode lessonNode : root) expected += lessonNode.path("points").size();
    if (grammar.count() >= root.size() && grammar.countPoints() >= expected) return;
    grammar.deleteAll();
    grammar.flush();
    for (JsonNode lessonNode : root) {
      GrammarLessonEntity lesson = new GrammarLessonEntity();
      lesson.setId(text(lessonNode, "id"));
      lesson.setTitle(text(lessonNode, "title"));
      lesson.setSubtitle(optional(lessonNode, "subtitle"));
      lesson.setDescription(optional(lessonNode, "description"));
      int pointIndex = 0;
      for (JsonNode pointNode : lessonNode.path("points")) {
        GrammarPointEntity point = new GrammarPointEntity();
        point.setId(text(pointNode, "id"));
        point.setPosition(pointIndex++);
        point.setStructureJp(text(pointNode, "structure_jp"));
        point.setStructureVi(optional(pointNode, "structure_vi"));
        point.setFormula(optional(pointNode, "formula"));
        point.setExplanation(optional(pointNode, "explanation"));
        point.setUsage(optional(pointNode, "usage"));
        point.setNote(optional(pointNode, "note"));
        point.setChipsJson(pointNode.path("chips").isMissingNode() ? "[]" : json.writeValueAsString(pointNode.path("chips")));
        int exampleIndex = 0;
        for (JsonNode exampleNode : pointNode.path("examples")) {
          GrammarExampleEntity example = new GrammarExampleEntity();
          example.setPosition(exampleIndex++);
          example.setJp(text(exampleNode, "jp"));
          example.setReading(optional(exampleNode, "reading"));
          example.setRomaji(optional(exampleNode, "romaji"));
          example.setVi(optional(exampleNode, "vi"));
          point.addExample(example);
        }
        lesson.addPoint(point);
      }
      grammar.save(lesson);
    }
  }

  private JsonNode read(String path) throws Exception {
    try (var input = new ClassPathResource(path).getInputStream()) {
      return json.readTree(input);
    }
  }

  private static String text(JsonNode node, String field) {
    String value = optional(node, field);
    if (value == null) throw new IllegalStateException("Thiếu " + field);
    return value;
  }

  private static String optional(JsonNode node, String field) {
    JsonNode value = node.get(field);
    if (value == null || value.isNull()) return null;
    String text = value.asText();
    return text.isBlank() ? null : text;
  }
}
