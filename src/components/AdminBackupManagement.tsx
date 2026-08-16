import React, { useState, useEffect, useRef } from 'react';
import {
  FileArchive,
  Download,
  UploadCloud,
  Upload,
  Database,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
  ShoppingBag,
  Store,
  Grid,
  PackageCheck,
  Users,
  Settings,
  Sparkles,
  History,
  Trash2,
  Check,
  X,
  FileCode,
  FileJson,
  Eye,
  ArrowRight,
  ShieldAlert,
  HardDrive,
  Activity,
} from 'lucide-react';
import JSZip from 'jszip';
import { AppData } from '../types';

interface AdminBackupManagementProps {
  data: AppData;
  onUpdateData: (newData: AppData) => Promise<void>;
  onRestoreBackup: (jsonString: string) => Promise<boolean>;
  showToast: (message: string, type?: 'success' | 'error') => void;
  getAdminHeaders?: () => Record<string, string>;
}

interface ServerSnapshot {
  id: string;
  filename: string;
  label: string;
  sizeKb: number;
  recordCount: number;
  createdAt: string;
}

interface IntegrityReport {
  healthy: boolean;
  issueCount: number;
  issues: string[];
  suggestions: string[];
  counts: Record<string, number>;
}

export const AdminBackupManagement: React.FC<AdminBackupManagementProps> = ({
  data,
  onUpdateData,
  onRestoreBackup,
  showToast,
  getAdminHeaders = () => {
    const token = localStorage.getItem('ezmart_admin_token') || '';
    const pin = localStorage.getItem('ezmart_admin_pin') || '';
    return {
      'Content-Type': 'application/json',
      'X-Admin-Pin': pin,
      'Authorization': `Bearer ${token}`,
    };
  },
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'quick' | 'selective' | 'restore' | 'snapshots' | 'diagnostic'>('quick');
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMsg, setProcessingMsg] = useState('');

  // Selective Export state
  const [selectedEntities, setSelectedEntities] = useState<string[]>([
    'products',
    'categories',
    'modules',
    'stores',
    'orders',
    'customers',
    'users',
    'settings',
    'platform_templates',
    'market_categories',
    'banners',
  ]);
  const [includeMediaInZip, setIncludeMediaInZip] = useState(true);
  const [exportFormat, setExportFormat] = useState<'zip' | 'json' | 'sql'>('zip');

  // Restore state
  const [parsedBackup, setParsedBackup] = useState<any | null>(null);
  const [backupManifest, setBackupManifest] = useState<any | null>(null);
  const [restoreMode, setRestoreMode] = useState<'merge' | 'replace'>('merge');
  const [restoreSelectedEntities, setRestoreSelectedEntities] = useState<string[]>([]);
  const [extractedZipImages, setExtractedZipImages] = useState<Map<string, string>>(new Map());
  const [isConfirmingOverwrite, setIsConfirmingOverwrite] = useState(false);
  const [restoreStats, setRestoreStats] = useState<any | null>(null);

  // Snapshots state
  const [snapshots, setSnapshots] = useState<ServerSnapshot[]>([]);
  const [isLoadingSnapshots, setIsLoadingSnapshots] = useState(false);
  const [newSnapshotLabel, setNewSnapshotLabel] = useState('');
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);

  // Diagnostic report state
  const [integrityReport, setIntegrityReport] = useState<IntegrityReport | null>(null);
  const [isScanningIntegrity, setIsScanningIntegrity] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const entityDefinitions = [
    { id: 'products', label: 'Products & Inventory', icon: ShoppingBag, count: data.products?.length || 0, color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/40' },
    { id: 'stores', label: 'Merchant Stores', icon: Store, count: data.stores?.length || 0, color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/40' },
    { id: 'categories', label: 'Categories & Subcategories', icon: Grid, count: data.categories?.length || 0, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40' },
    { id: 'modules', label: 'Modules Configuration', icon: Layers, count: data.modules?.length || 0, color: 'text-purple-500 bg-purple-50 dark:purple-950/40' },
    { id: 'orders', label: 'Orders & Transaction Histories', icon: PackageCheck, count: data.orders?.length || 0, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/40' },
    { id: 'customers', label: 'Customer Profiles', icon: Users, count: data.customers?.length || 0, color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/40' },
    { id: 'users', label: 'Staff Accounts & Roles', icon: ShieldCheck, count: data.users?.length || 0, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/40' },
    { id: 'settings', label: 'Store Settings, PWA & Navigation', icon: Settings, count: 1, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
    { id: 'platform_templates', label: 'Platform Templates & Layouts', icon: Sparkles, count: data.platform_templates?.length || 0, color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/40' },
    { id: 'market_categories', label: 'Market E-Commerce Catalog', icon: ShoppingBag, count: data.market_categories?.length || 0, color: 'text-teal-500 bg-teal-50 dark:bg-teal-950/40' },
    { id: 'banners', label: 'Promotional Banners', icon: Sparkles, count: (data.banners?.length || 0) + (data.market_banners?.length || 0), color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/40' },
    { id: 'audit_logs', label: 'System Security Audit Logs', icon: History, count: data.audit_logs?.length || 0, color: 'text-slate-600 bg-slate-100 dark:bg-slate-800' },
  ];

  // Fetch snapshots on mount
  useEffect(() => {
    fetchSnapshots();
  }, []);

  const fetchSnapshots = async () => {
    setIsLoadingSnapshots(true);
    try {
      const res = await fetch('/api/backup/snapshots', { headers: getAdminHeaders() });
      const json = await res.json();
      if (json.success && Array.isArray(json.snapshots)) {
        setSnapshots(json.snapshots);
      }
    } catch {
      // ignore
    } finally {
      setIsLoadingSnapshots(false);
    }
  };

  const handleToggleEntity = (id: string) => {
    setSelectedEntities((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedEntities(entityDefinitions.map((e) => e.id));
  };

  const handleDeselectAll = () => {
    setSelectedEntities([]);
  };

  // Helper: Strip sensitive secrets before creating client-side files
  const sanitizeClientData = (inputData: any, entitiesToKeep?: string[]) => {
    const cloned = JSON.parse(JSON.stringify(inputData));
    if (cloned.settings) {
      delete cloned.settings.n8n_webhook_secret;
      delete cloned.settings.jwt_secret;
      delete cloned.settings.admin_pin;
      delete cloned.settings.admin_password;
      delete cloned.settings.n8n_encryption_key;
      delete cloned.settings.gemini_api_key;
      delete cloned.settings.db_password;
      delete cloned.settings.database_password;
      delete cloned.settings.api_key;
      delete cloned.settings.whatsapp_secret;
      delete cloned.settings.payment_secret;
    }
    if (cloned.users && Array.isArray(cloned.users)) {
      cloned.users = cloned.users.map((u: any) => {
        const copy = { ...u };
        delete copy.password;
        delete copy.password_hash;
        delete copy.token;
        delete copy.session_token;
        return copy;
      });
    }
    if (cloned.stores && Array.isArray(cloned.stores)) {
      cloned.stores = cloned.stores.map((s: any) => {
        const copy = { ...s };
        delete copy.password;
        if (copy.settings) {
          delete copy.settings.admin_password;
          delete copy.settings.n8n_webhook_secret;
          delete copy.settings.n8n_encryption_key;
        }
        return copy;
      });
    }
    if (cloned.customers && Array.isArray(cloned.customers)) {
      cloned.customers = cloned.customers.map((c: any) => {
        const copy = { ...c };
        delete copy.token;
        delete copy.session_token;
        return copy;
      });
    }
    if (!entitiesToKeep) return cloned;

    const filtered: any = {
      manifest: {
        version: '2.2.0',
        exported_at: new Date().toISOString(),
        entities: entitiesToKeep,
      },
    };
    entitiesToKeep.forEach((key) => {
      if (cloned[key] !== undefined) {
        filtered[key] = cloned[key];
      }
    });
    return filtered;
  };

  // 1. Export ZIP Archive (Full or Selective)
  const handleExportZip = async (isSelective = false) => {
    try {
      setIsProcessing(true);
      setProcessingMsg('Creating compressed ZIP archive with media assets...');
      const zip = new JSZip();

      const entitiesToExport = isSelective ? selectedEntities : entityDefinitions.map((e) => e.id);
      const dataset = sanitizeClientData(data, isSelective ? entitiesToExport : undefined);

      // Extract and bundle media assets if enabled
      if (includeMediaInZip) {
        const imgFolder = zip.folder('images');
        let imgCounter = 1;

        const extractImage = (base64OrUrl: string | undefined, prefix: string): string => {
          if (!base64OrUrl) return '';
          if (base64OrUrl.startsWith('data:image/')) {
            const parts = base64OrUrl.split(',');
            if (parts.length === 2) {
              const match = parts[0].match(/data:image\/(\w+);base64/);
              const ext = match ? match[1] : 'png';
              const filename = `${prefix}_${imgCounter++}.${ext}`;
              imgFolder?.file(filename, parts[1], { base64: true });
              return `images/${filename}`;
            }
          }
          return base64OrUrl;
        };

        const manifestCopy = JSON.parse(JSON.stringify(dataset));

        if (manifestCopy.settings) {
          if (manifestCopy.settings.admin_logo) {
            manifestCopy.settings.admin_logo = extractImage(manifestCopy.settings.admin_logo, 'admin_logo');
          }
          if (manifestCopy.settings.admin_login_banner) {
            manifestCopy.settings.admin_login_banner = extractImage(manifestCopy.settings.admin_login_banner, 'login_banner');
          }
          if (manifestCopy.settings.pwa_icon) {
            manifestCopy.settings.pwa_icon = extractImage(manifestCopy.settings.pwa_icon, 'pwa_icon');
          }
          if (manifestCopy.settings.upi_qr_image) {
            manifestCopy.settings.upi_qr_image = extractImage(manifestCopy.settings.upi_qr_image, 'upi_qr');
          }
        }
        if (manifestCopy.products && Array.isArray(manifestCopy.products)) {
          manifestCopy.products = manifestCopy.products.map((p: any) => ({
            ...p,
            image: extractImage(p.image, `prod_${p.id}`),
          }));
        }
        if (manifestCopy.categories && Array.isArray(manifestCopy.categories)) {
          manifestCopy.categories = manifestCopy.categories.map((c: any) => ({
            ...c,
            image: extractImage(c.image, `cat_${c.id}`),
          }));
        }
        if (manifestCopy.modules && Array.isArray(manifestCopy.modules)) {
          manifestCopy.modules = manifestCopy.modules.map((m: any) => ({
            ...m,
            image: extractImage(m.image, `mod_${m.id}`),
          }));
        }
        if (manifestCopy.stores && Array.isArray(manifestCopy.stores)) {
          manifestCopy.stores = manifestCopy.stores.map((s: any) => ({
            ...s,
            logo: extractImage(s.logo, `store_${s.id}`),
          }));
        }
        if (manifestCopy.banners && Array.isArray(manifestCopy.banners)) {
          manifestCopy.banners = manifestCopy.banners.map((b: any) => ({
            ...b,
            image: extractImage(b.image, `banner_${b.id}`),
          }));
        }
        if (manifestCopy.market_banners && Array.isArray(manifestCopy.market_banners)) {
          manifestCopy.market_banners = manifestCopy.market_banners.map((mb: any) => ({
            ...mb,
            image: extractImage(mb.image, `market_banner_${mb.id}`),
          }));
        }
        if (manifestCopy.market_categories && Array.isArray(manifestCopy.market_categories)) {
          manifestCopy.market_categories = manifestCopy.market_categories.map((mc: any) => ({
            ...mc,
            image: extractImage(mc.image, `market_cat_${mc.id}`),
          }));
        }

        zip.file('database.json', JSON.stringify(manifestCopy, null, 2));
        zip.file('manifest.json', JSON.stringify(manifestCopy, null, 2));
      } else {
        zip.file('database.json', JSON.stringify(dataset, null, 2));
        zip.file(
          'manifest.json',
          JSON.stringify(
            {
              version: '2.2.0',
              exported_at: new Date().toISOString(),
              entities: entitiesToExport,
              include_media: false,
            },
            null,
            2
          )
        );
      }

      // Generate and download
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      const tag = isSelective ? 'selective' : 'complete';
      link.download = `hyperlocal_${tag}_backup_${new Date().toISOString().slice(0, 10)}.zip`;
      link.click();
      URL.revokeObjectURL(url);

      showToast(`Backup archive (.zip) generated and downloaded successfully!`);
    } catch (err: any) {
      showToast(`Export failed: ${err.message}`, 'error');
    } finally {
      setIsProcessing(false);
      setProcessingMsg('');
    }
  };

  // 2. Export JSON File
  const handleExportJson = (isSelective = false) => {
    try {
      const entitiesToExport = isSelective ? selectedEntities : undefined;
      const cleanData = sanitizeClientData(data, entitiesToExport);
      const blob = new Blob([JSON.stringify(cleanData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const tag = isSelective ? 'selective' : 'full';
      link.download = `hyperlocal_${tag}_database_${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('Database JSON backup downloaded successfully!');
    } catch (err: any) {
      showToast('Failed to export JSON: ' + err.message, 'error');
    }
  };

  // 3. Export SQL Schema & Data Dump
  const handleExportSql = async () => {
    try {
      setIsProcessing(true);
      setProcessingMsg('Generating MySQL / phpMyAdmin SQL schema and data dump...');
      const res = await fetch('/api/backup/export', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ entities: selectedEntities, format: 'sql' }),
      });
      const sqlText = await res.text();
      const blob = new Blob([sqlText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `hyperlocal_database_schema_${new Date().toISOString().slice(0, 10)}.sql`;
      link.click();
      URL.revokeObjectURL(url);
      showToast('MySQL schema.sql downloaded successfully!');
    } catch (err: any) {
      showToast('Failed to generate SQL dump: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
      setProcessingMsg('');
    }
  };

  // Handle uploaded file for Restore (ZIP or JSON)
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setProcessingMsg(`Analyzing backup package "${file.name}"...`);

    try {
      if (file.name.endsWith('.zip')) {
        const zip = await JSZip.loadAsync(file);
        const dbFile = zip.file('database.json') || zip.file('manifest.json');
        if (!dbFile) {
          showToast('Invalid ZIP file: No database.json found inside the archive.', 'error');
          setIsProcessing(false);
          return;
        }

        const jsonStr = await dbFile.async('string');
        const parsed = JSON.parse(jsonStr);
        setParsedBackup(parsed);

        // Check for images
        const imgMap = new Map<string, string>();
        const imgFolder = zip.folder('images');
        if (imgFolder) {
          const filePromises: Promise<void>[] = [];
          imgFolder.forEach((relPath, zipEntry) => {
            if (!zipEntry.dir) {
              filePromises.push(
                zipEntry.async('base64').then((b64) => {
                  const ext = relPath.split('.').pop() || 'png';
                  imgMap.set(`images/${relPath}`, `data:image/${ext};base64,${b64}`);
                })
              );
            }
          });
          await Promise.all(filePromises);
        }
        setExtractedZipImages(imgMap);

        const manifestEntry = zip.file('manifest.json');
        if (manifestEntry) {
          try {
            setBackupManifest(JSON.parse(await manifestEntry.async('string')));
          } catch {}
        }

        // Pre-select entities found in the file
        const foundKeys = Object.keys(parsed).filter((k) => Array.isArray(parsed[k]) || k === 'settings');
        setRestoreSelectedEntities(foundKeys);
        showToast('ZIP archive verified! Review details below before applying.', 'success');
        setActiveSubTab('restore');
      } else if (file.name.endsWith('.json')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const content = event.target?.result as string;
            const parsed = JSON.parse(content);
            setParsedBackup(parsed);
            setBackupManifest(parsed.manifest || null);
            const foundKeys = Object.keys(parsed).filter((k) => Array.isArray(parsed[k]) || k === 'settings');
            setRestoreSelectedEntities(foundKeys);
            showToast('JSON backup verified! Review details below before applying.', 'success');
            setActiveSubTab('restore');
          } catch (err: any) {
            showToast('Failed to parse JSON file: ' + err.message, 'error');
          }
        };
        reader.readAsText(file);
      } else {
        showToast('Unsupported file type. Please upload a .zip or .json backup file.', 'error');
      }
    } catch (err: any) {
      showToast('Error reading backup file: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
      setProcessingMsg('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Replaces relative image paths like 'images/prod_1.png' with base64 data URLs extracted from ZIP
  const rehydrateImages = (obj: any, imgMap: Map<string, string>): any => {
    if (!obj || imgMap.size === 0) return obj;
    const cloned = JSON.parse(JSON.stringify(obj));

    const checkAndReplace = (val: any) => {
      if (typeof val === 'string' && imgMap.has(val)) {
        return imgMap.get(val);
      }
      return val;
    };

    if (cloned.products && Array.isArray(cloned.products)) {
      cloned.products = cloned.products.map((p: any) => ({
        ...p,
        image: checkAndReplace(p.image),
      }));
    }
    if (cloned.categories && Array.isArray(cloned.categories)) {
      cloned.categories = cloned.categories.map((c: any) => ({
        ...c,
        image: checkAndReplace(c.image),
      }));
    }
    if (cloned.modules && Array.isArray(cloned.modules)) {
      cloned.modules = cloned.modules.map((m: any) => ({
        ...m,
        image: checkAndReplace(m.image),
      }));
    }
    if (cloned.stores && Array.isArray(cloned.stores)) {
      cloned.stores = cloned.stores.map((s: any) => ({
        ...s,
        logo: checkAndReplace(s.logo),
      }));
    }
    if (cloned.banners && Array.isArray(cloned.banners)) {
      cloned.banners = cloned.banners.map((b: any) => ({
        ...b,
        image: checkAndReplace(b.image),
      }));
    }
    if (cloned.market_banners && Array.isArray(cloned.market_banners)) {
      cloned.market_banners = cloned.market_banners.map((mb: any) => ({
        ...mb,
        image: checkAndReplace(mb.image),
      }));
    }
    if (cloned.market_categories && Array.isArray(cloned.market_categories)) {
      cloned.market_categories = cloned.market_categories.map((mc: any) => ({
        ...mc,
        image: checkAndReplace(mc.image),
      }));
    }
    if (cloned.settings) {
      if (cloned.settings.admin_logo) {
        cloned.settings.admin_logo = checkAndReplace(cloned.settings.admin_logo);
      }
      if (cloned.settings.admin_login_banner) {
        cloned.settings.admin_login_banner = checkAndReplace(cloned.settings.admin_login_banner);
      }
      if (cloned.settings.pwa_icon) {
        cloned.settings.pwa_icon = checkAndReplace(cloned.settings.pwa_icon);
      }
      if (cloned.settings.upi_qr_image) {
        cloned.settings.upi_qr_image = checkAndReplace(cloned.settings.upi_qr_image);
      }
    }
    return cloned;
  };

  // Execute Restore operation
  const handleExecuteRestore = async () => {
    if (!parsedBackup) return;

    setIsProcessing(true);
    setProcessingMsg(`Executing ${restoreMode === 'merge' ? 'Smart Merge' : 'Full Overwrite'} database restore...`);

    try {
      const rehydrated = rehydrateImages(parsedBackup, extractedZipImages);

      const res = await fetch('/api/backup/restore', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({
          backup: rehydrated,
          mode: restoreMode,
          entities: restoreSelectedEntities.length > 0 ? restoreSelectedEntities : undefined,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setRestoreStats(json.stats || {});
        if (json.data) {
          await onUpdateData(json.data);
        }
        showToast(json.message || 'Database restore completed successfully!', 'success');
        setIsConfirmingOverwrite(false);
        setParsedBackup(null);
        fetchSnapshots();
      } else {
        showToast(json.error || 'Restore failed', 'error');
      }
    } catch (err: any) {
      showToast('Restore request failed: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
      setProcessingMsg('');
    }
  };

  // Create Snapshot Checkpoint
  const handleCreateSnapshot = async () => {
    if (!newSnapshotLabel.trim()) {
      showToast('Please enter a label for the snapshot checkpoint', 'error');
      return;
    }

    setIsCreatingSnapshot(true);
    try {
      const res = await fetch('/api/backup/snapshots/create', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ label: newSnapshotLabel.trim() }),
      });
      const json = await res.json();
      if (json.success) {
        showToast(json.message || 'Snapshot created successfully!', 'success');
        setNewSnapshotLabel('');
        fetchSnapshots();
      } else {
        showToast(json.error || 'Failed to create snapshot', 'error');
      }
    } catch (err: any) {
      showToast('Network error creating snapshot: ' + err.message, 'error');
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  // Restore from Server Snapshot
  const handleRestoreSnapshot = async (snapshotId: string, mode: 'merge' | 'replace') => {
    if (!confirm(`Are you sure you want to restore the system from snapshot "${snapshotId}" (${mode.toUpperCase()} mode)?`)) {
      return;
    }

    setIsProcessing(true);
    setProcessingMsg(`Restoring system snapshot "${snapshotId}"...`);

    try {
      const res = await fetch('/api/backup/snapshots/restore', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify({ snapshotId, mode }),
      });
      const json = await res.json();
      if (json.success) {
        if (json.data) {
          await onUpdateData(json.data);
        }
        showToast(json.message || 'Snapshot successfully restored!', 'success');
        fetchSnapshots();
      } else {
        showToast(json.error || 'Snapshot restore failed', 'error');
      }
    } catch (err: any) {
      showToast('Error restoring snapshot: ' + err.message, 'error');
    } finally {
      setIsProcessing(false);
      setProcessingMsg('');
    }
  };

  // Delete Server Snapshot
  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (!confirm(`Are you sure you want to permanently delete snapshot "${snapshotId}"?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/backup/snapshots/${encodeURIComponent(snapshotId)}`, {
        method: 'DELETE',
        headers: getAdminHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        showToast('Snapshot deleted successfully.');
        fetchSnapshots();
      } else {
        showToast(json.error || 'Failed to delete snapshot', 'error');
      }
    } catch (err: any) {
      showToast('Error deleting snapshot: ' + err.message, 'error');
    }
  };

  // Run Integrity Scan
  const handleScanIntegrity = async () => {
    setIsScanningIntegrity(true);
    try {
      const res = await fetch('/api/backup/verify-integrity', {
        method: 'POST',
        headers: getAdminHeaders(),
      });
      const json = await res.json();
      if (json.success) {
        setIntegrityReport(json);
        showToast(json.healthy ? 'Integrity scan passed with 0 issues!' : `Scan completed: ${json.issueCount} issue(s) detected.`);
      } else {
        showToast(json.error || 'Diagnostic scan failed', 'error');
      }
    } catch (err: any) {
      showToast('Diagnostic scan error: ' + err.message, 'error');
    } finally {
      setIsScanningIntegrity(false);
    }
  };

  const totalItemsCount =
    (data.products?.length || 0) +
    (data.stores?.length || 0) +
    (data.categories?.length || 0) +
    (data.orders?.length || 0) +
    (data.modules?.length || 0) +
    (data.customers?.length || 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Card */}
      <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300">
              Super Admin Level
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> 256-Bit Encrypted
            </span>
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <FileArchive className="w-6 h-6 text-orange-500" />
            Full Power Backup, Import & Export System
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Enterprise database backup manager with selective entity filtering, ZIP media bundling, phpMyAdmin SQL generator, and instant server snapshots.
          </p>
        </div>

        {/* Top Quick Status Pill Stats */}
        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-2xl text-center">
            <span className="text-[10px] font-black text-slate-400 block uppercase">Total Records</span>
            <span className="text-sm font-black text-slate-900 dark:text-white">{totalItemsCount}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-2xl text-center">
            <span className="text-[10px] font-black text-slate-400 block uppercase">Products</span>
            <span className="text-sm font-black text-orange-500">{data.products?.length || 0}</span>
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3.5 py-2 rounded-2xl text-center">
            <span className="text-[10px] font-black text-slate-400 block uppercase">Stores</span>
            <span className="text-sm font-black text-blue-500">{data.stores?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'quick', label: '1-Click Full Bundles', icon: Download },
          { id: 'selective', label: 'Selective Export Wizard', icon: Sparkles },
          { id: 'restore', label: 'Restore & Import Engine', icon: UploadCloud, badge: parsedBackup ? 'Active' : undefined },
          { id: 'snapshots', label: 'Server Snapshots & Rollback', icon: History, badge: snapshots.length || undefined },
          { id: 'diagnostic', label: 'Integrity & Health Check', icon: Activity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md'
                  : 'bg-white dark:bg-slate-850 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-orange-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-orange-500 text-white">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Processing Loader Indicator */}
      {isProcessing && (
        <div className="p-4 rounded-2xl bg-orange-50 dark:bg-orange-950/60 border border-orange-200 dark:border-orange-800 text-orange-900 dark:text-orange-200 text-xs font-bold flex items-center gap-3 animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin text-orange-600" />
          <span>{processingMsg || 'Processing data operation, please wait...'}</span>
        </div>
      )}

      {/* ---------------- SUB-TAB 1: 1-CLICK FULL BUNDLES ---------------- */}
      {activeSubTab === 'quick' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Complete ZIP Archive */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <FileArchive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Complete ZIP Archive</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Generates an all-in-one compressed `.zip` archive containing <code className="text-orange-600 font-mono">database.json</code>, manifest checksums, and a dedicated <code className="text-orange-600 font-mono">images/</code> directory with all uploaded merchant, product, and category image files.
                </p>
              </div>

              <div className="pt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Bundled Media Files:</span>
                  <span className="font-bold text-emerald-600">Included (Extracted)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target Environment:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Production / Portable</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleExportZip(false)}
              disabled={isProcessing}
              className="w-full bg-[#FF7A00] hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all cursor-pointer disabled:opacity-50 text-xs"
            >
              <Download className="w-4 h-4" /> Download Complete ZIP
            </button>
          </div>

          {/* Card 2: Database JSON Snapshot */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-100 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400 flex items-center justify-center">
                <FileJson className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">Database JSON File</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Exports lightweight, standard JSON dataset formatted for fast programmatic ingestion, API integrations, and instant single-file restore across development or staging servers.
                </p>
              </div>

              <div className="pt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Structure Type:</span>
                  <span className="font-bold text-cyan-600">Pure JSON Schema</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Secrets Stripped:</span>
                  <span className="font-bold text-emerald-600">Yes (Zero Leakage)</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleExportJson(false)}
              disabled={isProcessing}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/20 transition-all cursor-pointer disabled:opacity-50 text-xs"
            >
              <Download className="w-4 h-4" /> Download Database JSON
            </button>
          </div>

          {/* Card 3: MySQL / phpMyAdmin SQL Dump */}
          <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white">phpMyAdmin MySQL SQL Dump</h3>
                <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                  Generates an executable <code className="text-indigo-600 font-mono">schema.sql</code> script with <code className="text-indigo-600 font-mono">CREATE TABLE</code> structures and batch <code className="text-indigo-600 font-mono">INSERT</code> statements ready for direct import in phpMyAdmin or cloud MySQL databases.
                </p>
              </div>

              <div className="pt-2 space-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center justify-between">
                  <span>Engine:</span>
                  <span className="font-bold text-indigo-600">InnoDB / UTF8MB4</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Compatibility:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">MySQL 8.0+ / MariaDB</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleExportSql}
              disabled={isProcessing}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all cursor-pointer disabled:opacity-50 text-xs"
            >
              <Download className="w-4 h-4" /> Download MySQL SQL Dump
            </button>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 2: SELECTIVE EXPORT WIZARD ---------------- */}
      {activeSubTab === 'selective' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                Granular Entity Selector
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Choose exactly which tables and modules you want to bundle into your export archive.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSelectAll}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Select All
              </button>
              <button
                onClick={handleDeselectAll}
                className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs cursor-pointer"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Grid of Entity Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {entityDefinitions.map((ent) => {
              const isSelected = selectedEntities.includes(ent.id);
              const Icon = ent.icon;
              return (
                <div
                  key={ent.id}
                  onClick={() => handleToggleEntity(ent.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'border-orange-500 bg-orange-50/50 dark:bg-orange-950/20 shadow-xs'
                      : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ent.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-slate-900 dark:text-white block">{ent.label}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {ent.count} {ent.count === 1 ? 'record' : 'records'}
                      </span>
                    </div>
                  </div>

                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors shrink-0 ${
                      isSelected ? 'bg-orange-500 text-white' : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Export Options & Actions */}
          <div className="bg-slate-50 dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Export Configuration & Format
            </h4>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Media Toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-bold text-slate-800 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={includeMediaInZip}
                  onChange={(e) => setIncludeMediaInZip(e.target.checked)}
                  className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500"
                />
                <span>Extract & Bundle Uploaded Images into ZIP folder</span>
              </label>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => handleExportJson(true)}
                  disabled={selectedEntities.length === 0 || isProcessing}
                  className="px-4 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <FileJson className="w-4 h-4" /> Export Selected JSON
                </button>
                <button
                  onClick={() => handleExportZip(true)}
                  disabled={selectedEntities.length === 0 || isProcessing}
                  className="px-5 py-2.5 rounded-xl bg-[#FF7A00] hover:bg-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                >
                  <FileArchive className="w-4 h-4" /> Export Selected ZIP ({selectedEntities.length})
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 3: RESTORE & IMPORT ENGINE ---------------- */}
      {activeSubTab === 'restore' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <UploadCloud className="w-5 h-5 text-emerald-500" />
              Smart Restore & Import Engine
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Upload a <code className="font-mono text-emerald-600">.zip</code> or <code className="font-mono text-emerald-600">.json</code> archive to inspect, merge, or cleanly replace database tables.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 p-8 rounded-3xl text-center cursor-pointer transition-all bg-slate-50/50 dark:bg-slate-900/50 group"
          >
            <div className="w-14 h-14 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-7 h-7" />
            </div>
            <h4 className="font-black text-slate-900 dark:text-white text-sm">
              Click to Select or Drop Backup Archive (.zip / .json)
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Supports full application archives with extracted image assets & JSON manifests.
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip,.json"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* Inspected Backup Package Details */}
          {parsedBackup && (
            <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-emerald-500/50 space-y-5 animate-in fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-900 dark:text-white text-sm flex items-center gap-2">
                      Backup Archive Verified & Ready
                    </h4>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Version: {backupManifest?.version || '2.2.0'} • Source: {backupManifest?.platform || 'Hyperlocal Commerce'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setParsedBackup(null);
                    setExtractedZipImages(new Map());
                  }}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer self-start sm:self-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Record Breakdown Table */}
              <div className="space-y-3">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Included Entities Breakdown
                </h5>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Products</span>
                    <span className="text-base font-black text-orange-500">{parsedBackup.products?.length || 0}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Stores</span>
                    <span className="text-base font-black text-blue-500">{parsedBackup.stores?.length || 0}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Categories</span>
                    <span className="text-base font-black text-emerald-500">{parsedBackup.categories?.length || 0}</span>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-slate-400 text-[10px] block uppercase font-bold">Extracted Images</span>
                    <span className="text-base font-black text-purple-500">{extractedZipImages.size} files</span>
                  </div>
                </div>
              </div>

              {/* Restore Mode Selector */}
              <div className="space-y-3 pt-2">
                <h5 className="text-xs font-black uppercase tracking-wider text-slate-400">
                  Choose Restore Strategy
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div
                    onClick={() => setRestoreMode('merge')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      restoreMode === 'merge'
                        ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Smart Merge / Upsert (Safe & Recommended)
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Updates existing records matching IDs and inserts new records without erasing unmentioned database items.
                    </p>
                  </div>

                  <div
                    onClick={() => setRestoreMode('replace')}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                      restoreMode === 'replace'
                        ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/40'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center gap-2 font-black text-slate-900 dark:text-white text-xs mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      Clean Replace / Overwrite Database
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                      Wipes current selected tables and restores the exact snapshot state from this backup file.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Automatic safety rollback checkpoint will be captured before applying.
                </div>

                <button
                  onClick={handleExecuteRestore}
                  disabled={isProcessing}
                  className={`w-full sm:w-auto px-6 py-3 rounded-2xl text-white font-black text-xs transition-all shadow-lg cursor-pointer flex items-center justify-center gap-2 ${
                    restoreMode === 'replace'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
                      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Execute {restoreMode === 'replace' ? 'Full Overwrite' : 'Smart Merge'} Restore</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ---------------- SUB-TAB 4: SERVER SNAPSHOTS & ROLLBACK ---------------- */}
      {activeSubTab === 'snapshots' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-500" />
                Server-Side Instant Snapshots
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Create named system checkpoints stored securely on the server for instant 1-click rollback.
              </p>
            </div>

            <button
              onClick={fetchSnapshots}
              disabled={isLoadingSnapshots}
              className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 cursor-pointer self-start sm:self-center"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSnapshots ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Create New Checkpoint Bar */}
          <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              value={newSnapshotLabel}
              onChange={(e) => setNewSnapshotLabel(e.target.value)}
              placeholder="Enter snapshot label (e.g., Before Ramadan Bulk Catalog Update)..."
              className="flex-1 bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={handleCreateSnapshot}
              disabled={isCreatingSnapshot || !newSnapshotLabel.trim()}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{isCreatingSnapshot ? 'Creating...' : 'Save Checkpoint'}</span>
            </button>
          </div>

          {/* Snapshots List */}
          <div className="space-y-3">
            {snapshots.length > 0 ? (
              snapshots.map((snap) => (
                <div
                  key={snap.id}
                  className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-2">
                        {snap.label}
                        <span className="text-[10px] font-bold text-slate-400 px-1.5 py-0.2 rounded bg-slate-200/60 dark:bg-slate-800">
                          {snap.sizeKb} KB
                        </span>
                      </h4>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {new Date(snap.createdAt).toLocaleString()} • {snap.recordCount} total records
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleRestoreSnapshot(snap.id, 'merge')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300 text-xs font-black border border-emerald-200 dark:border-emerald-800 cursor-pointer"
                    >
                      Smart Merge
                    </button>
                    <button
                      onClick={() => handleRestoreSnapshot(snap.id, 'replace')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-black border border-rose-200 dark:border-rose-800 cursor-pointer"
                    >
                      Full Restore
                    </button>
                    <button
                      onClick={() => handleDeleteSnapshot(snap.id)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 cursor-pointer"
                      title="Delete Snapshot"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                <History className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">No saved server snapshots found yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Use the input above to create a timestamped checkpoint before major bulk changes.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ---------------- SUB-TAB 5: INTEGRITY & HEALTH CHECK ---------------- */}
      {activeSubTab === 'diagnostic' && (
        <div className="bg-white dark:bg-slate-850 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-500" />
                Database Integrity Diagnostic Tool
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Performs a relational cross-check across products, categories, stores, orders, and customer records to verify consistency.
              </p>
            </div>

            <button
              onClick={handleScanIntegrity}
              disabled={isScanningIntegrity}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Activity className={`w-4 h-4 ${isScanningIntegrity ? 'animate-spin' : ''}`} />
              <span>{isScanningIntegrity ? 'Scanning...' : 'Run Integrity Scan'}</span>
            </button>
          </div>

          {integrityReport ? (
            <div className="space-y-4 animate-in fade-in">
              <div
                className={`p-5 rounded-2xl border flex items-start gap-3.5 ${
                  integrityReport.healthy
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                }`}
              >
                {integrityReport.healthy ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <h4 className="text-sm font-black">
                    {integrityReport.healthy
                      ? 'All Database Foreign Keys & Relational Tables Healthy!'
                      : `${integrityReport.issueCount} Inconsistencies Detected`}
                  </h4>
                  <p className="text-xs opacity-90">
                    {integrityReport.healthy
                      ? 'No orphan products, broken category links, or missing store bindings found.'
                      : 'Review the issue log below to take corrective action or restore from a verified snapshot.'}
                  </p>
                </div>
              </div>

              {integrityReport.issues && integrityReport.issues.length > 0 && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
                  <h5 className="text-xs font-black uppercase text-slate-400">Detected Issues</h5>
                  <ul className="list-disc list-inside text-xs text-slate-700 dark:text-slate-300 space-y-1">
                    {integrityReport.issues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <Activity className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">Click "Run Integrity Scan" above to verify all database references and tables.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
