package dev.sumi.api.content;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "grammar_lessons")
public class GrammarLessonEntity {
  @Id
  @Column(length = 16)
  private String id;

  @Column(nullable = false, length = 160)
  private String title;

  @Column(length = 80)
  private String subtitle;

  @Column(length = 500)
  private String description;

  @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("position")
  private List<GrammarPointEntity> points = new ArrayList<>();

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getSubtitle() {
    return subtitle;
  }

  public void setSubtitle(String subtitle) {
    this.subtitle = subtitle;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public List<GrammarPointEntity> getPoints() {
    return points;
  }

  public void addPoint(GrammarPointEntity point) {
    point.setLesson(this);
    points.add(point);
  }
}
