/**
 * Halkbank NestPay 3D Secure Payment Integration
 * Hash Version 3 - SHA512 with alphabetically sorted parameters
 */

import crypto from 'crypto';

// Halkbank NestPay Configuration
const HALKBANK_CONFIG = {
  clientId: process.env.HALKBANK_CLIENT_ID || '',
  storeKey: process.env.HALKBANK_STORE_KEY || '',
  apiUser: process.env.HALKBANK_API_USER || '',
  apiPassword: process.env.HALKBANK_API_PASSWORD || '',
  storeType: (process.env.HALKBANK_STORE_TYPE || '3d_pay') as '3d' | '3d_pay' | '3d_pay_hosting',
  mode: (process.env.HALKBANK_MODE || 'TEST') as 'TEST' | 'PROD',
};

// NestPay Endpoints for Halkbank
const ENDPOINTS = {
  TEST: {
    gateway3d: 'https://entegrasyon.asseco-see.com.tr/fim/est3Dgate',
    api: 'https://entegrasyon.asseco-see.com.tr/fim/api',
  },
  PROD: {
    gateway3d: 'https://sanalpos.halkbank.com.tr/fim/est3Dgate',
    api: 'https://sanalpos.halkbank.com.tr/fim/api',
  },
};

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://haydihepberaber.com';

export interface HalkbankPaymentRequest {
  orderId: string;
  amount: number;
  currency: string;
  cardNumber: string;
  cardExpMonth: string;
  cardExpYear: string;
  cardCvv: string;
  cardHolderName: string;
  customerEmail?: string;
  customerIp?: string;
}

export interface Halkbank3DFormData {
  action: string;
  fields: Record<string, string>;
}

export interface HalkbankPaymentResult {
  success: boolean;
  orderId?: string;
  transactionId?: string;
  authCode?: string;
  errorCode?: string;
  errorMessage?: string;
  rawResponse?: Record<string, string>;
}

/**
 * Escape special characters for hash calculation
 */
function escapeValue(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
}

/**
 * Generate Hash Version 3 for NestPay
 */
function generateHashV3(params: Record<string, string>, storeKey: string): string {
  const excludedParams = ['encoding', 'hash'];
  const sortedKeys = Object.keys(params)
    .filter(key => !excludedParams.includes(key.toLowerCase()))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const values = sortedKeys.map(key => escapeValue(params[key] || ''));
  const hashString = values.join('|') + '|' + escapeValue(storeKey);
  return crypto.createHash('sha512').update(hashString, 'utf8').digest('base64');
}

/**
 * Generate Hash Version 3 for callback verification
 */
function generateCallbackHashV3(params: Record<string, string>, storeKey: string): string {
  const excludedParams = ['encoding', 'hash', 'countdown'];
  const sortedKeys = Object.keys(params)
    .filter(key => !excludedParams.includes(key.toLowerCase()))
    .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
  const values = sortedKeys.map(key => escapeValue(params[key] || ''));
  const hashString = values.join('|') + '|' + escapeValue(storeKey);
  return crypto.createHash('sha512').update(hashString, 'utf8').digest('base64');
}

/**
 * Create 3D Secure form data for customer redirect
 */
