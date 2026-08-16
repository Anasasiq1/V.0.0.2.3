import { PlatformTemplate, PlatformTemplateSettings } from '../../types';

export class TemplateVersioning {
  public static createVersionSnapshot(template: PlatformTemplate): string {
    return `${template.id}-v${template.manifest.version}-${Date.now()}`;
  }
}
