export function getSuperAdminKeysPattern(superAdminId: string) {
  return `SUPER_ADMIN:${superAdminId}*`;
}

export function getSuperAdminAccessTokenKey(
  superAdminId: string,
  token: string,
) {
  return `SUPER_ADMIN:${superAdminId}:ACCESS_TOKEN:${token}`;
}

export function getSuperAdminRefreshTokenKey(
  superAdminId: string,
  token: string,
) {
  return `SUPER_ADMIN:${superAdminId}:REFRESH_TOKEN:${token}`;
}

export function getTenantAdminKeysPattern(
  tenantId: string,
  tenantAdminId: string,
) {
  return `TENANT:${tenantId}:TENANT_ADMIN:${tenantAdminId}*`;
}

export function getTenantAdminAccessTokenKey(
  tenantId: string,
  tenantAdminId: string,
  token: string,
) {
  return `TENANT:${tenantId}:TENANT_ADMIN:${tenantAdminId}:ACCESS_TOKEN:${token}`;
}

export function getTenantAdminRefreshTokenKey(
  tenantId: string,
  tenantAdminId: string,
  token: string,
) {
  return `TENANT:${tenantId}:TENANT_ADMIN:${tenantAdminId}:REFRESH_TOKEN:${token}`;
}

export function getOfficeUserKeysPattern(
  tenantId: string,
  officeUserId: string,
) {
  return `TENANT:${tenantId}:OFFICE_USER:${officeUserId}*`;
}

export function getOfficeUserAccessTokenKey(
  tenantId: string,
  officeUserId: string,
  token: string,
) {
  return `TENANT:${tenantId}:OFFICE_USER:${officeUserId}:ACCESS_TOKEN:${token}`;
}

export function getOfficeUserRefreshTokenKey(
  tenantId: string,
  officeUserId: string,
  token: string,
) {
  return `TENANT:${tenantId}:OFFICE_USER:${officeUserId}:REFRESH_TOKEN:${token}`;
}
