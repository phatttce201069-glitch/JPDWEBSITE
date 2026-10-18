package dev.sumi.api.config;

import org.springframework.http.ProblemDetail;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

@RestControllerAdvice
public class ApiExceptionHandler {
  @ExceptionHandler(ResponseStatusException.class)
  public ProblemDetail status(ResponseStatusException error) {
    return ProblemDetail.forStatusAndDetail(error.getStatusCode(), error.getReason());
  }
}
