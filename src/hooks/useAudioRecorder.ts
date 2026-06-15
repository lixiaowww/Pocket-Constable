/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useRef, useState } from "react";

const MAX_SECONDS = 5 * 60;

export function useAudioRecorder(enabled: boolean) {
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef<string>("");

  useEffect(() => {
    setSupported(
      enabled &&
        typeof navigator !== "undefined" &&
        !!navigator.mediaDevices?.getUserMedia &&
        typeof MediaRecorder !== "undefined"
    );
  }, [enabled]);

  function getPreferredMimeType(): string {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/aac",
      ""
    ];
    for (const t of types) {
      if (!t || MediaRecorder.isTypeSupported(t)) return t;
    }
    return "";
  }

  function getFileExtension(mimeType: string): string {
    if (mimeType.includes("mp4")) return "mp4";
    if (mimeType.includes("aac")) return "aac";
    return "webm";
  }

  const stopTracks = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    const recorder = mediaRecorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      stopTracks();
      setRecording(false);
    }
  }, [stopTracks]);

  const start = useCallback(async () => {
    if (!supported) return;

    setError(null);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = getPreferredMimeType();
      mimeTypeRef.current = mimeType;
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stopTracks();
        setRecording(false);

        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          const ext = getFileExtension(mimeTypeRef.current);
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `维权取证-${new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19)}.${ext}`;
          a.click();
          URL.revokeObjectURL(url);
        }
      };

      recorder.start(1000);
      setRecording(true);
      setSeconds(0);

      timerRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev + 1 >= MAX_SECONDS) {
            stop();
            return MAX_SECONDS;
          }
          return prev + 1;
        });
      }, 1000);
    } catch {
      setError("无法访问麦克风，请在浏览器设置中允许录音权限");
      stopTracks();
      setRecording(false);
    }
  }, [supported, stop, stopTracks]);

  const toggle = useCallback(() => {
    if (recording) stop();
    else start();
  }, [recording, start, stop]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
      stopTracks();
    };
  }, [stopTracks]);

  return { recording, seconds, error, supported, toggle, stop };
}
