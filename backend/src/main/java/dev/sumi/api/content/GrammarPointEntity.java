package dev.sumi.api.content;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.Table;
import java.util.ArrayList;
import java.util.List;
import org.hibernate.annotations.Fetch;
import org.hibernate.annotations.FetchMode;

@Entity
@Table(name = "grammar_points")
public class GrammarPointEntity {
  @Id
  @Column(length = 16)
  private String id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "lesson_id")
  private GrammarLessonEntity lesson;

  private int position;

  @Column(name = "structure_jp", nullable = false, length = 200)
  private String structureJp;

  @Column(name = "structure_vi", length = 200)
  private String structureVi;

  @Column(length = 300)
  private String formula;

  @Column(length = 300)
  private String explanation;

  @Column(length = 400)
  private String usage;

  @Column(length = 400)
  private String note;

  @Column(name = "chips_json", length = 400)
  private String chipsJson;

  @OneToMany(mappedBy = "point", cascade = CascadeType.ALL, orphanRemoval = true)
  @OrderBy("position")
  @Fetch(FetchMode.SUBSELECT)
  private List<GrammarExampleEntity> examples = new ArrayList<>();

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public GrammarLessonEntity getLesson() {
    return lesson;
  }

  public void setLesson(GrammarLessonEntity lesson) {
    this.lesson = lesson;
  }

  public int getPosition() {
    return position;
  }

  public void setPosition(int position) {
    this.position = position;
  }

  public String getStructureJp() {
    return structureJp;
  }

  public void setStructureJp(String structureJp) {
    this.structureJp = structureJp;
  }

  public String getStructureVi() {
    return structureVi;
  }

  public void setStructureVi(String structureVi) {
    this.structureVi = structureVi;
  }

  public String getFormula() {
    return formula;
  }

  public void setFormula(String formula) {
    this.formula = formula;
  }

  public String getExplanation() {
    return explanation;
  }

  public void setExplanation(String explanation) {
    this.explanation = explanation;
  }

  public String getUsage() {
    return usage;
  }

  public void setUsage(String usage) {
    this.usage = usage;
  }

  public String getNote() {
    return note;
  }

  public void setNote(String note) {
    this.note = note;
  }

  public String getChipsJson() {
    return chipsJson;
  }

  public void setChipsJson(String chipsJson) {
    this.chipsJson = chipsJson;
  }

  public List<GrammarExampleEntity> getExamples() {
    return examples;
  }

  public void addExample(GrammarExampleEntity example) {
    example.setPoint(this);
    examples.add(example);
  }
}
