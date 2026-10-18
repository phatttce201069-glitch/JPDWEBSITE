package dev.sumi.api.progress;

import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProgressService {
  private final StudyProgressRepository progress;
  private final ObjectMapper json;

  public ProgressService(StudyProgressRepository progress, ObjectMapper json) {
    this.progress = progress;
    this.json = json;
  }

  @Transactional(readOnly = true)
  public ProgressView get(String deviceId) {
    return progress.findById(requireDevice(deviceId)).map(this::toView).orElseGet(ProgressView::empty);
  }

  @Transactional
  public ProgressView save(String deviceId, ProgressView body) {
    String id = requireDevice(deviceId);
    StudyProgressEntity entity = progress.findById(id).orElseGet(StudyProgressEntity::new);
    entity.setDeviceId(id);
    entity.setKnownKanaJson(write(body.knownKana() == null ? List.of() : body.knownKana()));
    entity.setKnownWordsJson(write(body.knownWords() == null ? List.of() : body.knownWords()));
    entity.setStarredJson(write(body.starred() == null ? List.of() : body.starred()));
    entity.setLastJson(body.last() == null ? null : write(body.last()));
    entity.setUpdatedAt(Instant.now());
    return toView(progress.save(entity));
  }

  private ProgressView toView(StudyProgressEntity entity) {
    return new ProgressView(
        read(entity.getKnownKanaJson(), new TypeReference<List<String>>() {}),
        read(entity.getKnownWordsJson(), new TypeReference<List<Integer>>() {}),
        read(entity.getStarredJson(), new TypeReference<List<Integer>>() {}),
        entity.getLastJson() == null ? null : read(entity.getLastJson(), new TypeReference<Object>() {}));
  }

  private String write(Object value) {
    try {
      return json.writeValueAsString(value);
    } catch (Exception error) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tiến độ không đọc được");
    }
  }

  private <T> T read(String raw, TypeReference<T> type) {
    try {
      return json.readValue(raw, type);
    } catch (Exception error) {
      throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Tiến độ lưu bị hỏng");
    }
  }

  private static String requireDevice(String deviceId) {
    if (deviceId == null || !deviceId.matches("[A-Za-z0-9-]{8,64}")) {
      throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu X-Device-Id");
    }
    return deviceId;
  }

  public record ProgressView(List<String> knownKana, List<Integer> knownWords, List<Integer> starred, Object last) {
    public static ProgressView empty() {
      return new ProgressView(List.of(), List.of(), List.of(), null);
    }
  }
}
