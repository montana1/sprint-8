package practicum.sprint8.bionicpro_api.controllers;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
public class ReportController {

//    @PreAuthorize("hasRole('PROTHETIC_USER')")
//    @PreAuthorize("hasAnyRole({'PROTHETIC_USER'})")
    @CrossOrigin(origins = {"http://localhost:3000","http://frontend:3000"})
    @RequestMapping(method = RequestMethod.GET,
            value = "/report",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> report() {
        return ResponseEntity.ok().body("{\"data\":\"report\"}");
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @RequestMapping(method = RequestMethod.GET,
            value = "/main",
            produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Object> mainInfo() {
        return ResponseEntity.ok().body("{\"data\":\"common information\"}");
    }
}
