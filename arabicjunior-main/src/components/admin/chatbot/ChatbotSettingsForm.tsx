"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertTriangle,
  Bot,
  Database,
  MessageSquare,
  Mic,
  Palette,
  Plus,
  Send,
  Trash2,
  Headphones,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button-2";
import { Input } from "@/components/ui/input-2";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

const API = process.env.NEXT_PUBLIC_API_BASE_URL;

interface QuickReply {
  label: string;
  reply: string;
  order: number;
}

interface KnowledgeSources {
  pricing: boolean;
  teachers: boolean;
  faqs: boolean;
  blogs: boolean;
  jobs: boolean;
  contact: boolean;
  about: boolean;
  testimonials: boolean;
}

interface Settings {
  enabled: boolean;
  botName: string;
  botTagline: string;
  avatarUrl: string;
  accentFrom: string;
  accentTo: string;
  preChatTitle: string;
  preChatSubtitle: string;
  askForPhone: boolean;
  welcomeMessage: string;
  followUpMessage: string;
  inputPlaceholder: string;
  fallbackMessage: string;
  quickReplies: QuickReply[];
  operatorEnabled: boolean;
  operatorLabel: string;
  whatsappNumber: string;
  whatsappMessage: string;
  voiceInputEnabled: boolean;
  voiceReplyEnabled: boolean;
  voiceLanguage: string;
  aiEnabled: boolean;
  aiModel: string;
  aiPersona: string;
  aiMaxReplyWords: number;
  knowledge: KnowledgeSources;
}

/** What each database switch actually lets the bot read. */
const KNOWLEDGE_LABELS: Record<keyof KnowledgeSources, { title: string; detail: string }> = {
  pricing: { title: "Pricing plans", detail: "Plan names, prices and what each includes" },
  teachers: { title: "Our teachers", detail: "The published profiles from the Teachers page" },
  faqs: { title: "FAQs", detail: "The question and answer section on the homepage" },
  blogs: { title: "Blog articles", detail: "Titles, summaries and links to published posts" },
  jobs: { title: "Job openings", detail: "Published positions on the Careers page" },
  contact: { title: "Contact details", detail: "Phone, WhatsApp, email and location" },
  about: { title: "About the academy", detail: "Your description and headline numbers" },
  testimonials: { title: "Parent reviews", detail: "Published written testimonials" },
};

const VOICE_LANGUAGES = [
  { value: "en-US", label: "English (US)" },
  { value: "en-GB", label: "English (UK)" },
  { value: "en-IN", label: "English (India)" },
  { value: "ar-AE", label: "Arabic (UAE)" },
  { value: "ar-SA", label: "Arabic (Saudi Arabia)" },
  { value: "hi-IN", label: "Hindi (India)" },
  { value: "ur-PK", label: "Urdu (Pakistan)" },
];

const labelClass = "text-xs font-semibold text-neutral-600";
const inputClass = "h-10 text-sm bg-white border-neutral-200";

