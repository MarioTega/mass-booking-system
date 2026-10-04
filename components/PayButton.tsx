'use client';
import { useState, useEffect, useRef } from 'react';

declare global {
  interface Window {
    PaystackPop: any;
  }
}

const PAYSTACK_SCRIPT_ID = 'paystack-inline-js';

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '8px 0', fontFamily: "'Georgia', serif" },
  checkBtn: { position: 'relative', padding: '13px 32px', fontSize: '13px', fontFamily: "'Georgia', serif", letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: '#C9A84C', background: '#0a0a0a', borderStyle: 'solid', borderWidth: '1px', borderColor: '#C9A84C', borderRadius: '2px', cursor: 'pointer', transition: 'all 0.25s ease', minWidth: '220px', overflow: 'hidden' },
  checkBtnHover: { color: '#0a0a0a', background: '#C9A84C' },
  checkBtnDisabled: { color: '#3a3a3a', borderColor: '#2a2a2a', background: '#0a0a0a', cursor: 'not-allowed', opacity: 0.5 },
  payBtn: { position: 'relative', padding: '14px 32px', fontSize: '14px', fontFamily: "'Georgia', serif", letterSpacing: '0.14em', textTransform: 'uppercase' as const, color: '#0a0a0a', background: '#C9A84C', borderStyle: 'solid', borderWidth: '1px', borderColor: '#C9A84C', borderRadius: '2px', cursor: 'pointer', transition: 'all 0.25s ease', minWidth: '220px', fontWeight: 600 },
  payBtnHover: { background: '#E2C06A', borderColor: '#E2C06A', boxShadow: '0 0 20px rgba(201, 168, 76, 0.35)' },
  payBtnDisabled: { background: '#1a1a1a', borderColor: '#2a2a2a', color: '#3a3a3a', cursor: 'not-allowed', boxShadow: 'none' },
  message: { fontSize: '12px', letterSpacing: '0.06em', lineHeight: 1.5, textAlign: 'center' as const, padding: '8px 16px', borderRadius: '2px', maxWidth: '320px' },
  messageSuccess: { color: '#C9A84C', background: 'rgba(201, 168, 76, 0.08)', borderStyle: 'solid', borderWidth: '1px', borderColor: 'rgba(201, 168, 76, 0.25)' },
  messageError: { color: '#e07070', background: 'rgba(220, 80, 80, 0.07)', borderStyle: 'solid', borderWidth: '1px', borderColor: 'rgba(220, 80, 80, 0.2)' },
  messageInfo: { color: '#b5b5b5', background: 'rgba(255, 255, 255, 0.04)', borderStyle: 'solid', borderWidth: '1px', borderColor: 'rgba(255, 255, 255, 0.12)' },
};

type Notice = { text: string; kind: 'success' | 'error' | 'info' };

// Turns a raw backend message into something a person can read.
function describe(message: string, ctx: { intention?: string; reference?: string | null }): Notice {
  const ref = ctx.reference ? ` Your payment reference is ${ctx.reference}.` : '';

  switch (message) {
    case 'Proceed to Pay':
      return { kind: 'success', text: 'That date is available. Tap Pay to complete your booking.' };
    case 'Booking already exists':
      return { kind: 'error', text: "You've already made this booking." };
    case 'The Day is fully booked':
      return { kind: 'error', text: `A ${ctx.intention || 'Mass'} has already been booked for that day. Please choose another date.` };
    case 'Mass successfully booked':
      return { kind: 'success', text: 'Payment confirmed. Your mass has been booked.' };
    case 'Payment verification failed':
      return { kind: 'error', text: `We couldn't confirm your payment with Paystack. If you were charged, please contact the parish office.${ref}` };
    case 'Payment amount mismatch':
      return { kind: 'error', text: `The amount paid doesn't match the booking price, so no booking was made. If you were charged, please contact the parish office.${ref}` };
    case 'Invalid request':
      return { kind: 'error', text: 'Some booking details were missing. Please refresh and try again.' };
    default:
      if (message.startsWith('Parishioner profile not found')) {
        return { kind: 'error', text: `We couldn't find a profile for this phone number, so no booking was made. If you were charged, please contact the parish office.${ref}` };
      }
      return { kind: 'error', text: message };
  }
}

interface PayButtonProps {
  amount: number;
  booking: string[];
  onTriggerSubmit: () => void;
  validatedFormData: any;
}

