package dev.sumi.api.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(
    name = "glyphs",
    uniqueConstraints = @UniqueConstraint(columnNames = {"script", "glyph_char"}))
public class GlyphEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "glyph_char", nullable = false, length = 16)
  private String glyphChar;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false, length = 16)
  private ScriptType script;

  @Column(name = "row_name", nullable = false, length = 40)
  private String rowName;

  @Column(length = 40)
  private String romaji;

  @Column(length = 40)
  private String onyomi;

  @Column(length = 40)
  private String kunyomi;

  @Column(length = 240)
  private String example;

  public Long getId() {
    return id;
  }

  public String getGlyphChar() {
    return glyphChar;
  }

  public void setGlyphChar(String glyphChar) {
    this.glyphChar = glyphChar;
  }

  public ScriptType getScript() {
    return script;
  }

  public void setScript(ScriptType script) {
    this.script = script;
  }

  public String getRowName() {
    return rowName;
  }

  public void setRowName(String rowName) {
    this.rowName = rowName;
  }

  public String getRomaji() {
    return romaji;
  }

  public void setRomaji(String romaji) {
    this.romaji = romaji;
  }

  public String getOnyomi() {
    return onyomi;
  }

  public void setOnyomi(String onyomi) {
    this.onyomi = onyomi;
  }

  public String getKunyomi() {
    return kunyomi;
  }

  public void setKunyomi(String kunyomi) {
    this.kunyomi = kunyomi;
  }

  public String getExample() {
    return example;
  }

  public void setExample(String example) {
    this.example = example;
  }
}
