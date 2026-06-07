'use client';
import { useState, useRef } from 'react';

export function usePronunciation() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const startPronunciationCheck = async (targetWord: string, timeoutMs = 3000) => {
    if (isRecording || isProcessing) return;
    setScore(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      const chunks: BlobPart[] = [];
      
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setIsProcessing(true);
        const blob = new Blob(chunks, { type: 'audio/webm' });
        
        try {
          const formData = new FormData();
          formData.append('file', blob, 'audio.webm');
          formData.append('language', 'gu'); // Force Gujarati output
          
          const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
          if (!res.ok) throw new Error('STT failed');
          const data = await res.json();
          
          const transcript = data.text?.trim().toLowerCase() || '';
          const target = targetWord.toLowerCase().trim();
          
          // Simple scoring logic based on text match
          if (transcript.includes(target) || target.includes(transcript)) {
            setScore(3); // Perfect
          } else if (transcript.length > 0) {
            // Rough heuristic: if it heard *something*, give 1 star to encourage them
            setScore(1); 
          } else {
            setScore(0); // Didn't catch anything
          }
        } catch {
          setScore(0);
        } finally {
          setIsProcessing(false);
        }
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      
      // Auto-stop after timeoutMs
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === 'recording') {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
        }
      }, timeoutMs);
      
    } catch {
      // Permission denied or error
      setIsRecording(false);
    }
  };

  const stopPronunciationCheck = () => {
    if (isRecording && mediaRecorderRef.current?.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return { isRecording, isProcessing, score, startPronunciationCheck, stopPronunciationCheck, setScore };
}
