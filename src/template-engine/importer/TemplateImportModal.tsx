import React, { useState } from 'react';
import { PlatformTemplate } from '../../types';
import { TemplateValidator, ValidationResult } from '../core/TemplateValidator';
import { Upload, FileCheck, AlertTriangle, CheckCircle, X, ShieldAlert } from 'lucide-react';

interface TemplateImportModalProps {
  onClose: () => void;
  onImportSuccess: (template: PlatformTemplate) => void;
}

export const TemplateImportModal: React.FC<TemplateImportModalProps> = ({ onClose, onImportSuccess }) => {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  const sampleTemplatePackage = {
    id: 'food-marketplace-template',
    name: 'Food & Dining Marketplace',
    version: '1.0.0',
    engineVersion: '1.0',
    author: 'HM-Q Design Lab',
    description: 'High-conversion restaurant & food delivery experience with dish cards, dietary filters (Veg/Non-Veg), and order tracking.',
    type: 'platform',
    responsive: true,
    mobile: true,
    tablet: true,
    desktop: true,
    tags: ['food', 'restaurant', 'dining', 'imported'],
    previewImage: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&auto=format&fit=crop&q=80',
  };

  const handleValidate = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const res = TemplateValidator.validateManifest(parsed);
      setValidationResult(res);
    } catch (err: any) {
      setValidationResult({
        valid: false,
        errors: [`JSON Parsing Error: ${err.message}`],
        warnings: [],
      });
    }
  };

  const handleLoadSamplePackage = () => {
    const formatted = JSON.stringify(sampleTemplatePackage, null, 2);
    setJsonInput(formatted);
    const res = TemplateValidator.validateManifest(sampleTemplatePackage);
    setValidationResult(res);
  };

  const handleInstall = () => {
    if (!validationResult || !validationResult.valid || !validationResult.manifest) return;

    setIsInstalling(true);

    setTimeout(() => {
      const newTemplate: PlatformTemplate = {
        id: validationResult.manifest!.id,
        manifest: validationResult.manifest!,
        status: 'Installed',
        installed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      onImportSuccess(newTemplate);
      setIsInstalling(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative flex flex-col gap-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Import Platform Template Package
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Upload or paste template package manifest JSON
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button to load sample */}
        <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200 dark:border-slate-700/60">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Testing import system? Load sample platform template:
          </span>
          <button
            onClick={handleLoadSamplePackage}
            className="text-xs font-extrabold bg-slate-900 text-white dark:bg-white dark:text-slate-900 px-3 py-1.5 rounded-xl hover:opacity-90 transition-opacity"
          >
            Load Sample Package
          </button>
        </div>

        {/* Code Input Area */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
            Package Manifest JSON Specification:
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => {
              setJsonInput(e.target.value);
              setValidationResult(null);
            }}
            placeholder='Paste template manifest JSON here e.g. { "id": "zepto-style", "name": "Zepto Quick Commerce", "version": "1.0.0", "type": "platform", ... }'
            rows={8}
            className="w-full bg-slate-900 text-emerald-400 font-mono text-xs p-3 rounded-2xl border border-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Validation Result Box */}
        {validationResult && (
          <div
            className={`p-4 rounded-2xl border text-xs flex flex-col gap-2 ${
              validationResult.valid
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2 font-black text-sm">
              {validationResult.valid ? (
                <>
                  <CheckCircle className="w-5 h-5 text-emerald-600 fill-current" />
                  <span>Validation Passed — Ready for Installation</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-5 h-5 text-rose-600 fill-current" />
                  <span>Validation Failed</span>
                </>
              )}
            </div>

            {validationResult.errors.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 font-medium">
                {validationResult.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}

            {validationResult.valid && validationResult.manifest && (
              <div className="mt-1 pt-2 border-t border-emerald-200 dark:border-emerald-800/60 font-medium">
                <p>
                  <strong>Template ID:</strong> {validationResult.manifest.id}
                </p>
                <p>
                  <strong>Template Name:</strong> {validationResult.manifest.name} (v{validationResult.manifest.version})
                </p>
                <p>
                  <strong>Description:</strong> {validationResult.manifest.description}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Bottom Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={handleValidate}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs hover:bg-slate-300 transition-colors"
          >
            Validate Manifest
          </button>
          <button
            disabled={!validationResult || !validationResult.valid || isInstalling}
            onClick={handleInstall}
            className={`px-5 py-2 rounded-xl text-xs font-black shadow-lg transition-all ${
              validationResult && validationResult.valid && !isInstalling
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white cursor-pointer'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isInstalling ? 'Installing Template...' : 'Install Platform Template'}
          </button>
        </div>
      </div>
    </div>
  );
};
