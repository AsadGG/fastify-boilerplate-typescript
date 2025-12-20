export function getUserKeysPattern(userId: string) {
  return `USER:${userId}*`;
}

export function getUserAccessTokenKey(userId: string, token: string) {
  return `USER:${userId}:ACCESS_TOKEN:${token}`;
}

export function getUserRefreshTokenKey(userId: string, token: string) {
  return `USER:${userId}:REFRESH_TOKEN:${token}`;
}
