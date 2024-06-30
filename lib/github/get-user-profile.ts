export default async function getUserProfile(access_token: string) {
  const userProfileData = await (
    await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      cache: "no-cache",
    })
  ).json();
  return userProfileData;
}
