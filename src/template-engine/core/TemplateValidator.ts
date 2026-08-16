import { PlatformTemplateManifest } from '../../types';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  manifest?: PlatformTemplateManifest;
}

export class TemplateValidator {
  public static validateManifest(rawManifest: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rawManifest) {
      return { valid: false, errors: ['Manifest file is missing or invalid JSON.'], warnings: [] };
    }

    if (!rawManifest.id || typeof rawManifest.id !== 'string') {
      errors.push('Manifest error: "id" field is required and must be a string.');
    } else if (!/^[a-z0-9-]+$/.test(rawManifest.id)) {
      errors.push('Manifest error: "id" must contain only lowercase alphanumeric characters and hyphens.');
    }

    if (!rawManifest.name || typeof rawManifest.name !== 'string') {
      errors.push('Manifest error: "name" field is required.');
    }

    if (!rawManifest.version || typeof rawManifest.version !== 'string') {
      errors.push('Manifest error: "version" field is required (e.g. "1.0.0").');
    }

    if (!rawManifest.engineVersion) {
      warnings.push('Warning: "engineVersion" not specified, defaulting to "1.0".');
    }

    if (rawManifest.type !== 'platform') {
      errors.push('Manifest error: "type" must be strictly set to "platform".');
    }

    if (errors.length > 0) {
      return { valid: false, errors, warnings };
    }

    const manifest: PlatformTemplateManifest = {
      id: rawManifest.id,
      name: rawManifest.name,
      version: rawManifest.version,
      engineVersion: rawManifest.engineVersion || '1.0',
      author: rawManifest.author || 'Custom Template Author',
      description: rawManifest.description || 'Imported platform template',
      type: 'platform',
      responsive: Boolean(rawManifest.responsive ?? true),
      mobile: Boolean(rawManifest.mobile ?? true),
      tablet: Boolean(rawManifest.tablet ?? true),
      desktop: Boolean(rawManifest.desktop ?? true),
      previewImage: rawManifest.previewImage || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&auto=format&fit=crop&q=80',
      tags: Array.isArray(rawManifest.tags) ? rawManifest.tags : ['imported'],
    };

    return { valid: true, errors: [], warnings, manifest };
  }
}
