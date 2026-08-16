import { PlatformTemplateSettings } from '../../types';

export class TemplateRollbackManager {
  public static canRollback(settings: PlatformTemplateSettings): boolean {
    return Boolean(settings.previous_template_id);
  }

  public static getRollbackTarget(settings: PlatformTemplateSettings): string | null {
    return settings.previous_template_id || null;
  }
}