export function create3DSecureForm(request: HalkbankPaymentRequest): Halkbank3DFormData {
  const endpoints = ENDPOINTS[HALKBANK_CONFIG.mode];
  const rnd = Date.now().toString();
  const formattedAmount = request.amount.toFixed(2);

  // Currency codes: 949 = TRY
  const currencyCode = '949';

  const okUrl = `${APP_URL}/api/payments/halkbank/callback`;
  const failUrl = `${APP_URL}/api/payments/halkbank/callback`;

  const formParams: Record<string, string> = {
    clientid: HALKBANK_CONFIG.clientId,
    storetype: HALKBANK_CONFIG.storeType,
    islemtipi: 'Auth',
    amount: formattedAmount,
    currency: currencyCode,
    oid: request.orderId,
    okUrl: okUrl,
    failUrl: failUrl,
    lang: 'tr',
    rnd: rnd,
    taksit: '',
    encoding: 'UTF-8',
    refreshtime: '5',
    hashAlgorithm: 'ver3',
    pan: request.cardNumber.replace(/\s/g, ''),
    Ecom_Payment_Card_ExpDate_Month: request.cardExpMonth.padStart(2, '0'),
    Ecom_Payment_Card_ExpDate_Year: request.cardExpYear.slice(-2),
    cv2: request.cardCvv,
    cardholderName: request.cardHolderName || '',
  };

  if (request.customerEmail) {
    formParams.email = request.customerEmail;
    formParams.BillToEmail = request.customerEmail;
  }

  if (request.customerIp) {
    formParams.TelVoice = request.customerIp;
  }

  // Billing info
  const nameParts = request.cardHolderName.trim().split(/\s+/);
  const firstName = nameParts[0] || request.cardHolderName;
  const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '.';
  formParams.BillToName = firstName;
  formParams.BillToSurname = lastName;
  formParams.BillToCompany = request.cardHolderName;
  formParams.BillToCountry = 'TR';

  const hash = generateHashV3(formParams, HALKBANK_CONFIG.storeKey);
  formParams.hash = hash;

  console.log('[Halkbank] Form params:', {
    ...formParams,
    pan: '****' + formParams.pan.slice(-4),
    cv2: '***',
    hash: hash.substring(0, 20) + '...',
  });

  return {
    action: endpoints.gateway3d,
    fields: formParams,
  };
}

/**
 * Verify callback hash from 3D Secure response
 */
export function verifyCallbackHash(params: Record<string, string>): boolean {
  const receivedHash = params.HASH || params.hash;
  if (!receivedHash) {
    console.log('[Halkbank] No hash in callback');
    return false;
  }

  const paramsForHash = { ...params };
  delete paramsForHash.HASH;
  delete paramsForHash.hash;

  const expectedHash = generateCallbackHashV3(paramsForHash, HALKBANK_CONFIG.storeKey);
  const isValid = receivedHash === expectedHash;

  if (!isValid) {
    console.log('[Halkbank] Hash mismatch:', { received: receivedHash, expected: expectedHash });
  }

  return isValid;
}

/**
 * Parse 3D Secure callback response
 */
export function parseCallbackResponse(params: Record<string, string>): HalkbankPaymentResult {
  const mdStatus = params.mdStatus || '';
  const procReturnCode = params.ProcReturnCode || '';
  const response = params.Response || '';

  const is3DSuccess = ['1', '2', '3', '4'].includes(mdStatus);
  const isPaymentSuccess = procReturnCode === '00' && response === 'Approved';
  const success = is3DSuccess && isPaymentSuccess;

  return {
    success,
    orderId: params.oid,
    transactionId: params.TransId,
    authCode: params.AuthCode,
    errorCode: success ? undefined : (params.ErrCode || procReturnCode),
    errorMessage: success ? undefined : (params.ErrMsg || params.ERRMSG || getErrorMessage(procReturnCode)),
    rawResponse: params,
  };
}

/**
 * Get human-readable error message
 */
function getErrorMessage(code: string): string {
  const errorMessages: Record<string, string> = {
    '00': 'Islem basarili',
    '01': 'Bankanizi arayin',
    '05': 'Islem onaylanmadi',
    '12': 'Gecersiz islem',
    '14': 'Gecersiz kart numarasi',
    '33': 'Kartin suresi dolmus',
    '41': 'Kayip kart',
    '43': 'Calinti kart',
    '51': 'Yetersiz bakiye',
    '54': 'Kartin suresi dolmus',
    '55': 'Hatali PIN',
    '82': 'CVV verisi hatali',
    '91': 'Banka kullanilamiyor',
    '99': 'Genel hata',
  };
  return errorMessages[code] || `Bilinmeyen hata (${code})`;
}

/**
 * Check if Halkbank is configured
 */
