import React, { useState } from 'react';
import {
  Key,
  Code2,
  Webhook,
  Smartphone,
  Copy,
  Check,
  Plus,
  Trash2,
  RefreshCw,
  Shield,
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
} from 'lucide-react';
import { ApiKey, ApiClientApp, WebhookSubscription, WebhookDeliveryLog, WebhookEvent } from '../types';

interface DeveloperApiManagementProps {
  apiKeys?: ApiKey[];
  apiClients?: ApiClientApp[];
  webhookSubscriptions?: WebhookSubscription[];
  webhookLogs?: WebhookDeliveryLog[];
  onUpdateData: (updater: (prev: any) => any) => Promise<void>;
  theme?: 'light' | 'dark';
}

export const DeveloperApiManagement: React.FC<DeveloperApiManagementProps> = ({
  apiKeys = [],
  apiClients = [],
  webhookSubscriptions = [],
  webhookLogs = [],
  onUpdateData,
  theme = 'light',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'keys' | 'clients' | 'webhooks' | 'docs'>('overview');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // New Key Modal State
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyClient, setNewKeyClient] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'production' | 'test'>('production');
  const [newKeyRateLimit, setNewKeyRateLimit] = useState(600);
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'read:products',
    'read:orders',
    'write:orders',
  ]);
  const [generatedSecret, setGeneratedSecret] = useState<string | null>(null);

  // New App Client Modal State
  const [showNewClientModal, setShowNewClientModal] = useState(false);
  const [newAppName, setNewAppName] = useState('');
  const [newClientType, setNewClientType] = useState<any>('customer_mobile_app');
  const [newClientPlatform, setNewClientPlatform] = useState<any>('flutter');
  const [newBundleId, setNewBundleId] = useState('');

  // New Webhook Modal State
  const [showNewWebhookModal, setShowNewWebhookModal] = useState(false);
  const [webhookName, setWebhookName] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<WebhookEvent[]>(['order.created', 'order.delivered']);
  const [testingWebhookId, setTestingWebhookId] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ id: string; success: boolean; message: string } | null>(null);

  const availableScopes = [
    { id: 'read:products', label: 'Read Products & Inventory' },
    { id: 'write:products', label: 'Create & Update Products' },
    { id: 'read:orders', label: 'Read Orders & Status' },
    { id: 'write:orders', label: 'Place & Modify Orders' },
    { id: 'read:stores', label: 'Read Store Profiles' },
    { id: 'write:stores', label: 'Modify Store Config' },
    { id: 'delivery:manage', label: 'Delivery Rider Fleet & Assignment' },
    { id: 'pos:manage', label: 'POS Terminal Checkout' },
    { id: 'webhooks:manage', label: 'Webhook Management' },
    { id: 'admin:all', label: 'Full Super Admin Access' },
  ];

  const allWebhookEvents: { id: WebhookEvent; label: string }[] = [
    { id: 'order.created', label: 'order.created (Customer placed order)' },
    { id: 'order.accepted', label: 'order.accepted (Merchant accepted)' },
    { id: 'order.ready', label: 'order.ready (Packed & ready for pickup)' },
    { id: 'order.assigned', label: 'order.assigned (Assigned to rider)' },
    { id: 'order.picked_up', label: 'order.picked_up (Rider picked up)' },
    { id: 'order.delivered', label: 'order.delivered (Delivered to customer)' },
    { id: 'order.cancelled', label: 'order.cancelled (Order cancelled)' },
    { id: 'payment.success', label: 'payment.success (UPI / Payment verified)' },
    { id: 'product.created', label: 'product.created (Catalog change)' },
  ];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleCreateApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName || !newKeyClient) return;

    try {
      const resp = await fetch('/api/v1/developer/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName,
          client_name: newKeyClient,
          environment: newKeyEnv,
          scopes: selectedScopes,
          rate_limit_rpm: newKeyRateLimit,
        }),
      });
      const res = await resp.json();
      if (res.success && res.key) {
        setGeneratedSecret(res.plain_text_secret);
        await onUpdateData((prev: any) => ({
          ...prev,
          api_keys: [res.key, ...(prev.api_keys || [])],
        }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Connected applications will immediately lose access.')) return;
    try {
      await fetch(`/api/v1/developer/keys/${id}`, { method: 'DELETE' });
      await onUpdateData((prev: any) => ({
        ...prev,
        api_keys: (prev.api_keys || []).map((k: any) => (k.id === id ? { ...k, status: 'revoked' } : k)),
      }));
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppName) return;

    try {
      const resp = await fetch('/api/v1/developer/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_name: newAppName,
          client_type: newClientType,
          platform: newClientPlatform,
          bundle_id: newBundleId,
        }),
      });
      const res = await resp.json();
      if (res.success && res.client) {
        await onUpdateData((prev: any) => ({
          ...prev,
          api_clients: [...(prev.api_clients || []), res.client],
        }));
        setShowNewClientModal(false);
        setNewAppName('');
        setNewBundleId('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!webhookName || !webhookUrl) return;

    try {
      const resp = await fetch('/api/v1/developer/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: webhookName,
          target_url: webhookUrl,
          events: webhookEvents,
        }),
      });
      const res = await resp.json();
      if (res.success && res.subscription) {
        await onUpdateData((prev: any) => ({
          ...prev,
          webhook_subscriptions: [...(prev.webhook_subscriptions || []), res.subscription],
        }));
        setShowNewWebhookModal(false);
        setWebhookName('');
        setWebhookUrl('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTestWebhook = async (subId: string) => {
    setTestingWebhookId(subId);
    setTestResult(null);
    try {
      const resp = await fetch(`/api/v1/developer/webhooks/${subId}/test`, { method: 'POST' });
      const res = await resp.json();
      setTestResult({
        id: subId,
        success: res.success,
        message: res.message || res.error || 'Test completed',
      });
    } catch (err: any) {
      setTestResult({
        id: subId,
        success: false,
        message: `Network error: ${err.message}`,
      });
    } finally {
      setTestingWebhookId(null);
    }
  };

  const totalRequests = apiKeys.reduce((acc, k) => acc + (k.total_requests || 0), 0);
  const activeKeysCount = apiKeys.filter((k) => k.status === 'active').length;

  return (
    <div className="space-y-6">
      {/* Header & Sub-Navigation */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Code2 className="w-6 h-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">
                  Developer & API Platform
                </h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  AI Studio Commerce OS Unified REST Gateway (/api/v1/*), API Key Auth, App Registry & Webhooks
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                activeSubTab === 'overview'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              Overview & Metrics
            </button>
            <button
              onClick={() => setActiveSubTab('keys')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                activeSubTab === 'keys'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              API Keys ({apiKeys.length})
            </button>
            <button
              onClick={() => setActiveSubTab('clients')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                activeSubTab === 'clients'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              App Registry ({apiClients.length})
            </button>
            <button
              onClick={() => setActiveSubTab('webhooks')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                activeSubTab === 'webhooks'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              Webhooks & Logs ({webhookSubscriptions.length})
            </button>
            <button
              onClick={() => setActiveSubTab('docs')}
              className={`px-3.5 py-2 text-xs font-semibold rounded-xl whitespace-nowrap transition-colors ${
                activeSubTab === 'docs'
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200'
              }`}
            >
              API Docs & Playground
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: OVERVIEW & METRICS */}
      {activeSubTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Total API Calls</span>
                <Code2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
                {totalRequests.toLocaleString()}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Across all production & test keys</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Active API Keys</span>
                <Key className="w-4 h-4 text-blue-500" />
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
                {activeKeysCount}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">{apiKeys.length} total keys provisioned</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Connected App Clients</span>
                <Smartphone className="w-4 h-4 text-purple-500" />
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
                {apiClients.length}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Flutter, React Native & POS</p>
            </div>

            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500">Webhook Subscriptions</span>
                <Webhook className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white mt-2">
                {webhookSubscriptions.length}
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">Signed payload event triggers</p>
            </div>
          </div>

          {/* Architecture Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 text-white rounded-2xl p-6 border border-zinc-800">
            <div className="max-w-3xl">
              <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-3">
                COMMERCE OS ARCHITECTURE
              </span>
              <h3 className="text-lg font-bold">Unified Headless Commerce Engine & BFF API Layer</h3>
              <p className="text-xs text-zinc-300 mt-2 leading-relaxed">
                HM-Q serves as an all-in-one Commerce Operating System. Every feature in the admin panel and storefront is backed by standardized <code className="text-emerald-400 bg-black/40 px-1.5 py-0.5 rounded">/api/v1/*</code> endpoints. Mobile apps (Flutter / React Native), Delivery Riders, In-Store POS, and external third-party software interact with this exact same secure contract.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800">
                <div className="p-3 bg-zinc-800/60 rounded-xl">
                  <span className="text-[11px] text-zinc-400">Authentication</span>
                  <p className="text-xs font-bold text-white mt-0.5">API Key / JWT Bearer</p>
                </div>
                <div className="p-3 bg-zinc-800/60 rounded-xl">
                  <span className="text-[11px] text-zinc-400">Base Gateway</span>
                  <p className="text-xs font-bold text-emerald-400 mt-0.5">/api/v1/*</p>
                </div>
                <div className="p-3 bg-zinc-800/60 rounded-xl">
                  <span className="text-[11px] text-zinc-400">Payload Signing</span>
                  <p className="text-xs font-bold text-white mt-0.5">HMAC-SHA256</p>
                </div>
                <div className="p-3 bg-zinc-800/60 rounded-xl">
                  <span className="text-[11px] text-zinc-400">Default Rate Limit</span>
                  <p className="text-xs font-bold text-white mt-0.5">600 RPM / Key</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: API KEYS */}
      {activeSubTab === 'keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Production & Staging API Keys</h3>
              <p className="text-xs text-zinc-500">Keys are used to authenticate server-to-server and mobile client requests.</p>
            </div>
            <button
              onClick={() => {
                setShowNewKeyModal(true);
                setGeneratedSecret(null);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Generate New API Key
            </button>
          </div>

          {/* Key List */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden divide-y divide-zinc-200 dark:divide-zinc-800">
            {apiKeys.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No API keys generated yet. Click "Generate New API Key" above.
              </div>
            ) : (
              apiKeys.map((key) => (
                <div key={key.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-zinc-900 dark:text-white">{key.name}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          key.environment === 'production'
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                        }`}
                      >
                        {key.environment.toUpperCase()}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          key.status === 'active'
                            ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                            : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        }`}
                      >
                        {key.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-500">
                      Client: <span className="text-zinc-700 dark:text-zinc-300 font-medium">{key.client_name}</span> &bull; Rate Limit:{' '}
                      <span className="font-semibold">{key.rate_limit_rpm} RPM</span>
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      <code className="text-xs font-mono bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-zinc-800 dark:text-zinc-200">
                        {key.key_prefix}
                      </code>
                      <button
                        onClick={() => handleCopy(key.key_prefix, key.id)}
                        className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        title="Copy Key Identifier"
                      >
                        {copiedKeyId === key.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {key.scopes.map((s) => (
                        <span
                          key={s}
                          className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right text-xs">
                      <p className="font-bold text-zinc-900 dark:text-white">{(key.total_requests || 0).toLocaleString()} reqs</p>
                      <p className="text-[11px] text-zinc-400">Last used: {key.last_used_at || 'Never'}</p>
                    </div>

                    {key.status === 'active' && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 rounded-lg text-xs font-semibold transition-colors"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 3: APP REGISTRY */}
      {activeSubTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Registered Client Applications</h3>
              <p className="text-xs text-zinc-500">Official and third-party apps connected to the Commerce OS backend.</p>
            </div>
            <button
              onClick={() => setShowNewClientModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Register New App
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apiClients.map((client) => (
              <div key={client.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="p-2 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
                    <Smartphone className="w-5 h-5" />
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    {client.status.toUpperCase()}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">{client.app_name}</h4>
                  <p className="text-xs text-zinc-500 capitalize">{client.client_type.replace(/_/g, ' ')} &bull; {client.platform}</p>
                </div>

                <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                  {client.bundle_id && <p><span className="font-semibold text-zinc-700 dark:text-zinc-300">Bundle ID:</span> {client.bundle_id}</p>}
                  <p><span className="font-semibold text-zinc-700 dark:text-zinc-300">Version:</span> {client.version}</p>
                  <p><span className="font-semibold text-zinc-700 dark:text-zinc-300">Registered:</span> {client.created_at}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: WEBHOOKS & LOGS */}
      {activeSubTab === 'webhooks' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Webhook Subscriptions</h3>
              <p className="text-xs text-zinc-500">Dispatch instant JSON events to n8n, WhatsApp gateways, and external ERPs.</p>
            </div>
            <button
              onClick={() => setShowNewWebhookModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Webhook Endpoint
            </button>
          </div>

          {/* Subscriptions List */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl divide-y divide-zinc-200 dark:divide-zinc-800">
            {webhookSubscriptions.map((sub) => (
              <div key={sub.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-zinc-900 dark:text-white">{sub.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs font-mono text-zinc-600 dark:text-zinc-400">{sub.target_url}</p>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    {sub.events.map((ev) => (
                      <span key={ev} className="text-[10px] bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    disabled={testingWebhookId === sub.id}
                    onClick={() => handleTestWebhook(sub.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-zinc-700 dark:text-zinc-300 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {testingWebhookId === sub.id ? 'Sending...' : 'Send Test Ping'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {testResult && (
            <div
              className={`p-4 rounded-xl border text-xs ${
                testResult.success
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200'
              }`}
            >
              <div className="flex items-center gap-2 font-bold">
                {testResult.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {testResult.message}
              </div>
            </div>
          )}

          {/* Delivery Logs */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Recent Webhook Delivery Logs</h4>
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800 text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="p-3 font-semibold">Event</th>
                    <th className="p-3 font-semibold">Status</th>
                    <th className="p-3 font-semibold">Response Time</th>
                    <th className="p-3 font-semibold">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {webhookLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                      <td className="p-3 font-mono font-medium text-zinc-900 dark:text-white">{log.event}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.status_code >= 200 && log.status_code < 300
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          HTTP {log.status_code}
                        </span>
                      </td>
                      <td className="p-3 text-zinc-500">{log.response_time_ms} ms</td>
                      <td className="p-3 text-zinc-400">{log.timestamp}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: DOCS & PLAYGROUND */}
      {activeSubTab === 'docs' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">API Reference & Quick Start</h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Authenticate requests by passing your API key in the <code className="text-emerald-600 dark:text-emerald-400 font-mono">x-api-key</code> header or as a Bearer token in the <code className="text-emerald-600 dark:text-emerald-400 font-mono">Authorization</code> header.
            </p>

            <div className="space-y-3">
              <div className="p-4 bg-zinc-900 text-white rounded-xl font-mono text-xs overflow-x-auto space-y-2">
                <p className="text-zinc-400"># 1. Fetch live product catalog</p>
                <p className="text-emerald-400">
                  curl -X GET "https://yourdomain.com/api/v1/products" \<br />
                  &nbsp;&nbsp;-H "x-api-key: hmq_live_your_secret_key"
                </p>
              </div>

              <div className="p-4 bg-zinc-900 text-white rounded-xl font-mono text-xs overflow-x-auto space-y-2">
                <p className="text-zinc-400"># 2. Create a customer order from mobile app</p>
                <p className="text-emerald-400">
                  curl -X POST "https://yourdomain.com/api/v1/orders" \<br />
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br />
                  &nbsp;&nbsp;-H "x-api-key: hmq_live_your_secret_key" \<br />
                  &nbsp;&nbsp;-d '&#123;"customer_phone":"919876543210","store_id":"STR-10025","items":[&#123;"product_id":"prod-1","quantity":2&#125;]&#125;'
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: GENERATE NEW KEY */}
      {showNewKeyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Generate Developer API Key</h3>

            {generatedSecret ? (
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200">
                    Key Generated Successfully!
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Copy and store this secret securely. For security reasons, you will not be able to view it again.
                  </p>
                  <div className="flex items-center gap-2 pt-2">
                    <code className="text-xs font-mono bg-white dark:bg-zinc-900 px-3 py-2 rounded-lg border border-emerald-200 dark:border-emerald-800 flex-1 break-all">
                      {generatedSecret}
                    </code>
                    <button
                      onClick={() => handleCopy(generatedSecret, 'gen-sec')}
                      className="p-2 bg-emerald-600 text-white rounded-lg text-xs"
                    >
                      {copiedKeyId === 'gen-sec' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowNewKeyModal(false);
                    setGeneratedSecret(null);
                  }}
                  className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-900 rounded-xl text-xs font-bold transition-colors"
                >
                  Done & Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateApiKey} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Key Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Flutter Mobile Storefront"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Client / Consumer Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iOS Customer App"
                    value={newKeyClient}
                    onChange={(e) => setNewKeyClient(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Environment</label>
                    <select
                      value={newKeyEnv}
                      onChange={(e: any) => setNewKeyEnv(e.target.value)}
                      className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                    >
                      <option value="production">Production</option>
                      <option value="test">Test / Sandbox</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Rate Limit (RPM)</label>
                    <input
                      type="number"
                      value={newKeyRateLimit}
                      onChange={(e) => setNewKeyRateLimit(Number(e.target.value))}
                      className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">
                    Assigned API Scopes
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border rounded-xl dark:border-zinc-700">
                    {availableScopes.map((scope) => (
                      <label key={scope.id} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedScopes.includes(scope.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedScopes([...selectedScopes, scope.id]);
                            } else {
                              setSelectedScopes(selectedScopes.filter((s) => s !== scope.id));
                            }
                          }}
                          className="rounded text-emerald-600"
                        />
                        <span className="text-zinc-700 dark:text-zinc-300">{scope.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowNewKeyModal(false)}
                    className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition-colors"
                  >
                    Generate Secret
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL: REGISTER NEW APP */}
      {showNewClientModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Register Client Application</h3>
            <form onSubmit={handleCreateClient} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Application Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HM-Q Delivery Partner"
                  value={newAppName}
                  onChange={(e) => setNewAppName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Client Type</label>
                  <select
                    value={newClientType}
                    onChange={(e: any) => setNewClientType(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="customer_mobile_app">Customer Mobile App</option>
                    <option value="delivery_mobile_app">Delivery Partner App</option>
                    <option value="vendor_mobile_app">Vendor Merchant App</option>
                    <option value="pos_terminal">In-Store POS Terminal</option>
                    <option value="third_party_saas">Third-Party SaaS</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Platform</label>
                  <select
                    value={newClientPlatform}
                    onChange={(e: any) => setNewClientPlatform(e.target.value)}
                    className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                  >
                    <option value="flutter">Flutter</option>
                    <option value="react_native">React Native</option>
                    <option value="ios">Native iOS (Swift)</option>
                    <option value="android">Native Android (Kotlin)</option>
                    <option value="web">Web (React / Next.js)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Bundle ID / Package Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. com.hmq.rider.app"
                  value={newBundleId}
                  onChange={(e) => setNewBundleId(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewClientModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Register Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD WEBHOOK */}
      {showNewWebhookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Add Webhook Subscription</h3>
            <form onSubmit={handleCreateWebhook} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Subscription Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. n8n Order Workflow Trigger"
                  value={webhookName}
                  onChange={(e) => setWebhookName(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">Target Webhook URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://n8n.yourdomain.com/webhook/orders"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full mt-1 px-3 py-2 text-xs border rounded-xl dark:bg-zinc-800 dark:border-zinc-700"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-2 block">Events to Trigger</label>
                <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 border rounded-xl dark:border-zinc-700">
                  {allWebhookEvents.map((ev) => (
                    <label key={ev.id} className="flex items-center gap-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={webhookEvents.includes(ev.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setWebhookEvents([...webhookEvents, ev.id]);
                          } else {
                            setWebhookEvents(webhookEvents.filter((event) => event !== ev.id));
                          }
                        }}
                        className="rounded text-emerald-600"
                      />
                      <span className="text-zinc-700 dark:text-zinc-300">{ev.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewWebhookModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  Save Webhook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
