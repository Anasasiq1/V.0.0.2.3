import React from 'react';
import { PlatformTemplate, PlatformTemplateSettings, TemplateAuditLog } from '../../types';
import { HMQModernTemplate } from '../templates/HMQModernTemplate';
import { HMQClassicTemplate } from '../templates/HMQClassicTemplate';
import { BlinkitStyleTemplate } from '../templates/BlinkitStyleTemplate';
import { HMQVintageTemplate } from '../templates/HMQVintageTemplate';
import { HMQUltraPremiumTemplate } from '../templates/HMQUltraPremiumTemplate';

export class TemplateRegistry {
  private static templateComponents: Record<string, React.FC<any>> = {
    'hm-q-modern': HMQModernTemplate,
    'hm-q-classic': HMQClassicTemplate,
    'blinkit-template': BlinkitStyleTemplate,
    'vintage-template': HMQVintageTemplate,
    'ultra-premium-template': HMQUltraPremiumTemplate,
  };

  public static getTemplateComponent(templateId: string): React.FC<any> {
    return this.templateComponents[templateId] || HMQModernTemplate;
  }

  public static registerTemplateComponent(templateId: string, component: React.FC<any>): void {
    this.templateComponents[templateId] = component;
  }
}