export default function PayButton({ amount, booking, onTriggerSubmit, validatedFormData }: PayButtonProps) {
  const [response, setResponse] = useState<any>(null);
  const [userMssg, setUserMssg] = useState(''); // raw backend message; drives canPay
  const [notice, setNotice] = useState<Notice | null>(null); // what the user sees
  const [checkHover, setCheckHover] = useState(false);
  const [payHover, setPayHover] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Always-current copies so effects don't re-fire just because the parent
  // passed a new array/object identity on re-render.
  const bookingRef = useRef(booking);
  bookingRef.current = booking;
  const formDataRef = useRef(validatedFormData);
  formDataRef.current = validatedFormData;

  // Prevents the same Paystack reference from being verified twice.
  const verifiedRef = useRef<string | null>(null);

  const isFormValid = booking.length > 0;
  const canPay = userMssg === 'Proceed to Pay' && isScriptLoaded;

  // Load Paystack inline script
  useEffect(() => {
    if (window.PaystackPop) {
      setIsScriptLoaded(true);
      return;
    }

    let script = document.getElementById(PAYSTACK_SCRIPT_ID) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = PAYSTACK_SCRIPT_ID;
      script.src = 'https://js.paystack.co/v2/inline.js';
      script.async = true;
      document.body.appendChild(script);
    }

    const onLoad = () => setIsScriptLoaded(true);
    script.addEventListener('load', onLoad);
    return () => script?.removeEventListener('load', onLoad);
  }, []);

  // Pre-verify availability when the parent triggers it
  useEffect(() => {
    if (!validatedFormData || validatedFormData._triggerType !== 'preverify') return;

    const executePreverify = async () => {
      setUserMssg('');
      setNotice({ kind: 'info', text: 'Checking availability…' });
      try {
        const res = await fetch('/api/preverify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking: bookingRef.current,
            intention: validatedFormData.intention,
            phoneNo: validatedFormData.phoneNo,
          }),
        });
        const data = await res.json().catch(() => ({}));
        const message: string =
          data.message ?? 'Something went wrong while checking availability. Please try again.';
        setUserMssg(message);
        setNotice(describe(message, { intention: validatedFormData.intention }));
      } catch (err) {
        console.error('Preverify failed:', err);
        setNotice({ kind: 'error', text: "We couldn't reach the server to check availability. Please check your connection and try again." });
      }
    };
    executePreverify();
  }, [validatedFormData]);

  // Verify payment once per successful Paystack response
  useEffect(() => {
    if (!response || response.status !== 'success') return;

    const reference = response.reference;
    if (verifiedRef.current === reference) return;
    verifiedRef.current = reference;

    const verify = async () => {
      // Lock the Pay button immediately so the user can't pay twice while we confirm.
      setUserMssg('Verifying');
      setNotice({ kind: 'info', text: 'Payment received. Confirming your booking, please wait…' });
      try {
        const formData = formDataRef.current;
        const res = await fetch('/api/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            reference,
            booking: bookingRef.current,
            phoneNo: formData?.phoneNo,
          }),
        });
        const data = await res.json().catch(() => ({}));
        const message: string =
          data.message ?? 'Something went wrong on our server while confirming your payment.';
        setUserMssg(message);

        const base = describe(message, { intention: formData?.intention, reference });
        // Unknown/500 errors still need the reference so the person can follow up.
        const isKnownOrOk = res.ok || data.message;
        setNotice(
          isKnownOrOk
            ? base
            : { kind: 'error', text: `${message} If you were charged, please contact the parish office. Your payment reference is ${reference}.` }
        );
      } catch (err) {
        console.error('Verify failed:', err);
        setUserMssg('Verification error'); // keeps Pay disabled so they can't pay again
        setNotice({
          kind: 'error',
          text: `We couldn't confirm your booking just now. Please don't pay again. Contact the parish office with your payment reference: ${reference}.`,
        });
        verifiedRef.current = null;
      }
    };
    verify();
  }, [response]);

  const handlePayment = () => {
    if (!window.PaystackPop) return;

    const key = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    const email = 'tobyladeoghenetega@gmail.com'; // hardcoded for testing: every receipt goes here

    if (!key) {
      console.error('Missing NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY (restart dev server after adding it)');
      setNotice({ kind: 'error', text: 'Payments are not set up correctly. Please contact the parish office.' });
      return;
    }

    try {
      const popup = new window.PaystackPop();
      popup.newTransaction({
        key,
        email,
        amount: Math.round(amount * 100),
        reference: `ref_${Date.now()}`,
        onSuccess: (res: any) => setResponse(res),
        onCancel: () => {
          setNotice({ kind: 'info', text: 'Payment window closed. Tap Pay to try again.' });
        },
        onError: (err: any) => {
          console.error('Paystack error:', err);
          setNotice({ kind: 'error', text: "Paystack couldn't start the payment. Please try again." });
        },
      });
    } catch (err) {
      console.error('Paystack threw:', JSON.stringify(err, null, 2));
      setNotice({ kind: 'error', text: "Paystack couldn't start the payment. Please try again." });
    }
  };

  const noticeStyle =
    notice?.kind === 'success' ? styles.messageSuccess
    : notice?.kind === 'error' ? styles.messageError
    : styles.messageInfo;

  return (
    <div style={styles.wrapper}>
      <button
        type="button"
        disabled={!isFormValid}
        onClick={onTriggerSubmit}
        style={{
          ...styles.checkBtn,
          ...(checkHover && isFormValid ? styles.checkBtnHover : {}),
          ...(!isFormValid ? styles.checkBtnDisabled : {}),
        }}
        onMouseEnter={() => setCheckHover(true)}
        onMouseLeave={() => setCheckHover(false)}
      >
        Check Availability
      </button>

      <button
        type="button"
        disabled={!canPay}
        onClick={handlePayment}
        style={{
          ...styles.payBtn,
          ...(payHover && canPay ? styles.payBtnHover : {}),
          ...(!canPay ? styles.payBtnDisabled : {}),
        }}
        onMouseEnter={() => setPayHover(true)}
        onMouseLeave={() => setPayHover(false)}
      >
        {!isScriptLoaded && userMssg === 'Proceed to Pay'
          ? 'Loading...'
          : `Pay ₦${(amount || 0).toLocaleString()}`}
      </button>

      {notice && (
        <p role="status" aria-live="polite" style={{ ...styles.message, ...noticeStyle }}>
          {notice.text}
        </p>
      )}
    </div>
  );
}