export function isHalkbankConfigured(): boolean {
  return !!(HALKBANK_CONFIG.clientId && HALKBANK_CONFIG.storeKey);
}

/**
 * Check if 3D authentication was successful
 */
export function is3DAuthSuccessful(params: Record<string, string>): boolean {
  const mdStatus = params.mdStatus || '';
  return ['1', '2', '3', '4'].includes(mdStatus);
}

/**
 * Get store type
 */
export function getHalkbankStoreType(): '3d' | '3d_pay' | '3d_pay_hosting' {
  return HALKBANK_CONFIG.storeType;
}

/**
 * Complete payment after 3D auth (for '3d' store type only)
 */
export async function complete3DPayment(
  callbackParams: Record<string, string>
): Promise<HalkbankPaymentResult> {
  const endpoints = ENDPOINTS[HALKBANK_CONFIG.mode];
  const orderId = callbackParams.oid || '';
  const amount = callbackParams.amount || '';
  const currency = callbackParams.currency || '';
  const md = callbackParams.md || '';
  const xid = callbackParams.xid || '';
  const eci = callbackParams.eci || '';
  const cavv = callbackParams.cavv || '';
  const modeFlag = HALKBANK_CONFIG.mode === 'TEST' ? 'T' : 'P';

  if (!HALKBANK_CONFIG.apiUser || !HALKBANK_CONFIG.apiPassword) {
    return { success: false, orderId, errorCode: 'CONFIG_MISSING', errorMessage: 'API credentials missing' };
  }

  if (!md) {
    return { success: false, orderId, errorCode: 'MISSING_MD', errorMessage: '3D auth data missing' };
  }

  const xmlRequest = `<?xml version="1.0" encoding="UTF-8"?>
<CC5Request>
  <Name>${escapeXml(HALKBANK_CONFIG.apiUser)}</Name>
  <Password>${escapeXml(HALKBANK_CONFIG.apiPassword)}</Password>
  <ClientId>${escapeXml(HALKBANK_CONFIG.clientId)}</ClientId>
  <Mode>${modeFlag}</Mode>
  <Type>Auth</Type>
  <OrderId>${escapeXml(orderId)}</OrderId>
  <Number>${escapeXml(md)}</Number>
  <Amount>${escapeXml(amount)}</Amount>
  <Currency>${escapeXml(currency)}</Currency>
  <PayerTxnId>${escapeXml(xid)}</PayerTxnId>
  <PayerSecurityLevel>${escapeXml(eci)}</PayerSecurityLevel>
  <PayerAuthenticationCode>${escapeXml(cavv)}</PayerAuthenticationCode>
</CC5Request>`;

  try {
    const response = await fetch(endpoints.api, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `DATA=${encodeURIComponent(xmlRequest)}`,
    });

    const responseText = await response.text();
    console.log('[Halkbank] API response:', responseText);

    const responseMatch = responseText.match(/<Response>([^<]*)<\/Response>/);
    const procReturnCodeMatch = responseText.match(/<ProcReturnCode>([^<]*)<\/ProcReturnCode>/);
    const transIdMatch = responseText.match(/<TransId>([^<]*)<\/TransId>/);
    const authCodeMatch = responseText.match(/<AuthCode>([^<]*)<\/AuthCode>/);
    const errMsgMatch = responseText.match(/<ErrMsg>([^<]*)<\/ErrMsg>/);

    const responseCode = responseMatch?.[1] || '';
    const procReturnCode = procReturnCodeMatch?.[1] || '';
    const success = responseCode === 'Approved' && procReturnCode === '00';

    return {
      success,
      orderId,
      transactionId: transIdMatch?.[1] || '',
      authCode: authCodeMatch?.[1] || '',
      errorCode: success ? undefined : procReturnCode,
      errorMessage: success ? undefined : (errMsgMatch?.[1] || getErrorMessage(procReturnCode)),
    };
  } catch (error) {
    console.error('[Halkbank] API error:', error);
    return { success: false, orderId, errorCode: 'API_ERROR', errorMessage: 'API call failed' };
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
