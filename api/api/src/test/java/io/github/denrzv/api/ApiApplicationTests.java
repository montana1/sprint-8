package io.github.denrzv.api;

import org.junit.jupiter.api.Test;
		import org.springframework.beans.factory.annotation.Autowired;
		import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
		import org.springframework.boot.test.context.SpringBootTest;
		import org.springframework.test.web.servlet.MockMvc;

		import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
		import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
		import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
		import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class ApiApplicationTests {

	@Autowired
	MockMvc mockMvc;

	@Test
	void whenValidJwtWithRequiredRole_thenReturns200() throws Exception {
		mockMvc.perform(get("/reports")
						.with(jwt().authorities(
								new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_prothetic_user")
						))
				)
				.andExpect(status().isOk())
				.andExpect(jsonPath("$").isArray())
				.andExpect(jsonPath("$[0]").exists())
		;
	}

	@Test
	void whenNoToken_thenReturns401() throws Exception {
		mockMvc.perform(get("/reports"))
				.andExpect(status().isUnauthorized());
	}

}
