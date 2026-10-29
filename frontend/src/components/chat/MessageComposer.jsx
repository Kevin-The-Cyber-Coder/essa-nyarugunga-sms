import { useEffect, useRef, useState } from 'react';
import { chatApi } from './chatApi';
import { emitTyping, emitLegacyTyping } from './useChatSocket';
import { extentColor } from './chatFormat';

const MessageComposer = ({ conversationId, socket, peerId, replyingTo, onCancelReply, onSend }) => {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [config, setConfig] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const fileRef = useRef(null);
  const typingStopRef = useRef(null);
  const typingOnRef = useRef(false);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    chatApi.uploadConfig().then((d) => setConfig(d?.config || null)).catch(() => {});
  }, []);

  useEffect(() => () => {
    clearInterval(timerRef.current);
    if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  }, []);

  const noteTyping = (on) => {
    if (!conversationId) return;
    const emit = () => {
      emitTyping(socket, conversationId, on);
      if (peerId) emitLegacyTyping(socket, peerId, on);
    };
    if (on && !typingOnRef.current) {
      typingOnRef.current = true;
      emit();
    }
    clearTimeout(typingStopRef.current);
    typingStopRef.current = setTimeout(() => {
      if (typingOnRef.current) {
        typingOnRef.current = false;
        emitTyping(socket, conversationId, false);
        if (peerId) emitLegacyTyping(socket, peerId, false);
      }
    }, 2200);
  };

  useEffect(() => () => {
    clearTimeout(typingStopRef.current);
    if (typingOnRef.current) emitTyping(socket, conversationId, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const max = config?.maxFiles || 5;
    if (attachments.length + files.length > max) {
      alert(`You can attach up to ${max} files.`);
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    try {
      const { files: stored } = await chatApi.upload(files, (pct) => setUploadProgress(pct));
      setAttachments((prev) => [...prev, ...(stored || [])]);
    } catch (err) {
      alert(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const pickFiles = (e) => {
    const { files } = e.target;
    e.target.value = '';
    uploadFiles(files);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (uploading || recording) return;
    if (e.dataTransfer?.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    if (recording) return;
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      alert('Voice recording is not supported on this device.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data && e.data.size) chunksRef.current.push(e.data); };
      recorder.onstop = () => finishRecording();
      recorder.start();
      setRecording(true);
      setRecordSecs(0);
      timerRef.current = setInterval(() => setRecordSecs((s) => s + 1), 1000);
    } catch {
      stopStream();
      alert('Microphone permission was denied.');
    }
  };

  const cancelRecording = () => {
    clearInterval(timerRef.current);
    chunksRef.current = [];
    const recorder = recorderRef.current;
    if (recorder) recorder.onstop = null;
    try { recorder?.stop(); } catch { /* already stopped */ }
    stopStream();
    recorderRef.current = null;
    setRecording(false);
  };

  const finishRecording = async () => {
    clearInterval(timerRef.current);
    setRecording(false);
    const chunks = chunksRef.current;
    stopStream();
    recorderRef.current = null;
    if (!chunks.length) return;

    const mime = chunks[0].type || 'audio/webm';
    const blob = new Blob(chunks, { type: mime });
    // .weba maps to the "audio" bucket server-side and plays the webm/opus
    // stream in every modern browser.
    const ext = mime.includes('ogg') ? 'ogg' : mime.includes('mp4') ? 'm4a' : mime.includes('wav') ? 'wav' : 'weba';
    const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: mime });

    setUploading(true);
    try {
      const { files: stored } = await chatApi.upload([file]);
      onSend({
        content: '',
        attachments: stored,
        replyTo: replyingTo ? replyingTo._id : null,
        type: 'voice'
      });
    } catch (err) {
      alert(err.message || 'Could not send the voice message.');
    } finally {
      setUploading(false);
    }
  };

  const canSend = (text.trim() || attachments.length > 0) && !uploading;

  const send = () => {
    if (!canSend) return;
    onSend({
      content: text,
      attachments,
      replyTo: replyingTo ? replyingTo._id : null
    });
    clearTimeout(typingStopRef.current);
    typingOnRef.current = false;
    if (conversationId) emitTyping(socket, conversationId, false);
    setText('');
    setAttachments([]);
  };

  return (
    <div
      className={`ck-composer${dragging ? ' ck-dragging' : ''}`}
      onDragOver={(e) => { e.preventDefault(); if (!uploading && !recording) setDragging(true); }}
      onDragLeave={(e) => { if (e.currentTarget === e.target) setDragging(false); }}
      onDrop={onDrop}
    >
      {dragging && (
        <div className="ck-drop-overlay">
          <i className="fas fa-cloud-arrow-up" /> Drop files to attach
        </div>
      )}

      {uploadProgress !== null && (
        <div className="ck-upload-progress" title={`Uploading ${uploadProgress}%`}>
          <div style={{ width: `${uploadProgress}%` }} />
          <span>{uploadProgress}%</span>
        </div>
      )}

      {replyingTo && (
        <div className="ck-reply-bar">
          <i className="fas fa-reply" />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            Replying to <b>{replyingTo.senderName || 'yourself'}</b>: {replyingTo.content || '[Attachment]'}
          </span>
          <button className="ck-iconbtn" style={{ width: 22, height: 22, fontSize: 12 }} onClick={onCancelReply} title="Cancel reply">
            <i className="fas fa-times" />
          </button>
        </div>
      )}

      {attachments.length > 0 && (
        <div className="ck-attach-list">
          {attachments.map((f, i) => (
            <span key={`${f.name}-${i}`} className="ck-attach-chip">
              <i className={`fas ${Number(f.size || 0) ? 'fa-file' : 'fa-image'}`} style={{ color: extentColor(f.kind) }} />
              {f.name}
              <button onClick={() => setAttachments((prev) => prev.filter((_, idx) => idx !== i))} title="Remove">
                <i className="fas fa-times" />
              </button>
            </span>
          ))}
        </div>
      )}

      {recording ? (
        <div className="ck-composer-row">
          <span style={{ color: '#e74c3c', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, flex: '0 0 auto' }}>
            <i className="fas fa-circle" style={{ fontSize: 9 }} /> {recordSecs}s
          </span>
          <span style={{ flex: 1, color: 'var(--text-muted)' }}>Recording voice message…</span>
          <button className="ck-iconbtn" onClick={cancelRecording} title="Cancel recording" style={{ flex: '0 0 auto' }}>
            <i className="fas fa-times" />
          </button>
          <button className="ck-send" onClick={() => recorderRef.current?.stop()} title="Send voice message">
            <i className="fas fa-paper-plane" />
          </button>
        </div>
      ) : (
      <div className="ck-composer-row">
        <button
          className="ck-iconbtn"
          title={config ? `Attach files (max ${config.maxFiles})` : 'Attach files'}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          style={{ flex: '0 0 auto' }}
        >
          <i className="fas fa-paperclip" />
        </button>
        <button
          className="ck-iconbtn"
          title="Record a voice message"
          onClick={startRecording}
          disabled={uploading}
          style={{ flex: '0 0 auto' }}
        >
          <i className="fas fa-microphone" />
        </button>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept={config?.extensions?.map((e) => `.${e}`).join(',') || '.*'}
          style={{ display: 'none' }}
          onChange={pickFiles}
        />
        <textarea
          rows={1}
          placeholder="Type a message…  (Enter to send)"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            noteTyping(true);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button className="ck-send" onClick={send} disabled={!canSend} title="Send">
          {uploading ? <i className="fas fa-spinner fa-spin" /> : <i className="fas fa-paper-plane" />}
        </button>
      </div>
      )}
    </div>
  );
};

export default MessageComposer;