const Section = ({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) => (
  <div className="border rounded-xl p-5 bg-white space-y-4">
    <div>
      <h3 className="font-semibold text-black flex items-center gap-2">
        {icon}
        {title}
      </h3>
      {description && <p className="text-xs text-neutral-500 mt-1">{description}</p>}
    </div>
    {children}
  </div>
);

const ChatbotSettingsForm = ({ token }: { token: string | null }) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [aiKeyConfigured, setAiKeyConfigured] = useState(false);
  const [aiProvider, setAiProvider] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [tryText, setTryText] = useState("");
  const [tryReply, setTryReply] = useState<{ reply: string; source: string } | null>(null);
  const [trying, setTrying] = useState(false);

  const fetchSettings = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/admin/chatbot/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load settings");
      const json = await res.json();
      setSettings(json.data);
      setAiKeyConfigured(Boolean(json.ai?.keyConfigured));
      setAiProvider(json.ai?.provider ?? null);
    } catch (error) {
      console.error(error);
      toast.error("Could not load the chatbot settings");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  const update = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((prev) => (prev ? { ...prev, [key]: value } : prev));

  const updateQuickReply = (index: number, patch: Partial<QuickReply>) =>
    setSettings((prev) =>
      prev
        ? {
            ...prev,
            quickReplies: prev.quickReplies.map((item, i) =>
              i === index ? { ...item, ...patch } : item
            ),
          }
        : prev
    );

  const handleSave = async () => {
    if (!settings || !token) return;

    setSaving(true);
    try {
      const res = await fetch(`${API}/admin/chatbot/settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || "Failed to save");

      toast.success("Chatbot settings saved");
      setSettings(json.data);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleTry = async () => {
    if (!tryText.trim() || !token) return;
    setTrying(true);
    setTryReply(null);
    try {
      const res = await fetch(`${API}/admin/chatbot/preview`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: tryText.trim() }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) throw new Error(json?.message || "Failed");
      setTryReply(json.data);
    } catch (error) {
      console.error(error);
      toast.error("Could not get a reply");
    } finally {
      setTrying(false);
    }
  };

  if (loading) return <p className="text-sm text-neutral-500 py-10 text-center">Loading…</p>;
  if (!settings) return null;

  return (
    <div className="space-y-5">
      {/* Master switch */}
      <div className="border rounded-xl p-5 bg-white flex items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-black">Show the chat on the website</h3>
          <p className="text-xs text-neutral-500 mt-1">
            Switching this off hides the chat bubble everywhere. Leads already
            collected are kept.
          </p>
        </div>
        <Switch
          checked={settings.enabled}
          onCheckedChange={(checked) => update("enabled", checked)}
        />
      </div>

      <Section
        icon={<Palette size={18} className="text-orange-500" />}
        title="Appearance"
        description="The name, colours and picture the visitor sees at the top of the chat."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Chatbot name</label>
            <Input
              value={settings.botName}
              onChange={(e) => update("botName", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Status line</label>
            <Input
              value={settings.botTagline}
              onChange={(e) => update("botTagline", e.target.value)}
              placeholder="Online"
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <label className={labelClass}>Avatar image URL (optional)</label>
            <Input
              value={settings.avatarUrl}
              onChange={(e) => update("avatarUrl", e.target.value)}
              placeholder="https://…"
              className={inputClass}
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClass}>Gradient start</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.accentFrom}
                onChange={(e) => update("accentFrom", e.target.value)}
                className="h-10 w-14 rounded border cursor-pointer bg-white"
              />
              <Input
                value={settings.accentFrom}
                onChange={(e) => update("accentFrom", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Gradient end</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={settings.accentTo}
                onChange={(e) => update("accentTo", e.target.value)}
                className="h-10 w-14 rounded border cursor-pointer bg-white"
              />
              <Input
                value={settings.accentTo}
                onChange={(e) => update("accentTo", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div
          className="rounded-lg p-4 text-white text-sm font-semibold"
          style={{
            backgroundImage: `linear-gradient(to right, ${settings.accentFrom}, ${settings.accentTo})`,
          }}
        >
          {settings.botName || "Chatbot"} — this is how the header will look
        </div>
      </Section>

      <Section
        icon={<MessageSquare size={18} className="text-orange-500" />}
        title="What the chatbot says"
        description="The form before the chat starts, and the first two messages after it does."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Form heading</label>
            <Input
              value={settings.preChatTitle}
              onChange={(e) => update("preChatTitle", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Form subtitle</label>
            <Input
              value={settings.preChatSubtitle}
              onChange={(e) => update("preChatSubtitle", e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={settings.askForPhone}
            onCheckedChange={(checked) => update("askForPhone", checked)}
          />
          <span className="text-sm text-neutral-600">
            Also ask for a phone number (optional field)
          </span>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Welcome message</label>
          <Input
            value={settings.welcomeMessage}
            onChange={(e) => update("welcomeMessage", e.target.value)}
            className={inputClass}
          />
          <p className="text-[11px] text-neutral-400">
            Write <code className="bg-neutral-100 px-1 rounded">{"{name}"}</code> where the
            visitor&apos;s name should appear.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Second message</label>
          <Textarea
            value={settings.followUpMessage}
            onChange={(e) => update("followUpMessage", e.target.value)}
            rows={2}
            className="text-sm bg-white"
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Message box placeholder</label>
          <Input
            value={settings.inputPlaceholder}
            onChange={(e) => update("inputPlaceholder", e.target.value)}
            className={inputClass}
          />
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>When the chatbot does not know the answer</label>
          <Textarea
            value={settings.fallbackMessage}
            onChange={(e) => update("fallbackMessage", e.target.value)}
            rows={2}
            className="text-sm bg-white"
          />
          <p className="text-[11px] text-neutral-400">
            This is what a parent sees instead of a made-up answer, so it is worth
            pointing them somewhere useful.
          </p>
        </div>
      </Section>

      <Section
        icon={<Plus size={18} className="text-orange-500" />}
        title="Quick reply buttons"
        description="The buttons under the conversation. Leave the answer blank to let the chatbot answer the question itself."
      >
        <div className="space-y-3">
          {settings.quickReplies.map((item, index) => (
            <div key={index} className="border rounded-lg p-3 space-y-2 bg-neutral-50/50">
              <div className="flex items-center gap-2">
                <Input
                  value={item.label}
                  onChange={(e) => updateQuickReply(index, { label: e.target.value })}
                  placeholder="📅 Book a Free Trial Class"
                  className={inputClass}
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 w-9 p-0 text-red-500 shrink-0"
                  onClick={() =>
                    update(
                      "quickReplies",
                      settings.quickReplies.filter((_, i) => i !== index)
                    )
                  }
                  aria-label="Remove button"
                >
                  <Trash2 size={15} />
                </Button>
              </div>
              <Textarea
                value={item.reply}
                onChange={(e) => updateQuickReply(index, { reply: e.target.value })}
                placeholder="Fixed answer (leave blank to let the chatbot answer)"
                rows={2}
                className="text-sm bg-white"
              />
            </div>
          ))}
        </div>

        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={() =>
            update("quickReplies", [
              ...settings.quickReplies,
              { label: "", reply: "", order: settings.quickReplies.length + 1 },
            ])
          }
        >
          <Plus size={15} /> Add button
        </Button>
      </Section>

      <Section
        icon={<Headphones size={18} className="text-orange-500" />}
        title="Talk with an operator"
        description="The escape hatch when the chatbot cannot help."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.operatorEnabled}
            onCheckedChange={(checked) => update("operatorEnabled", checked)}
          />
          <span className="text-sm text-neutral-600">Show the WhatsApp button</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Button text</label>
            <Input
              value={settings.operatorLabel}
              onChange={(e) => update("operatorLabel", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>WhatsApp number</label>
            <Input
              value={settings.whatsappNumber}
              onChange={(e) => update("whatsappNumber", e.target.value)}
              placeholder="971505344645"
              className={inputClass}
            />
            <p className="text-[11px] text-neutral-400">
              Country code first, no plus sign or spaces.
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>Message the visitor sends you</label>
          <Textarea
            value={settings.whatsappMessage}
            onChange={(e) => update("whatsappMessage", e.target.value)}
            rows={2}
            className="text-sm bg-white"
          />
        </div>
      </Section>

      <Section
        icon={<Mic size={18} className="text-orange-500" />}
        title="Voice"
        description="Uses what the browser already provides — there is nothing extra to pay for."
      >
        <div className="flex items-center gap-2">
          <Switch
            checked={settings.voiceInputEnabled}
            onCheckedChange={(checked) => update("voiceInputEnabled", checked)}
          />
          <span className="text-sm text-neutral-600">
            Let visitors speak their question (microphone button)
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={settings.voiceReplyEnabled}
            onCheckedChange={(checked) => update("voiceReplyEnabled", checked)}
          />
          <span className="text-sm text-neutral-600">
            Let visitors have replies read aloud (speaker button)
          </span>
        </div>

        <div className="space-y-1.5 max-w-xs">
          <label className={labelClass}>Voice language</label>
          <select
            value={settings.voiceLanguage}
            onChange={(e) => update("voiceLanguage", e.target.value)}
            className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm"
          >
            {VOICE_LANGUAGES.map((language) => (
              <option key={language.value} value={language.value}>
                {language.label}
              </option>
            ))}
          </select>
        </div>

        <p className="text-[11px] text-neutral-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
          The microphone works in Chrome, Edge and Safari. Firefox has no speech
          recognition, so the button is hidden there and visitors type instead.
        </p>
      </Section>

      <Section
        icon={<Bot size={18} className="text-orange-500" />}
        title="AI answers"
        description="With AI on, the chatbot understands questions asked in any wording. With it off, it matches keywords only."
      >
        {!aiKeyConfigured && (
          <div className="flex gap-2 text-xs bg-amber-50 border border-amber-200 rounded-lg p-3">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-900">No AI key on the server yet</p>
              <p className="text-amber-800 mt-0.5">
                The switch below has no effect until an API key is added to the
                server. Until then the chatbot still works — it answers from your
                questions and your website content by matching keywords.
              </p>
            </div>
          </div>
        )}

        {aiKeyConfigured && (
          <p className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
            <ShieldCheck size={15} className="shrink-0" />
            AI key found on the server ({aiProvider}).
          </p>
        )}

        <div className="flex items-center gap-2">
          <Switch
            checked={settings.aiEnabled}
            onCheckedChange={(checked) => update("aiEnabled", checked)}
          />
          <span className="text-sm text-neutral-600">Use AI to write the answers</span>
        </div>

        <div className="space-y-1.5">
          <label className={labelClass}>How the chatbot should behave</label>
          <Textarea
            value={settings.aiPersona}
            onChange={(e) => update("aiPersona", e.target.value)}
            rows={4}
            className="text-sm bg-white"
          />
          <p className="text-[11px] text-neutral-400">
            Tone and priorities. It is already told never to guess prices or
            policies, and never to reveal anyone&apos;s personal details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Model</label>
            <Input
              value={settings.aiModel}
              onChange={(e) => update("aiModel", e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Longest reply (words)</label>
            <Input
              type="number"
              min={20}
              max={400}
              value={settings.aiMaxReplyWords}
              onChange={(e) => update("aiMaxReplyWords", Number(e.target.value) || 90)}
              className={inputClass}
            />
          </div>
        </div>
      </Section>

      <Section
        icon={<Database size={18} className="text-orange-500" />}
        title="What the chatbot may read"
        description="Only the website content you tick here. A source that is switched off is never read at all."
      >
        <div className="flex gap-2 text-xs bg-neutral-50 border rounded-lg p-3">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-neutral-600">
            Student registrations, trial bookings, contact messages, newsletter
            subscribers and teacher job applications are <strong>not</strong> on this
            list and cannot be added from here. The chatbot has no way to reach
            anyone&apos;s personal details.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.keys(KNOWLEDGE_LABELS) as (keyof KnowledgeSources)[]).map((key) => (
            <label
              key={key}
              className="flex items-start gap-3 border rounded-lg p-3 cursor-pointer hover:bg-neutral-50"
            >
              <Checkbox
                checked={settings.knowledge[key]}
                onCheckedChange={(checked) =>
                  update("knowledge", { ...settings.knowledge, [key]: Boolean(checked) })
                }
                className="mt-0.5"
              />
              <span>
                <span className="block text-sm font-medium text-black">
                  {KNOWLEDGE_LABELS[key].title}
                </span>
                <span className="block text-[11px] text-neutral-500">
                  {KNOWLEDGE_LABELS[key].detail}
                </span>
              </span>
            </label>
          ))}
        </div>
      </Section>

      <Section
        icon={<Send size={18} className="text-orange-500" />}
        title="Try a question"
        description="Runs the real chatbot against your saved settings. Nothing is recorded as a lead."
      >
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            value={tryText}
            onChange={(e) => setTryText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleTry();
              }
            }}
            placeholder="How much are your classes?"
            className={inputClass}
          />
          <Button onClick={handleTry} disabled={trying || !tryText.trim()} className="shrink-0">
            {trying ? "Asking…" : "Ask"}
          </Button>
        </div>

        {tryReply && (
          <div className="border rounded-lg p-3 bg-neutral-50 space-y-2">
            <p className="text-sm whitespace-pre-wrap text-black">{tryReply.reply}</p>
            <p className="text-[11px] text-neutral-500">
              Answered from:{" "}
              <strong>
                {tryReply.source === "ai"
                  ? "AI"
                  : tryReply.source === "qa"
                  ? "your own questions"
                  : tryReply.source === "knowledge"
                  ? "your website content"
                  : "the not-found message"}
              </strong>
            </p>
          </div>
        )}
      </Section>

      {/* Save bar. Sticky because this form is long enough that the button would
          otherwise be several scrolls away from whatever was just changed. */}
      <div className="sticky bottom-0 bg-white border rounded-xl p-4 flex items-center justify-between gap-3 shadow-lg">
        <p className="text-xs text-neutral-500">
          Changes appear on the website as soon as you save.
        </p>
        <Button onClick={handleSave} disabled={saving} className="shrink-0">
          {saving ? "Saving…" : "Save settings"}
        </Button>
      </div>
    </div>
  );
};

export default ChatbotSettingsForm;
