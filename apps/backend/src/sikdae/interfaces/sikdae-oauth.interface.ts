export interface SikdaeSsoResponse {
  sso: boolean;
  url: string;
}

export interface SikdaeKmsPublicKeyResponse {
  publicKey: string;
}

export interface SikdaeTokenRequestBody {
  username: string;
  client_secret: string;
  client_id: string;
  grant_type: "password";
  password: string;
}

export interface SikdaeTokenAccount {
  guid: string;
  password: string;
  duplicated: boolean;
  login_time: string;
  user_restore: boolean;
  user_lack: boolean;
}

export interface SikdaeTokenResponse {
  ver: number;
  account: SikdaeTokenAccount;
  access_token: string;
  refresh_token: string;
  token_type: string;
  expire_time: number;
}

export interface SikdaeMeResponse {
  content: Record<string, unknown>;
  status: string;
}
