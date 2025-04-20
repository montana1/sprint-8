package public_key

import (
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"syscall"
	"time"
)

func Read(keycloakURL string) (*rsa.PublicKey, error) {
	response, err := tryRead(keycloakURL)
	if err != nil {
		return nil, err
	}
	var body []byte
	body, err = io.ReadAll(response.Body)
	if err != nil {
		return nil, err
	}
	jsonDecoded := make(map[string]interface{})
	err = json.Unmarshal(body, &jsonDecoded)
	if err != nil {
		return nil, err
	}
	var publicKeyEncoded string
	if value, ok := jsonDecoded["public_key"]; !ok {
		return nil, errors.New("no public_key")
	} else {
		publicKeyEncoded = value.(string)
	}
	var buffer []byte
	buffer, err = base64.StdEncoding.DecodeString(publicKeyEncoded)
	if err != nil {
		return nil, err
	}
	var anyKey interface{}
	anyKey, err = x509.ParsePKIXPublicKey(buffer)
	if err != nil {
		return nil, err
	}
	publicKey, ok := anyKey.(*rsa.PublicKey)
	if ok {
		return publicKey, nil
	}
	return nil, fmt.Errorf("unexpected public_key type %T", publicKey)
}

func tryRead(keycloakURL string) (*http.Response, error) {
	var (
		response *http.Response
		err      error
	)
	for try := 0; try < 5; try++ {
		time.Sleep(3 * time.Second)
		response, err = http.Get(keycloakURL)
		if err == nil {
			return response, nil
		} else if !errors.Is(err, syscall.ECONNREFUSED) {
			return nil, err
		}
	}
	return nil, err
}
