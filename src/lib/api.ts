const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('spedire_token');
export const setAuthToken = (token: string) => localStorage.setItem('spedire_token', token);
export const removeAuthToken = () => localStorage.removeItem('spedire_token');

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: token } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const raw = await response.text();
  let data: any = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    if (!response.ok) {
      throw new Error('No se pudo completar la operación. Intenta nuevamente más tarde.');
    }
    throw new Error('Respuesta inválida del servidor.');
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || 'No se pudo completar la operación. Intenta nuevamente más tarde.');
  }
  return data;
}

export const api = {
  login: (data: any) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  registerPoint: (data: any) => fetchAPI('/point/register', { method: 'POST', body: JSON.stringify(data) }),
  getPointMe: () => fetchAPI('/point/me'),
  getPointProducts: () => fetchAPI('/point/products'),
  getPointOperations: () => fetchAPI('/point/operations'),
  createPointOperation: (data: any) => fetchAPI('/point/operations', { method: 'POST', body: JSON.stringify(data) }),
  getProfile: () => fetchAPI('/user/profile'),
  updateUserSettings: (data: any) => fetchAPI('/user/settings', { method: 'POST', body: JSON.stringify(data) }),
  getStores: () => fetchAPI('/stores'),
  getEcartConnectUrl: () => fetchAPI('/integrations/ecart/connect-url'),
  saveEcartCallback: (data: any) => fetchAPI('/integrations/ecart/callback', { method: 'POST', body: JSON.stringify(data) }),
  syncStoreOrders: (storeId: string, limit = 100) => fetchAPI(`/stores/${storeId}/sync`, { method: 'POST', body: JSON.stringify({ limit }) }),
  getStoreOrders: (storeId: string, status = '') => fetchAPI(`/stores/${storeId}/orders${status ? `?status=${encodeURIComponent(status)}` : ''}`),
  updateStoreOrderAddress: (orderId: string, data: any) => fetchAPI(`/store-orders/${orderId}/address`, { method: 'POST', body: JSON.stringify(data) }),
  getStoreOrderPrefill: (orderId: string) => fetchAPI(`/store-orders/${orderId}/prefill`),
  linkStoreOrderShipment: (orderId: string, shipmentId: string) => fetchAPI(`/store-orders/${orderId}/link-shipment`, { method: 'POST', body: JSON.stringify({ shipmentId }) }),
  pushStoreOrderFulfillment: (orderId: string) => fetchAPI(`/store-orders/${orderId}/push-fulfillment`, { method: 'POST' }),
  disconnectStore: (storeId: string) => fetchAPI(`/stores/${storeId}/disconnect`, { method: 'POST' }),
  quoteShipment: (data: any) => fetchAPI('/shipments/quote', { method: 'POST', body: JSON.stringify(data) }),
  createShipment: (data: any) => fetchAPI('/shipments', { method: 'POST', body: JSON.stringify(data) }),
  getSpedireProDropOffPoints: (data: any) => fetchAPI('/spedirepro/drop-off-points', { method: 'POST', body: JSON.stringify(data) }),
  getDropOffPoints: (data: any) => fetchAPI('/spedirepro/drop-off-points', { method: 'POST', body: JSON.stringify(data) }),
  getShipments: () => fetchAPI('/shipments'),
  updateShipment: (id: string, data: any) => fetchAPI(`/shipments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  finalizeShipment: (id: string) => fetchAPI(`/shipments/${id}/finalize`, { method: 'POST' }),
  retryShipmentLabel: (id: string) => fetchAPI(`/shipments/${id}/retry-label`, { method: 'POST' }),
  requestShipmentCancellation: (id: string, data: any = {}) => fetchAPI(`/shipments/${id}/cancel-request`, { method: 'POST', body: JSON.stringify(data) }),
  trackShipment: (code: string) => fetchAPI(`/tracking/${code}`),
  getAdminStats: () => fetchAPI('/admin/stats'),
  getAdminClients: () => fetchAPI('/admin/clients'),
  getAdminClient: (id: string) => fetchAPI(`/admin/clients/${id}`),
  adminRechargeClient: (id: string, data: any) => fetchAPI(`/admin/clients/${id}/recharge`, { method: 'POST', body: JSON.stringify(data) }),
  adminClearClientDebt: (id: string, data: any = {}) => fetchAPI(`/admin/clients/${id}/clear-debt`, { method: 'POST', body: JSON.stringify(data) }),
  adminUpdateClientStatus: (id: string, status: string) => fetchAPI(`/admin/clients/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  adminRemoveClientCard: (id: string) => fetchAPI(`/admin/clients/${id}/remove-card`, { method: 'POST' }),
  adminImpersonateClient: (id: string) => fetchAPI(`/admin/clients/${id}/impersonate`, { method: 'POST' }),
  getAdminShipments: () => fetchAPI('/admin/shipments'),
  updateAdminShipmentStatus: (id: string, status: string) => fetchAPI(`/admin/shipments/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),
  updateAdminShipment: (id: string, data: any) => fetchAPI(`/admin/shipments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  uploadAdminRouteSheet: (id: string, data: { fileData: string; fileName: string }) => fetchAPI(`/admin/shipments/${id}/route-sheet`, { method: 'POST', body: JSON.stringify(data) }),
  deleteAdminRouteSheet: (id: string) => fetchAPI(`/admin/shipments/${id}/route-sheet`, { method: 'DELETE' }),
  archiveAdminShipment: (id: string, isArchived?: boolean) => fetchAPI(`/admin/shipments/${id}/archive`, { method: 'PUT', body: JSON.stringify({ isArchived }) }),
  deleteAdminShipment: (id: string) => fetchAPI(`/admin/shipments/${id}`, { method: 'DELETE' }),
  adminBulkArchiveShipments: (ids: string[], isArchived?: boolean) => fetchAPI('/admin/shipments/bulk/archive', { method: 'POST', body: JSON.stringify({ ids, isArchived }) }),
  adminBulkDeleteShipments: (ids: string[]) => fetchAPI('/admin/shipments/bulk/delete', { method: 'POST', body: JSON.stringify({ ids }) }),
  adminBulkUpdateStatus: (ids: string[], status: string, statusLabel?: string) => fetchAPI('/admin/shipments/bulk/status', { method: 'POST', body: JSON.stringify({ ids, status, statusLabel }) }),
  getAdminProviders: () => fetchAPI('/admin/providers'),
  updateAdminProviders: (providers: any) => fetchAPI('/admin/providers', { method: 'POST', body: JSON.stringify({ providers }) }),
  testAdminProvider: (providerCode: string) => fetchAPI('/admin/providers/test', { method: 'POST', body: JSON.stringify({ providerCode }) }),
  createEasyPostWebhook: (data: any = {}) => fetchAPI('/admin/easypost/webhook/create', { method: 'POST', body: JSON.stringify(data) }),
  polarCreateWebhook: () => fetchAPI('/admin/polar/webhook/create', { method: 'POST' }),
  polarListWebhooks: () => fetchAPI('/admin/polar/webhooks'),
  getAdminSettings: () => fetchAPI('/admin/settings'),
  getAdminEcartStatus: () => fetchAPI('/admin/integrations/ecartapi/status'),
  testAdminEcart: () => fetchAPI('/admin/integrations/ecartapi/test', { method: 'POST' }),
  getSpedireProIntegration: () => fetchAPI('/admin/spedirepro/integration'),
  getSpedireProWallet: (params: any = {}) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') query.set(key, String(value));
    });
    return fetchAPI(`/admin/spedirepro/wallet${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getSpedireProWebhookHistory: (params: any = {}) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') query.set(key, String(value));
    });
    return fetchAPI(`/admin/spedirepro/webhook-history${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getSpedireProLocalWebhooks: () => fetchAPI('/admin/spedirepro/local-webhooks'),
  getAdminLabelCronStatus: () => fetchAPI('/admin/label-cron/status'),
  runAdminLabelCron: (limit = 10) => fetchAPI('/admin/label-cron/run', { method: 'POST', body: JSON.stringify({ limit }) }),
  getAdminStatusCronStatus: () => fetchAPI('/admin/status-cron/status'),
  runAdminStatusCron: (limit = 25) => fetchAPI('/admin/status-cron/run', { method: 'POST', body: JSON.stringify({ limit }) }),
  getAdminEmailLogs: () => fetchAPI('/admin/email/logs'),
  sendAdminTestEmail: (data: any) => fetchAPI('/admin/email/test', { method: 'POST', body: JSON.stringify(data) }),
  getPublicBrand: () => fetchAPI('/public/brand'),
  updateAdminSettings: (data: any) => fetchAPI('/admin/settings', { method: 'POST', body: JSON.stringify(data?.apiKeys || data?.brand ? data : { apiKeys: data }) }),
  getAdminPlans: () => fetchAPI('/admin/plans'),
  updateAdminPlans: (plans: any) => fetchAPI('/admin/plans', { method: 'POST', body: JSON.stringify({ plans }) }),
  getPolarStatus: () => fetchAPI('/admin/polar/status'),
  createPolarWebhook: () => fetchAPI('/admin/polar/webhook/create', { method: 'POST' }),
  createPayPalWebhook: () => fetchAPI('/admin/paypal/webhook/create', { method: 'POST' }),
  syncPayPalProducts: () => fetchAPI('/admin/paypal/products/sync', { method: 'POST' }),
  getPaymentIntegration: (provider: string) => fetchAPI(`/admin/payment-integrations/${encodeURIComponent(provider)}`),
  savePaymentIntegration: (provider: string, settings: any) => fetchAPI(`/admin/payment-integrations/${encodeURIComponent(provider)}/settings`, { method: 'POST', body: JSON.stringify(settings) }),
  getApiDocsContent: (lang = 'en') => fetchAPI(`/docs/content?lang=${encodeURIComponent(lang)}`),
  getApiDocsOpenApi: () => fetch('/api/docs/openapi.json').then(r => r.json()),
  getApiDocsOpenAiTools: () => fetch('/api/docs/openai-tools.json').then(r => r.json()),
  getSubscriptionPlans: () => fetchAPI('/subscription-plans'),
  subscribeWithWallet: (planId: string) => fetchAPI('/subscriptions/wallet/activate', { method: 'POST', body: JSON.stringify({ planId }) }),
  paypalSubscriptionCheckout: (planId: string) => fetchAPI('/subscriptions/paypal/create-checkout', { method: 'POST', body: JSON.stringify({ planId }) }),
  polarSubscriptionCheckout: (planId: string) => fetchAPI('/subscriptions/polar/plan-checkout', { method: 'POST', body: JSON.stringify({ planId }) }),
  syncPolarProducts: () => fetchAPI('/admin/polar/products/sync', { method: 'POST' }),
  getAdminReports: (params: any = {}) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') query.set(key, String(value));
    });
    return fetchAPI(`/admin/reports${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getUserReports: () => fetchAPI('/user/reports'),
  paypalGetConfig: () => fetchAPI('/payments/paypal/config'),
  paypalCreateOrder: (amount: number) => fetchAPI('/payments/paypal/create-order', { method: 'POST', body: JSON.stringify({ amount }) }),
  paypalCaptureOrder: (orderId: string) => fetchAPI('/payments/paypal/capture-order', { method: 'POST', body: JSON.stringify({ orderId }) }),
  polarCreateCheckout: () => fetchAPI('/subscriptions/polar/create-checkout', { method: 'POST' }),
  getTickets: () => fetchAPI('/tickets'),
  createTicket: (data: any) => fetchAPI('/tickets', { method: 'POST', body: JSON.stringify(data) }),
  replyTicket: (id: string, data: any) => fetchAPI(`/tickets/${id}/reply`, { method: 'POST', body: JSON.stringify(data) }),
  aiSuggestReply: (id: string, lang: string) => fetchAPI(`/tickets/${id}/ai-suggest`, { method: 'POST', body: JSON.stringify({ lang }) }),
  resolveTicket: (id: string) => fetchAPI(`/tickets/${id}/resolve`, { method: 'POST' }),
  adminApproveCancellation: (id: string, data: any = {}) => fetchAPI(`/admin/cancellation-requests/${id}/approve`, { method: 'POST', body: JSON.stringify(data) }),
  adminRejectCancellation: (id: string, data: any = {}) => fetchAPI(`/admin/cancellation-requests/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),
  aiChat: (message: string, history: any[], lang: string) => fetchAPI('/ai/chat', { method: 'POST', body: JSON.stringify({ message, history, lang }) }),
  copilotMessage: (message: string, history: any[], lang: string, conversationId?: string) => fetchAPI('/copilot/message', { method: 'POST', body: JSON.stringify({ message, history, lang, conversationId }) }),
  getAdminAISettings: () => fetchAPI('/admin/ai-settings'),
  updateAdminAISettings: (ai: any) => fetchAPI('/admin/ai-settings', { method: 'PUT', body: JSON.stringify(ai) }),
  getCurrencies: () => fetchAPI('/currencies'),
  connectCard: (data: any) => fetchAPI('/user/connect-card', { method: 'POST', body: JSON.stringify(data) }),
  connectPaypal: (data: any) => fetchAPI('/user/connect-paypal', { method: 'POST', body: JSON.stringify(data) }),
  rechargeWallet: (amount: number) => fetchAPI('/user/recharge', { method: 'POST', body: JSON.stringify({ amount }) }),
  getAddressBook: (type?: string) => fetchAPI('/address-book' + (type ? `?type=${type}` : '')),
  saveAddressBook: (data: any) => fetchAPI('/address-book', { method: 'POST', body: JSON.stringify(data) }),
  deleteAddressBook: (id: string) => fetchAPI(`/address-book/${id}`, { method: 'DELETE' }),

  getBankAccounts: (params: any = {}) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') query.set(key, String(value));
    });
    return fetchAPI(`/bank-accounts${query.toString() ? `?${query.toString()}` : ''}`);
  },
  submitWalletTransferProof: (data: any) => fetchAPI('/user/wallet/transfer-proof', { method: 'POST', body: JSON.stringify(data) }),
  getAdminBankAccounts: () => fetchAPI('/admin/bank-accounts'),
  saveAdminBankAccount: (data: any) => fetchAPI('/admin/bank-accounts', { method: 'POST', body: JSON.stringify(data) }),
  getAdminPaymentReceipts: (status: string = 'all') => fetchAPI(`/admin/payment-receipts?status=${encodeURIComponent(status)}`),
  approveAdminPaymentReceipt: (id: string, data: any = {}) => fetchAPI(`/admin/payment-receipts/${id}/approve`, { method: 'POST', body: JSON.stringify(data) }),
  rejectAdminPaymentReceipt: (id: string, data: any = {}) => fetchAPI(`/admin/payment-receipts/${id}/reject`, { method: 'POST', body: JSON.stringify(data) }),
  adminAdjustClientBalance: (id: string, data: any) => fetchAPI(`/admin/clients/${id}/adjust-balance`, { method: 'POST', body: JSON.stringify(data) }),
  getAdminTeam: () => fetchAPI('/admin/team'),
  createAdminTeamMember: (data: any) => fetchAPI('/admin/team', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminTeamMember: (id: string, data: any) => fetchAPI(`/admin/team/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminTeamMember: (id: string) => fetchAPI(`/admin/team/${id}`, { method: 'DELETE' }),
  getAdminPoints: () => fetchAPI('/admin/points'),
  updateAdminPointStatus: (id: string, status: string, reviewNote = '') => fetchAPI(`/admin/points/${id}/status`, { method: 'POST', body: JSON.stringify({ status, reviewNote }) }),
  getAdminPointProducts: () => fetchAPI('/admin/point-products'),
  updateAdminPointProduct: (id: string, data: any) => fetchAPI(`/admin/point-products/${id}`, { method: 'POST', body: JSON.stringify(data) }),
  getAdminRoles: () => fetchAPI('/admin/roles'),
  createAdminRole: (data: any) => fetchAPI('/admin/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateAdminRole: (id: string, data: any) => fetchAPI(`/admin/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAdminRole: (id: string) => fetchAPI(`/admin/roles/${id}`, { method: 'DELETE' }),
  adminGetAuditLogs: (params: any = {}) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') query.set(key, String(value));
    });
    return fetchAPI(`/admin/audit-logs${query.toString() ? `?${query.toString()}` : ''}`);
  },
  adminGetAuditSummary: () => fetchAPI('/admin/audit-logs/summary'),
  adminGetCacheStats: () => fetchAPI('/admin/cache/stats'),
  adminFlushCache: () => fetchAPI('/admin/cache/flush', { method: 'POST' }),
  adminGetQueueStats: () => fetchAPI('/admin/queue/stats'),
  getPublicPoints: (params: any = {}) => {
    const query = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && String(value).trim() !== '') query.set(key, String(value));
    });
    return fetchAPI(`/public/points${query.toString() ? `?${query.toString()}` : ''}`);
  },
  getPublicPointExecutive: (id: string) => fetchAPI(`/public/point-executive/${encodeURIComponent(id)}`),
  assignAdminPointExecutive: (pointId: string, executiveUserId: string | null) => fetchAPI(`/admin/points/${pointId}/executive`, { method: 'POST', body: JSON.stringify({ executiveUserId }) }),
  getAdminPointChat: (pointId: string) => fetchAPI(`/admin/points/${pointId}/chat/messages`),
  sendAdminPointChat: (pointId: string, message: string) => fetchAPI(`/admin/points/${pointId}/chat/messages`, { method: 'POST', body: JSON.stringify({ message }) }),
  getPointChat: () => fetchAPI('/point/chat/messages'),
  sendPointChat: (message: string) => fetchAPI('/point/chat/messages', { method: 'POST', body: JSON.stringify({ message }) }),
};
