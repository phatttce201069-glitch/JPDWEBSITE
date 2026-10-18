package dev.sumi.api.progress;

import dev.sumi.api.progress.ProgressService.ProgressView;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {
  private final ProgressService progress;

  public ProgressController(ProgressService progress) {
    this.progress = progress;
  }

  @GetMapping
  public ProgressView get(@RequestHeader(value = "X-Device-Id", required = false) String deviceId) {
    return progress.get(deviceId);
  }

  @PutMapping
  public ProgressView save(
      @RequestHeader(value = "X-Device-Id", required = false) String deviceId, @RequestBody ProgressView body) {
    return progress.save(deviceId, body);
  }
}
