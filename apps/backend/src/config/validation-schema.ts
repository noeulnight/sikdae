import Joi from "joi";

export const validationSchema = Joi.object({
  PORT: Joi.number().port().default(4000),
  REDIS_URL: Joi.string()
    .uri({ scheme: ["redis", "rediss"] })
    .optional(),
  SIKDAE_API_BASE_URL: Joi.string().uri().default("https://api.sikdae.com"),
  SIKDAE_CLIENT_ID: Joi.string().required(),
  SIKDAE_CLIENT_SECRET: Joi.string().required(),
  SIKDAE_KMS_KEY_ID: Joi.string().required(),
  SIKDAE_OAUTH_BASE_URL: Joi.string().uri().required(),
  SIKDAE_PASSWORD: Joi.string().required(),
  SIKDAE_SIGN_ID: Joi.string().required(),
  SIKDAE_X_USER_AGENT: Joi.string().required(),
});
