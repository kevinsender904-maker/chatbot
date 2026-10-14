import React from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Stethoscope, HeartPulse, ShieldCheck } from "lucide-react";
import Layout from "../components/Layout";

export default function LandingPage() {
  return (
    <Layout>
      <div className="flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto h-full overflow-y-auto w-full">
        <div className="text-center space-y-6 max-w-2xl">
          <div className="mx-auto w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-8 shadow-sm">
            <Stethoscope className="w-10 h-10" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Your Personal <span className="text-blue-600">Health Assistant</span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-600 leading-relaxed">
            Get instant guidance for your symptoms, health tips, and wellness advice from our AI-powered virtual doctor.
          </p>
          
          <div className="pt-6 pb-8">
            <Link 
              to="/chat" 
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg transition-all w-full md:w-auto"
            >
              <MessageSquare className="w-5 h-5" />
              Start Chatting Now
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex justify-center items-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Symptom Checker</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Describe what you are feeling and get possible causes and recommendations.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex justify-center items-center">
              <HeartPulse className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Health Tips</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Access a personalized library of preventive care and daily wellness advice.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex justify-center items-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Private & Secure</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Your conversations and profile are protected with secure auth and Supabase encryption.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
