const SERVER_URL = 'http://localhost:5000/api/auth';

export interface SendOtpResponse {
  success: boolean;
  message: string;
  phone: string;
  expiresInSeconds?: number;
  error?: string;
  cooldown?: number;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
  error?: string;
  attemptsLeft?: number;
}

export async function requestOtp(phone: string, role: string): Promise<SendOtpResponse> {
  try {
    const res = await fetch(`${SERVER_URL}/send-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, role })
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      success: false,
      message: 'Unable to connect to local OTP server. Please start the server.',
      phone,
      error: 'OTP Server Offline'
    };
  }
}

export async function verifyOtp(phone: string, otp: string, role: string): Promise<VerifyOtpResponse> {
  try {
    const res = await fetch(`${SERVER_URL}/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, otp, role })
    });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { success: false, error: 'Cannot connect to OTP verification server.' };
  }
}
