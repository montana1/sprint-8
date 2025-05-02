package practicum.sprint8.bionicpro_api.controllers;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ReportController {

    @RequestMapping(method = RequestMethod.GET,
            value = "/report",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> report() {
        return ResponseEntity.ok().body("{\"data\":\"report\"}");
    }

    @RequestMapping(method = RequestMethod.GET,
            value = "/main",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> mainInfo() {
        return ResponseEntity.ok().body("{\"data\":\"common information\"}");
    }
}
