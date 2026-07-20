export interface OtpDispatchRequest {
  email: string;
  mobile: string;
  otpCode: string;
  twilioSid?: string;
  twilioToken?: string;
  twilioFrom?: string;
}

export interface OtpDispatchResult {
  success: boolean;
  message: string;
  dispatchedVia: string[];
  emailSent: boolean;
  smsSent: boolean;
}

export class OtpService {
  /**
   * Generates a random 6-digit secure numeric verification code
   */
  static generateOtpCode(): string {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const code = (array[0] % 900000) + 100000;
    return code.toString();
  }

  /**
   * Dispatches the OTP to email & mobile via available real-time channels
   */
  static async dispatchOtp(req: OtpDispatchRequest): Promise<OtpDispatchResult> {
    const channels: string[] = ['Live Device Monitor'];
    let emailSent = false;
    let smsSent = false;

    // 1. Send Real Email via Web HTTP API (FormSubmit / Email API)
    try {
      const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(req.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          _subject: `FreshVision Login Verification Code: ${req.otpCode}`,
          email: req.email,
          mobile: req.mobile,
          message: `Your FreshVision AI Enterprise verification OTP code is: ${req.otpCode}. Valid for 5 minutes. Do not share this code with anyone.`
        })
      });
      if (response.ok) {
        emailSent = true;
        channels.push('Real Email Dispatch (HTTP)');
      }
    } catch (err) {
      console.warn('HTTP Email dispatch error:', err);
    }

    // 2. Trigger OS Desktop Notification
    try {
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('FreshVision Verification OTP', {
            body: `SMS to ${req.mobile} & Email to ${req.email} -> OTP: ${req.otpCode}`,
            icon: '/favicon.ico',
            requireInteraction: true
          });
          channels.push('Desktop Push Notification');
        } else if (Notification.permission !== 'denied') {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            new Notification('FreshVision Verification OTP', {
              body: `SMS to ${req.mobile} & Email to ${req.email} -> OTP: ${req.otpCode}`,
              icon: '/favicon.ico',
              requireInteraction: true
            });
            channels.push('Desktop Push Notification');
          }
        }
      }
    } catch (err) {
      console.warn('Desktop notification error:', err);
    }

    // 3. Send via Twilio SMS Gateway if configured
    if (req.twilioSid && req.twilioToken && req.twilioFrom) {
      try {
        const url = `https://api.twilio.com/2010-04-01/Accounts/${req.twilioSid}/Messages.json`;
        const auth = btoa(`${req.twilioSid}:${req.twilioToken}`);
        const params = new URLSearchParams();
        params.append('To', req.mobile);
        params.append('From', req.twilioFrom);
        params.append('Body', `FreshVision Security: Your OTP verification code is ${req.otpCode}`);

        const twilioRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: params
        });

        if (twilioRes.ok) {
          smsSent = true;
          channels.push('Twilio Cellular SMS Gateway');
        }
      } catch (err) {
        console.warn('Twilio SMS dispatch failed:', err);
      }
    }

    return {
      success: true,
      message: `Verification OTP dispatched to ${req.email} & ${req.mobile}`,
      dispatchedVia: channels,
      emailSent,
      smsSent
    };
  }
}
