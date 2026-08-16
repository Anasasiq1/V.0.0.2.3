import { StoreSettings } from '../../types';

export interface PaymentGatewayConfig {
  cod_enabled: boolean;
  upi_enabled: boolean;
  wallet_enabled: boolean;
  wallet_demo_balance: number;
  upi_id: string;
  upi_phone: string;
  upi_payee_name: string;
  upi_qr_image: string;
}

export type { StoreSettings };
