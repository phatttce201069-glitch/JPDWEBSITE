package dev.sumi.api.content;

import java.util.List;

public final class ContentViews {
  private ContentViews() {}

  public record HealthView(String status, String service, String stack) {}

  public record CatalogView(long glyphs, long words, long lessons, long grammarPoints, String stack) {}

  public record GlyphView(
      long id,
      String character,
      String script,
      String row,
      String romaji,
      String onyomi,
      String kunyomi,
      String example) {}

  public record WordView(
      int id,
      String course,
      String lesson,
      String word,
      String reading,
      String meaning,
      String example) {}

  public record LessonView(String lesson, String title, int count) {}

  public record CourseView(String course, List<LessonView> lessons) {}

  public record ExampleView(String jp, String reading, String romaji, String vi) {}

  public record GrammarPointView(
      String id,
      String structureJp,
      String structureVi,
      String formula,
      String explanation,
      String usage,
      String note,
      List<String> chips,
      List<ExampleView> examples) {}

  public record GrammarLessonView(
      String id,
      String title,
      String subtitle,
      String description,
      List<GrammarPointView> points) {}
}
