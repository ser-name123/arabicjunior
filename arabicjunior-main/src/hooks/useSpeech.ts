"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Voice in and voice out for the chat widget, using what the browser already
 * ships with.
 *
 * No API key, no per-minute cost and nothing leaves the visitor's device for
 * the speech-to-text part. The trade-off is coverage: Chrome, Edge and Safari
 * recognise speech, Firefox does not. Everything here reports what is actually
 * available so the UI can hide a microphone button that would do nothing rather
 * than show one that silently fails.
 */

// SpeechRecognition is still prefixed in Chrome and is not in the DOM types.
type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

const getRecognitionConstructor = (): (new () => SpeechRecognitionLike) | null => {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
};

export interface UseSpeechOptions {
  /** BCP-47 tag, e.g. "en-US" or "ar-AE". */
  language: string;
  /** Called once the visitor stops talking, with what was heard. */
  onResult: (transcript: string) => void;
}

export const useSpeech = ({ language, onResult }: UseSpeechOptions) => {
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  // Kept in a ref so restarting recognition does not need a fresh callback,
  // which would tear down and rebuild the recogniser on every render.
  const onResultRef = useRef(onResult);
  onResultRef.current = onResult;

  // Support has to be read on the client: on the server there is no window, and
  // rendering a microphone button that then disappears causes a hydration
  // mismatch.
  useEffect(() => {
    setMicSupported(getRecognitionConstructor() !== null);
    setSpeechSupported(typeof window !== "undefined" && "speechSynthesis" in window);
  }, []);

  useEffect(() => {
    const Recognition = getRecognitionConstructor();
    if (!Recognition) return;

    const recognition = new Recognition();
    recognition.lang = language;
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as ArrayLike<any>)
        .map((result: any) => result[0]?.transcript ?? "")
        .join(" ")
        .trim();
      if (transcript) onResultRef.current(transcript);
    };

    recognition.onerror = (event: any) => {
      setListening(false);
      // "aborted" is what fires when the visitor taps the button again to stop,
      // and "no-speech" when they say nothing. Neither is worth a message.
      if (event?.error === "aborted" || event?.error === "no-speech") return;
      setMicError(
        event?.error === "not-allowed"
          ? "Microphone access was blocked. Allow it in your browser settings to speak."
          : "The microphone could not be used. Please type instead."
      );
    };

    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.abort();
      recognitionRef.current = null;
    };
  }, [language]);

  /**
   * Asks for the microphone before handing over to the recogniser.
   *
   * Chrome's speech recogniser does prompt on its own, but only the first time
   * and only from inside its own machinery — when it cannot, it reports a bare
   * "not-allowed" and the visitor is told to change a setting they were never
   * offered. Requesting explicitly puts the browser's real permission dialog in
   * front of them on the first click, and gives a specific reason on the rest.
   */
  const requestMicPermission = useCallback(async (): Promise<boolean> => {
    // Absent on insecure origins (plain http that is not localhost), where
    // capture is refused before any prompt can appear.
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setMicError(
        "Voice input needs a secure (https) connection. Please type instead."
      );
      return false;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // The recogniser opens its own capture, so this one is released straight
      // away — otherwise the browser's recording indicator stays lit.
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (error) {
      const name = (error as DOMException)?.name;
      setMicError(
        name === "NotAllowedError"
          ? "Microphone access was blocked. Click the lock icon in the address bar, set Microphone to Allow, then try again."
          : name === "NotFoundError"
          ? "No microphone was found on this device."
          : "The microphone could not be used. Please type instead."
      );
      return false;
    }
  }, []);

  const startListening = useCallback(async () => {
    const recognition = recognitionRef.current;
    if (!recognition || listening) return;

    setMicError(null);
    if (!(await requestMicPermission())) return;

    try {
      recognition.start();
      setListening(true);
    } catch {
      // start() throws if it is already running; treat it as already listening.
      setListening(true);
    }
  }, [listening, requestMicPermission]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  /** Reads a reply out loud, cancelling anything already being spoken. */
  const speak = useCallback(
    (text: string) => {
      if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

      // Link markup and emoji are for the eye, not the ear.
      const spoken = text
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
        .replace(/[#*_`>]/g, "")
        .replace(/\s+/g, " ")
        .trim();
      if (!spoken) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(spoken);
      utterance.lang = language;
      utterance.rate = 1;
      utterance.onstart = () => setSpeaking(true);
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);

      window.speechSynthesis.speak(utterance);
    },
    [language]
  );

  const stopSpeaking = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  // A reply left mid-sentence keeps talking after the widget closes, because
  // speech synthesis belongs to the page and not to this component.
  useEffect(() => stopSpeaking, [stopSpeaking]);

  return {
    listening,
    speaking,
    micSupported,
    speechSupported,
    micError,
    startListening,
    stopListening,
    speak,
    stopSpeaking,
  };
};
