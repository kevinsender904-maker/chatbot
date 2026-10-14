import React from "react";
import Markdown from "react-markdown";
import {
  Stethoscope,
  AlertTriangle,
  PhoneCall,
  ShieldAlert,
  X,
  ExternalLink,
  Info,
} from "lucide-react";
import { Message } from "../types";
import { EmergencyDetails } from "../services/emergencyDetector";

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  const hasConditionSuggestions =
    !isUser &&
    (message.content.includes("Possible Condition") ||
      message.content.includes("Condition(s)") ||
      message.content.includes("possible condition") ||
      message.content.includes("diagnosis"));

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-6`}>
      <div className={`flex w-full max-w-[90%] md:max-w-[85%] gap-3 ${isUser ? "justify-end" : ""}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <Stethoscope className="w-5 h-5" />
          </div>
        )}

        <div className={`flex flex-col ${isUser ? "items-end" : "items-start"} max-w-full flex-1`}>
          <div
            className={`px-4 py-3 rounded-2xl ${
              isUser
                ? "bg-blue-600 text-white rounded-tr-none shadow-md inline-block max-w-full"
                : "bg-white border border-slate-200 rounded-tl-none shadow-sm text-slate-700 w-full"
            }`}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed font-medium whitespace-pre-wrap">{message.content}</p>
            ) : (
              <div className="space-y-4">
                <div
                  className="prose prose-sm md:prose-sm prose-slate max-w-none 
                  prose-p:leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 prose-a:text-blue-600
                  prose-li:marker:text-blue-500"
                >
                  <Markdown>{message.content}</Markdown>
                </div>

                {hasConditionSuggestions && (
                  <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-xs text-amber-900 shadow-xs">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-amber-800">
                        Medical Disclaimer (This is not a diagnosis):
                      </span>{" "}
                      Any condition suggestions provided above are for informational and educational
                      purposes only. They cannot replace formal medical evaluation. Always consult a
                      qualified healthcare provider for an official diagnosis and personalized care.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block px-1">
            {isUser
              ? message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : `HealthCare AI • ${message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TypingIndicator() {
  return (
    <div className="flex w-full mb-6">
      <div className="flex gap-2 items-center px-11 opacity-60">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.3s]"></div>
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse [animation-delay:-0.15s]"></div>
          <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-pulse"></div>
        </div>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest ml-2">
          HealthCare AI analyzing symptoms...
        </span>
      </div>
    </div>
  );
}

export function EmergencyBanner() {
  return (
    <div className="bg-red-600 text-white px-4 md:px-6 py-2 flex flex-col md:flex-row items-center justify-between shrink-0 gap-1 md:gap-4">
      <div className="flex items-center gap-2 text-[11px] md:text-xs font-bold uppercase tracking-widest text-center md:text-left">
        <span className="w-2 h-2 rounded-full bg-white animate-pulse shrink-0"></span>
        Medical Safety & Emergency Protocol Active
      </div>
      <div className="text-[9px] md:text-[10px] font-medium opacity-90 text-center md:text-left">
        If you or someone else is experiencing life-threatening symptoms, dial 911 or your local emergency number immediately.
      </div>
    </div>
  );
}

export function EmergencyGuidanceCard({
  emergencyDetails,
  onDismiss,
}: {
  emergencyDetails: EmergencyDetails;
  onDismiss?: () => void;
}) {
  return (
    <div className="mx-4 md:mx-8 mb-4 p-4 md:p-5 bg-red-50 border-2 border-red-500 rounded-2xl shadow-md text-red-950 animate-in fade-in slide-in-from-top duration-300">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm animate-pulse">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                URGENT
              </span>
              <h3 className="text-sm md:text-base font-bold text-red-900">
                {emergencyDetails.warningTitle}
              </h3>
            </div>
            <p className="text-xs text-red-700 mt-0.5 font-medium">
              Detected serious symptom indicators:{" "}
              <span className="font-bold underline">
                {emergencyDetails.detectedKeywords.join(", ")}
              </span>
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1 text-red-400 hover:text-red-700 rounded-lg transition-colors"
            title="Dismiss alert"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="mt-3 p-3 bg-white/80 rounded-xl border border-red-200">
        <p className="text-xs font-semibold text-red-900 leading-relaxed">
          {emergencyDetails.professionalHelpWarning}
        </p>
      </div>

      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
        {emergencyDetails.hotlines.map((hotline, idx) => (
          <a
            key={idx}
            href={`tel:${hotline.number}`}
            className="flex items-center justify-between p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition-transform active:scale-98"
          >
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4" />
              <span>
                {hotline.name}: <span className="underline font-mono text-sm">{hotline.number}</span>
              </span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider bg-red-700 px-2 py-0.5 rounded-md">
              Call Now
            </span>
          </a>
        ))}
      </div>

      <div className="mt-3 pt-3 border-t border-red-200">
        <p className="text-[10px] font-bold uppercase tracking-wider text-red-800 mb-1.5">
          Immediate Safety Steps:
        </p>
        <ul className="text-xs text-red-800 space-y-1 list-disc list-inside">
          {emergencyDetails.emergencyActions.map((action, i) => (
            <li key={i}>{action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function DiagnosisDisclaimerFooter() {
  return (
    <div className="py-1 px-4 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500 font-medium">
      <span className="font-bold text-slate-700">Medical Notice:</span> Condition suggestions and
      health info provided by this assistant are for general information only —{" "}
      <span className="font-semibold text-slate-800">this is not a medical diagnosis</span>.
    </div>
  );
}
