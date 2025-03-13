import type {
  Request as ExpressRequest,
  RequestHandler as ExpressRequestHandler,
  Response as ExpressResponse,
} from "express";
import type { ParsedQs } from "qs";

export type Request<
  RouteParams extends Record<string, string> = any,
  ResBody extends Record<string, any> = any,
  ReqBody extends Record<string, any> = any,
  ReqQuery = ParsedQs
> = ExpressRequest<RouteParams, ResBody, ReqBody, ReqQuery>;

export type RequestHandler<
  RouteParams extends Record<string, string> = any,
  ResBody extends Record<string, any> = any,
  ReqBody extends Record<string, any> = any,
  ReqQuery extends ParsedQs = any
> = ExpressRequestHandler<RouteParams, ResBody, ReqBody, ReqQuery>;

export type Response<ResBody extends Record<string, any> = any> =
  ExpressResponse<ResBody>;

export type JWTUser = {
  exp: number;
  iat: number;
  auth_time: number;
  jti: string;
  iss: string;
  sub: string;
  typ: "Bearer";
  azp: string;
  nonce: string;
  session_state: string;
  acr: string;
  "allowed-origins": string[];
  realm_access: { roles: string[] };
  scope: string;
  sid: string;
  email_verified: boolean;
  name: string;
  preferred_username: string;
  given_name: string;
  family_name: string;
  email: string;
};
