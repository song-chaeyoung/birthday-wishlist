type SiteUrlEnv = Record<string, string | undefined>;

const localSiteUrl = new URL("http://localhost:3000");

function parsePublicUrl(value: string | undefined): URL | undefined {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    return undefined;
  }

  const valueWithProtocol = /^https?:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  try {
    return new URL(valueWithProtocol);
  } catch {
    return undefined;
  }
}

export function getSiteUrl(env: SiteUrlEnv = process.env): URL {
  return (
    parsePublicUrl(env.NEXT_PUBLIC_SITE_URL) ??
    parsePublicUrl(env.VERCEL_PROJECT_PRODUCTION_URL) ??
    parsePublicUrl(env.VERCEL_URL) ??
    localSiteUrl
  );
}
