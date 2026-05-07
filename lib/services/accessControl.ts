import { readFileSync } from 'fs';
import { join } from 'path';
import type { AccessScope } from '../types';

interface AccessConfig {
  matrix: AccessScope[];
  principle: string;
}

let configCache: AccessConfig | null = null;

function loadConfig(): AccessConfig {
  if (configCache) return configCache;
  const filePath = join(process.cwd(), 'data', 'access_scope.json');
  const raw = readFileSync(filePath, 'utf-8');
  configCache = JSON.parse(raw) as AccessConfig;
  return configCache;
}

const inMemoryAuditLog: Array<{ accessedBy: string; role: string; resource: string; timestamp: string }> = [];

export class AccessControlService {
  verify(role: string, resource: string): boolean {
    const config = loadConfig();
    const scope = config.matrix.find(m => m.role === role);
    if (!scope) return false;
    return scope.canSee.some(item => item.includes(resource));
  }

  audit(accessedBy: string, role: string, resource: string): void {
    inMemoryAuditLog.push({
      accessedBy,
      role,
      resource,
      timestamp: new Date().toISOString(),
    });
  }

  getMatrix(): AccessConfig {
    return loadConfig();
  }
}

export const accessControlService = new AccessControlService();
