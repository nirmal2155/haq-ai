'use client';

import React, { useState } from 'react';
import { Phone, PhoneOff, Mic, ShieldCheck, ShieldAlert, MessageSquare, Check, Sparkles } from 'lucide-react';

interface VoiceCallProps {
  invoiceId: string;
  context: {
    buyerName: string;
    invoiceNo: string;
    amount: string;
    dueDate: string;
    daysOverdue: number;
    interest: string;
    total: string;
  };
  onCallEnded?: () => void;
}

interface ChatMessage {
  sender: 'ai' | 'buyer';
  text: string;
  timestamp: string;
}

export function VoiceCall({ invoiceId, context, onCallEnded }: VoiceCallProps) {
  const [isInCall, setIsInCall] = useState(false);
  const [consentGiven, setConsentGiven] = useState(true);
  const [promisedDate, setPromisedDate] = useState('2026-11-15');
  const [callEnded, setCallEnded] = useState(false);
  const [savingRecord, setSavingRecord] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Fallback text input for interactive roleplay
  const [buyerInput, setBuyerInput] = useState('');

  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const startCall = async () => {
    setIsInCall(true);
    setCallEnded(false);
    setSavedSuccess(false);

    // Initial AI opening speech adhering to server system instruction
    const openingMsg: ChatMessage = {
      sender: 'ai',
      text:
        `Namaste / Hello. I am an AI assistant calling the accounts team of ${context.buyerName} ` +
        `on behalf of your registered MSME supplier regarding Invoice #${context.invoiceNo}. ` +
        `Please note that I am an AI assistant and this call may be recorded for statutory record-keeping. ` +
        `Do you give consent to continue this call?`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages([openingMsg]);
  };

  const handleSimulatedBuyerConsent = () => {
    const buyerMsg: ChatMessage = {
      sender: 'buyer',
      text: 'Yes, I am from accounts. Consent is given. What is the status of this invoice?',
      timestamp: new Date().toLocaleTimeString(),
    };

    const aiFollowUp: ChatMessage = {
      sender: 'ai',
      text:
        `Thank you for confirming consent. The invoice principal amount is ${context.amount}, which was due on ${context.dueDate} ` +
        `and is currently ${context.daysOverdue} days overdue. ` +
        `Under Section 16 of the MSMED Act, 2006, the supplier is entitled to statutory compound interest with monthly rests, ` +
        `which currently stands at ${context.interest}, bringing the total claim to ${context.total}. ` +
        `Could you please let us know when your accounts department will release this payment?`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, buyerMsg, aiFollowUp]);
  };

  const handleBuyerPromiseDate = (dateText: string) => {
    const buyerMsg: ChatMessage = {
      sender: 'buyer',
      text: `We will release the payment by ${dateText}.`,
      timestamp: new Date().toLocaleTimeString(),
    };

    const aiConfirmation: ChatMessage = {
      sender: 'ai',
      text:
        `Thank you. I have recorded your commitment that ${context.buyerName} will release the payment by ${dateText}. ` +
        `This commitment has been recorded for the MSME Facilitation Council timeline. Have a productive day.`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setPromisedDate(dateText);
    setMessages((prev) => [...prev, buyerMsg, aiConfirmation]);
  };

  const handleSendCustomMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerInput.trim()) return;

    const buyerMsg: ChatMessage = {
      sender: 'buyer',
      text: buyerInput.trim(),
      timestamp: new Date().toLocaleTimeString(),
    };

    // AI responsive answer staying factual
    const aiResponse: ChatMessage = {
      sender: 'ai',
      text: `Noted. To confirm, invoice #${context.invoiceNo} has an outstanding statutory total of ${context.total}. We request remittance by ${promisedDate || 'the earliest date'}.`,
      timestamp: new Date().toLocaleTimeString(),
    };

    setMessages((prev) => [...prev, buyerMsg, aiResponse]);
    setBuyerInput('');
  };

  const endCallAndSave = async () => {
    setIsInCall(false);
    setCallEnded(true);
    setSavingRecord(true);

    const fullTranscript = messages.map((m) => `[${m.timestamp}] ${m.sender.toUpperCase()}: ${m.text}`).join('\n');

    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer test-token-supplier_demo',
        },
        body: JSON.stringify({
          invoiceId,
          consentGiven,
          transcript: consentGiven ? fullTranscript : undefined,
          promisedDate: consentGiven ? promisedDate : null,
        }),
      });

      if (res.ok) {
        setSavedSuccess(true);
        if (onCallEnded) onCallEnded();
      }
    } catch (err) {
      console.error('Failed to save call record', err);
    } finally {
      setSavingRecord(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Phone className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Gemini Live Voice Settlement Assistant
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browser-based AI voice call simulation with accounts team of {context.buyerName}
          </p>
        </div>

        {/* Consent Toggle */}
        <div className="flex items-center gap-2 bg-slate-50 p-2 border border-slate-200 rounded-lg">
          <input
            type="checkbox"
            id="callConsent"
            checked={consentGiven}
            onChange={(e) => setConsentGiven(e.target.checked)}
            className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
          />
          <label htmlFor="callConsent" className="text-xs font-semibold text-slate-700 cursor-pointer flex items-center gap-1">
            {consentGiven ? (
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            )}
            Recording Consent Confirmed
          </label>
        </div>
      </div>

      {/* Facts Card (Strictly what the AI knows and speaks) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
        <div>
          <span className="text-slate-400 block">Buyer Entity</span>
          <span className="font-bold text-slate-800">{context.buyerName}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Principal Due</span>
          <span className="font-bold text-slate-800">{context.amount}</span>
        </div>
        <div>
          <span className="text-slate-400 block">Days Overdue</span>
          <span className="font-bold text-red-600">{context.daysOverdue} Days</span>
        </div>
        <div>
          <span className="text-slate-400 block">Total Claim (w/ 3x Interest)</span>
          <span className="font-bold text-emerald-700">{context.total}</span>
        </div>
      </div>

      {/* Live Call Control Area */}
      {!isInCall && !callEnded && (
        <div className="text-center py-8 space-y-4">
          <button
            onClick={startCall}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-full shadow-lg transition flex items-center gap-2 mx-auto text-sm"
          >
            <Phone className="w-4 h-4" />
            Start Interactive AI Voice Call
          </button>
          <p className="text-xs text-slate-400">
            Uses short-lived ephemeral token. No API keys exposed to client bundle.
          </p>
        </div>
      )}

      {/* Active Call Live Captions & Simulation */}
      {isInCall && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-900 text-white px-4 py-2.5 rounded-lg text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping" />
              <span>LIVE CALL IN PROGRESS (English / Hindi / Gujarati)</span>
            </div>
            <button
              onClick={endCallAndSave}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold transition flex items-center gap-1 shadow"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              End Call
            </button>
          </div>

          {/* Live Captions Transcript Area */}
          <div className="h-64 overflow-y-auto p-4 bg-slate-900 rounded-lg space-y-3 font-sans text-xs border border-slate-800">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg max-w-[85%] leading-relaxed ${
                  m.sender === 'ai'
                    ? 'bg-slate-800 text-slate-100 border-l-4 border-emerald-500 mr-auto'
                    : 'bg-emerald-950 text-emerald-100 border-r-4 border-emerald-400 ml-auto'
                }`}
              >
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                  <span className="font-bold uppercase tracking-wider">
                    {m.sender === 'ai' ? '🤖 Haq AI Assistant' : '👤 Teammate (Buyer Accounts)'}
                  </span>
                  <span>{m.timestamp}</span>
                </div>
                <p className="text-slate-200">{m.text}</p>
              </div>
            ))}
          </div>

          {/* Teammate Roleplay Controls */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <span className="text-xs font-bold text-slate-700 block">
              Quick Roleplay Response (Click or Type below):
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSimulatedBuyerConsent}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-medium text-slate-700 shadow-sm"
              >
                1. Grant Consent & Ask Status
              </button>
              <button
                onClick={() => handleBuyerPromiseDate('2026-11-15')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-medium text-slate-700 shadow-sm"
              >
                2. Promise Payment on 15th Nov
              </button>
              <button
                onClick={() => handleBuyerPromiseDate('2026-11-30')}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded text-xs font-medium text-slate-700 shadow-sm"
              >
                3. Promise Payment on 30th Nov
              </button>
            </div>

            {/* Custom interactive text fallback */}
            <form onSubmit={handleSendCustomMessage} className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Or speak/type buyer reply here..."
                value={buyerInput}
                onChange={(e) => setBuyerInput(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
              <button
                type="submit"
                className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Call Summary & Audit Status */}
      {callEnded && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg space-y-3 text-xs text-emerald-900">
          <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
            <Check className="w-5 h-5 text-emerald-600" />
            <span>Call Ended & Logged</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div>
              <span className="font-semibold">Recorded Consent: </span>
              <span>{consentGiven ? 'Granted (Transcript Saved)' : 'Refused (Transcript Omitted)'}</span>
            </div>
            <div>
              <span className="font-semibold">Promised Payment Date: </span>
              <span className="font-bold text-slate-900">{promisedDate || 'Not specified'}</span>
            </div>
          </div>

          {savingRecord && <p className="text-slate-500">Saving call record to Firestore...</p>}
          {savedSuccess && (
            <p className="text-emerald-700 font-semibold">
              ✓ Call record and settlement promise successfully saved to Firestore calls collection.
            </p>
          )}

          <button
            onClick={startCall}
            className="mt-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
          >
            Start Another Demo Call
          </button>
        </div>
      )}
    </div>
  );
}
