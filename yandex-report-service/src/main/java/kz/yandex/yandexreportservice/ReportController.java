package kz.yandex.yandexreportservice;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.util.Base64;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/reports")
public class ReportController {

	private final Logger log = LoggerFactory.getLogger(getClass());

	private final RestTemplate restTemplate;

	public ReportController(RestTemplateBuilder builder) {
		this.restTemplate = builder.build();
	}

	@GetMapping
	public ResponseEntity<String> getReport(@RequestHeader(value = "Authorization", required = false) String token) {

		TokenDto tokenDto = getInfo(token);
		if (tokenDto == null || !tokenDto.isActive() || !tokenDto.roles().contains("prothetic_user")) {
			return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
		}
		return ResponseEntity.ok("Yandex Report Service");
	}

	public TokenDto getInfo(String token) {
		if (StringUtils.isEmpty(token)) {
			return null;
		}

		log.info("token {}", token);
		token = token.substring(7);

		String url = "http://localhost:8080/realms/reports-realm/protocol/openid-connect/token/introspect";

		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
		String auth = Base64.getEncoder()
			.encodeToString("reports-api:oNwoLQdvJAvRcL89SydqCWCe5ry1jMgq".getBytes());
		headers.add("Authorization", "Basic " + auth);

		MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
		params.add("token", token);
		params.add("client_id", "reports-api");
		params.add("client_secret", "oNwoLQdvJAvRcL89SydqCWCe5ry1jMgq");

		HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
		log.info("params {}", params);
		log.info("headers {}", headers);

		ResponseEntity<Map> response = restTemplate.exchange(url, HttpMethod.POST, entity, Map.class);

		log.info("response {}", response);

		Map body = response.getBody();

		if (response.getStatusCode() == HttpStatus.OK && body != null) {
			return new TokenDto(
				((List) ((Map) body.get("realm_access")).get("roles")),
				Boolean.TRUE.equals(body.get("active"))
			);
		}

		return null;
	}
}
