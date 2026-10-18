package dev.sumi.api.content;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "grammar_examples")
public class GrammarExampleEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "point_id")
  private GrammarPointEntity point;

  private int position;

  @Column(name = "jp_text", nullable = false, length = 400)
  private String jp;

  @Column(length = 400)
  private String reading;

  @Column(length = 400)
  private String romaji;

  @Column(length = 400)
  private String vi;

  public void setPoint(GrammarPointEntity point) {
    this.point = point;
  }

  public int getPosition() {
    return position;
  }

  public void setPosition(int position) {
    this.position = position;
  }

  public String getJp() {
    return jp;
  }

  public void setJp(String jp) {
    this.jp = jp;
  }

  public String getReading() {
    return reading;
  }

  public void setReading(String reading) {
    this.reading = reading;
  }

  public String getRomaji() {
    return romaji;
  }

  public void setRomaji(String romaji) {
    this.romaji = romaji;
  }

  public String getVi() {
    return vi;
  }

  public void setVi(String vi) {
    this.vi = vi;
  }
}
