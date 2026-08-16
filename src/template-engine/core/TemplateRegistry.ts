import React from 'react';
import { PlatformTemplate, PlatformTemplateSettings, TemplateAuditLog } from '../../types';
import { HMQModernTemplate } from '../templates/HMQModernTemplate';
import { HMQClassicTemplate } from '../templates/HMQClassicTemplate';
import { BlinkitStyleTemplate } from '../templates/BlinkitStyleTemplate';

export class TemplateRegistry {
  private static templateComponents: Record<string, React.FC<any>> = {
    'hm-q-modern': HMQModernTemplate,
    'hm-q-classic': HMQClassicTemplate,
    'blinkit-template': BlinkitStyleTemplate,
  };

  public static getTemplateComponent(templateId: string): React.FC<any> {
    return this.templateComponents[templateId] || HMQModernTemplate;
  }

  public static registerTemplateComponent(templateId: string, component: React.FC<any>): void {
    this.templateComponents[templateId] = component;
  }
}
