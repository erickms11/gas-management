import React, { useState, useRef } from 'react';
import { X, Download, Upload, FileJson, CheckCircle2, AlertCircle } from 'lucide-react';
import { exportDataToJson, importDataFromJson } from '../utils/storage';

interface DataExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataImported: () => void;
}

export const DataExportModal: React.FC<DataExportModalProps> = ({
  isOpen,
  onClose,
  onDataImported,
}) => {
  if (!isOpen) return null;

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportDataToJson();
      setMessage({ type: 'success', text: 'Dados exportados em JSON com sucesso!' });
    } catch (err) {
      setMessage({ type: 'error', text: 'Erro ao gerar o arquivo JSON.' });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const result = importDataFromJson(content);
        if (result.success) {
          setMessage({ type: 'success', text: result.message });
          onDataImported();
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      }
    };
    reader.readAsText(file);
    // Limpar o input para permitir selecionar o mesmo arquivo se desejar
    e.target.value = '';
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileJson size={22} color="var(--primary)" />
            <h2 className="modal-title">Exportar & Backup em JSON</h2>
          </div>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
          Exporte todos os seus dados de veículos, histórico de abastecimentos com localização GPS e revisões para um arquivo JSON seguro, ou restaure um backup existente.
        </p>

        {message && (
          <div
            style={{
              padding: '10px 12px',
              borderRadius: '10px',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.82rem',
              fontWeight: 600,
              background: message.type === 'success' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
              color: message.type === 'success' ? 'var(--accent-etanol)' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            }}
          >
            {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{message.text}</span>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {/* Opção 1: Exportar */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Exportar para JSON
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Baixar arquivo .json com todos os registros
              </div>
            </div>
            <button
              onClick={handleExport}
              className="btn-primary"
              style={{ width: 'auto', padding: '8px 14px', fontSize: '0.82rem' }}
            >
              <Download size={16} /> Exportar
            </button>
          </div>

          {/* Opção 2: Importar */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Importar Backup JSON
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Restaurar registros a partir de um arquivo .json
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'rgba(255, 255, 255, 0.08)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
              }}
            >
              <Upload size={16} /> Importar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
