import React, { useState } from 'react';
import { AppData, PlatformTemplate, PlatformTemplateSettings, TemplateAuditLog } from '../types';
import { TemplatePreviewModal } from '../template-engine/preview/TemplatePreviewModal';
import { TemplateImportModal } from '../template-engine/importer/TemplateImportModal';
import { Layout, Sparkles, CheckCircle2, RotateCcw, Upload, Eye, ShieldCheck, History, ArrowRight } from 'lucide-react';

interface TemplateEngineAdminProps {
  appData: AppData;
  onUpdateAppData: (updated: AppData) => void;
}

export const TemplateEngineAdmin: React.FC<TemplateEngineAdminProps> = ({ appData, onUpdateAppData }) => {
  const [templates, setTemplates] = useState<PlatformTemplate[]>(
    appData.platform_templates || []
  );
  const [settings, setSettings] = useState<PlatformTemplateSettings>(
    appData.platform_template_settings || {
      active_template_id: 'hm-q-modern',
      previous_template_id: null,
      updated_by: 'superadmin',
      updated_at: new Date().toISOString(),
    }
  );
  const [auditLogs, setAuditLogs] = useState<TemplateAuditLog[]>(
    appData.template_audit_logs || []
  );

  const [previewTemplate, setPreviewTemplate] = useState<PlatformTemplate | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const activeTemplate = templates.find((t) => t.id === settings.active_template_id) || templates[0];

  const handleActivateTemplate = async (templateId: string) => {
    try {
      const res = await fetch('/api/platform/templates/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, adminUsername: 'superadmin' }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
        setSettings(data.settings);
        if (data.audit_logs) setAuditLogs(data.audit_logs);

        // Update global AppData state
        onUpdateAppData({
          ...appData,
          platform_templates: data.templates,
          platform_template_settings: data.settings,
        });

        setStatusMessage(`Successfully activated platform template "${templateId}".`);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to activate template:', err);
    }
  };

  const handleRollback = async () => {
    if (!settings.previous_template_id) return;
    try {
      const res = await fetch('/api/platform/templates/rollback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminUsername: 'superadmin' }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
        setSettings(data.settings);

        onUpdateAppData({
          ...appData,
          platform_templates: data.templates,
          platform_template_settings: data.settings,
        });

        setStatusMessage(`Rolled back platform template successfully.`);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to rollback template:', err);
    }
  };

  const handleImportSuccess = async (importedTemplate: PlatformTemplate) => {
    try {
      const res = await fetch('/api/platform/templates/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: importedTemplate }),
      });
      const data = await res.json();
      if (data.success) {
        setTemplates(data.templates);
        onUpdateAppData({
          ...appData,
          platform_templates: data.templates,
        });
        setStatusMessage(`Imported platform template package "${importedTemplate.manifest.name}".`);
        setTimeout(() => setStatusMessage(null), 4000);
      }
    } catch (err) {
      console.error('Failed to import template package:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Platform Template Engine Architecture
              </span>
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">Platform Experience & Layout Engine</h1>
            <p className="text-xs text-slate-300 font-medium max-w-xl mt-1 leading-relaxed">
              Control the overall visual/product presentation of the platform. Store Templates remain 100% independent and isolated from global template changes.
            </p>
          </div>

          <button
            onClick={() => setIsImportModalOpen(true)}
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-5 py-2.5 rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all transform hover:scale-[1.02] cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>+ Import Template Package</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 p-3 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* ACTIVE PLATFORM TEMPLATE HIGHLIGHT */}
      {activeTemplate && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500/80 p-6 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="bg-emerald-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Active Platform Template
              </span>
              <span className="text-xs font-bold text-slate-400">
                Updated by: {settings.updated_by}
              </span>
            </div>

            {settings.previous_template_id && (
              <button
                onClick={handleRollback}
                className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 transition-colors"
                title={`Rollback to ${settings.previous_template_id}`}
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-500" />
                <span>Rollback Template</span>
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shrink-0 bg-slate-100">
              <img
                src={activeTemplate.manifest.previewImage}
                alt={activeTemplate.manifest.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-2 flex-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                {activeTemplate.manifest.name}
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  v{activeTemplate.manifest.version}
                </span>
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
                {activeTemplate.manifest.description}
              </p>

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {activeTemplate.manifest.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 uppercase tracking-wide"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setPreviewTemplate(activeTemplate)}
              className="bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-extrabold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 hover:opacity-90 transition-opacity self-end md:self-center shrink-0 cursor-pointer"
            >
              <Eye className="w-4 h-4" />
              <span>Preview Live Sandbox</span>
            </button>
          </div>
        </div>
      )}

      {/* INSTALLED PLATFORM TEMPLATES GRID */}
      <div>
        <h2 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
          Available Installed Platform Templates ({templates.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const isActive = tpl.id === settings.active_template_id;
            return (
              <div
                key={tpl.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl border p-5 shadow-sm transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-emerald-500 dark:border-emerald-500/80 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="relative h-32 rounded-2xl overflow-hidden mb-3 bg-slate-100 dark:bg-slate-800">
                    <img
                      src={tpl.manifest.previewImage}
                      alt={tpl.manifest.name}
                      className="w-full h-full object-cover"
                    />
                    {isActive ? (
                      <span className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-md">
                        Active
                      </span>
                    ) : (
                      <span className="absolute top-2 right-2 bg-slate-900/80 text-white text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-md">
                        Installed
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                    <span>{tpl.manifest.name}</span>
                    <span className="text-[10px] font-bold text-slate-400">v{tpl.manifest.version}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 leading-snug line-clamp-2">
                    {tpl.manifest.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setPreviewTemplate(tpl)}
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>

                  {!isActive ? (
                    <button
                      onClick={() => handleActivateTemplate(tpl.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-xl shadow-sm transition-all cursor-pointer"
                    >
                      Apply Template
                    </button>
                  ) : (
                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Active
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AUDIT LOG TRAIL */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            Template Activation & Audit Trail
          </h2>
          <span className="text-xs text-slate-400 font-medium">Reversible Switch Record</span>
        </div>

        <div className="space-y-2">
          {auditLogs.length === 0 ? (
            <p className="text-xs text-slate-400 font-medium">No template switches recorded yet.</p>
          ) : (
            auditLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
                    <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[10px]">
                      [{log.action}]
                    </span>
                    <span>{log.template_name}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">{log.details}</p>
                </div>
                <div className="text-right text-[10px] text-slate-400 font-mono">
                  <div>By: {log.admin}</div>
                  <div>{new Date(log.timestamp).toLocaleString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modals */}
      {previewTemplate && (
        <TemplatePreviewModal
          template={previewTemplate}
          appData={appData}
          isActive={previewTemplate.id === settings.active_template_id}
          onClose={() => setPreviewTemplate(null)}
          onActivate={handleActivateTemplate}
        />
      )}

      {isImportModalOpen && (
        <TemplateImportModal
          onClose={() => setIsImportModalOpen(false)}
          onImportSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
};
