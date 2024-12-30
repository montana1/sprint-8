require 'jwt'
require 'net/http'

class AuthHelper
  class AuthError < StandardError
    attr_reader :status_code

    def initialize(msg = 'My default message', status_code = 500)
      @status_code = status_code
      super(msg)
    end
  end

  class Response < Struct.new(:message, :error)
  end

  def self.decode_token(token, key)
    jwk = JWT::JWK.new(key)
    JWT.decode(token, jwk.verify_key, true, algorithm: 'RS256')
  rescue JWT::DecodeError
    raise AuthError.new('Invalid token', 401)
  end

  def self.get_keycloak_certs
    keycloak_url = "#{ENV['KEYCLOAK_URL']}/realms/#{ENV['KEYCLOAK_REALM']}/protocol/openid-connect/certs"
    uri = URI(keycloak_url)

    request = Net::HTTP::Get.new(uri)
    response = Net::HTTP.start(uri.hostname, uri.port) do |http|
      http.request(request)
    end
    JSON.parse(response.body)
  end

  def self.validate_token(token)
    encoded_header = token.split('.').first
    kid = JSON.parse(Base64.decode64(encoded_header))['kid']

    key = get_keycloak_certs['keys'].find { |k| k['kid'] == kid }

    payload = decode_token(token, key)
    unless payload&.first&.dig('realm_access', 'roles').to_a.include? 'prothetic_user'
      raise AuthError.new('Invalid token', 401)
    end

    Response.new('Access granted', nil)
  end
end
