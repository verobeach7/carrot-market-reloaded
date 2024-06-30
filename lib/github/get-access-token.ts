export default async function getAccessToken(code: string) {
  const accessTokenParams = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    client_secret: process.env.GITHUB_CLIENT_SECRET!,
    code,
  }).toString();
  const accessTokenUrl = `https://github.com/login/oauth/access_token?${accessTokenParams}`;
  // Post Request: header를 추가하여 response를 json으로 받을 수 있음
  const accessTokenData = await (
    await fetch(accessTokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
      },
    })
  ).json();
  return accessTokenData;
}
