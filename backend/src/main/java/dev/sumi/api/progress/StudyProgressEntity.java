package dev.sumi.api.progress;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.Instant;

@Entity
@Table(name = "study_progress")
public class StudyProgressEntity {
  @Id
  @Column(length = 64)
  private String deviceId;

  @Column(nullable = false, length = 20000)
  private String knownKanaJson;

  @Column(nullable = false, length = 20000)
  private String knownWordsJson;

  @Column(nullable = false, length = 20000)
  private String starredJson;

  @Column(length = 2000)
  private String lastJson;

  @Column(nullable = false)
  private Instant updatedAt;

  public String getDeviceId() {
    return deviceId;
  }

  public void setDeviceId(String deviceId) {
    this.deviceId = deviceId;
  }

  public String getKnownKanaJson() {
    return knownKanaJson;
  }

  public void setKnownKanaJson(String knownKanaJson) {
    this.knownKanaJson = knownKanaJson;
  }

  public String getKnownWordsJson() {
    return knownWordsJson;
  }

  public void setKnownWordsJson(String knownWordsJson) {
    this.knownWordsJson = knownWordsJson;
  }

  public String getStarredJson() {
    return starredJson;
  }

  public void setStarredJson(String starredJson) {
    this.starredJson = starredJson;
  }

  public String getLastJson() {
    return lastJson;
  }

  public void setLastJson(String lastJson) {
    this.lastJson = lastJson;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
