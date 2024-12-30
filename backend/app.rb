require 'sinatra'
require 'sinatra/cross_origin'
require 'net/http'
require 'jwt'

require_relative 'helpers/auth'

configure do
  enable :cross_origin
  set :allow_origin, :any
  set :allow_methods, %i[get post options]
  set :allow_credentials, true
  set :max_age, '1728000'
  set :expose_headers, ['Content-Type']
end

helpers do
  def authorize!
    token = token_from_request
    validation_response = AuthHelper.validate_token(token)
  rescue AuthHelper::AuthError => e
    halt e.status_code, e.message
  end

  def token_from_request
    authorization_header_elements = request.env['HTTP_AUTHORIZATION']&.split
    halt 401, { 'message': 'Requires authentication' } unless authorization_header_elements
    unless authorization_header_elements.length == 2
      halt 401,
           { 'message': 'Authorization header value must follow this format: Bearer access-token' }
    end
    scheme, token = authorization_header_elements
    halt 402, { 'message': 'Bad credentials' } unless scheme.downcase == 'bearer'
    token
  end
end

get '/reports' do
  authorize!
  content_type :json
  { status: 'success', data: { message: 'access_granted' } }.to_json
end

options '*' do
  response.headers['Access-Control-Allow-Methods'] = 'HEAD, GET, PUT, POST, DELETE, OPTIONS'
  response.headers['Access-Control-Allow-Headers'] = 'Content-Type, authorization'
  200
end
