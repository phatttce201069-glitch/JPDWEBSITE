package dev.sumi.api.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "words")
public class WordEntity {
  @Id
  private Integer id;

  @Column(nullable = false, length = 80)
  private String course;

  @Column(nullable = false, length = 120)
  private String lesson;

  @Column(nullable = false, length = 80)
  private String word;

  @Column(length = 80)
  private String reading;

  @Column(nullable = false, length = 240)
  private String meaning;

  @Column(length = 400)
  private String example;

  public Integer getId() {
    return id;
  }

  public void setId(Integer id) {
    this.id = id;
  }

  public String getCourse() {
    return course;
  }

  public void setCourse(String course) {
    this.course = course;
  }

  public String getLesson() {
    return lesson;
  }

  public void setLesson(String lesson) {
    this.lesson = lesson;
  }

  public String getWord() {
    return word;
  }

  public void setWord(String word) {
    this.word = word;
  }

  public String getReading() {
    return reading;
  }

  public void setReading(String reading) {
    this.reading = reading;
  }

  public String getMeaning() {
    return meaning;
  }

  public void setMeaning(String meaning) {
    this.meaning = meaning;
  }

  public String getExample() {
    return example;
  }

  public void setExample(String example) {
    this.example = example;
  }
}
