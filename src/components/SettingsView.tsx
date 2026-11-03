import React, { useState, useRef } from 'react';
import { Download, Upload, RotateCcw, Trash2, CheckCircle2, AlertCircle, FileJson, Database, ShieldAlert } from 'lucide-react';
import { exportDataToJson, importDataFromJson, resetToSampleData, clearAllData } from '../utils/storage';

interface SettingsModalProps {
  isOpen?: boolean;
  onDataChanged: () => void;
}

export const SettingsView: React.FC<SettingsModalProps> = ({ onDataChanged }) => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportDataToJson();
      setMessage({ type: 'success', text: 'Arquivo JSON baixado com sucesso!' });
    } catch {
      setMessage({ type: 'error', text: 'Não foi possível gerar o arquivo JSON.' });
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
          onDataChanged();
        } else {
          setMessage({ type: 'error', text: result.message });
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetSample = () => {
    if (confirm('Deseja restaurar os dados de amostra? Seus registros atuais serão substituídos pelos exemplos.')) {
      resetToSampleData();
      setMessage({ type: 'success', text: 'Dados de amostra restaurados com sucesso!' });
      onDataChanged();
    }
  };

  const handleClearAll = () => {
    if (confirm('Atenção: deseja limpar TODOS os dados do aplicativo? Esta ação não pode ser desfeita.')) {
      clearAllData();
      setMessage({ type: 'success', text: 'Todos os dados foram apagados.' });
      onDataChanged();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div className="glass-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Database size={22} color="var(--primary)" />
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Gerenciamento de Dados & Backup</h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
          Seus dados são salvos localmente e com privacidade no seu próprio navegador/celular. Você pode fazer backup em JSON, restaurar ou resetar os dados de exemplo a qualquer momento.
        </p>

        {message && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: '12px',
              marginTop: '14px',
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
      </div>

      {/* Seção 1: Backup & Restauração JSON */}
      <div className="glass-card">
        <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileJson size={18} color="var(--primary)" /> Exportação e Importação
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Baixar JSON */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                Baixar Dados (JSON)
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Salva todos os veículos, abastecimentos e manutenções em um arquivo
              </div>
            </div>

            <button
              onClick={handleExport}
              className="btn-primary"
              style={{ width: 'auto', padding: '8px 14px', fontSize: '0.82rem', flexShrink: 0 }}
            >
              <Download size={15} /> Baixar JSON
            </button>
          </div>

          {/* Subir JSON */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                Subir Arquivo (JSON)
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Carrega um arquivo JSON de backup previamente exportado
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
                background: 'rgba(56, 189, 248, 0.15)',
                color: 'var(--primary)',
                border: '1px solid var(--primary)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Upload size={15} /> Subir JSON
            </button>
          </div>
        </div>
      </div>

      {/* Seção 2: Reset e Limpeza */}
      <div className="glass-card">
        <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: '14px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldAlert size={18} color="var(--accent-fuel)" /> Reset & Restauração
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Resetar dados de amostra */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-main)' }}>
                Carregar Dados de Amostra
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Restaura os exemplos de carros (Onix, Corolla), abastecimentos e gráficos
              </div>
            </div>

            <button
              onClick={handleResetSample}
              style={{
                background: 'rgba(245, 158, 11, 0.15)',
                color: 'var(--accent-fuel)',
                border: '1px solid var(--accent-fuel)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <RotateCcw size={15} /> Resetar Amostra
            </button>
          </div>

          {/* Limpar tudo */}
          <div
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#ef4444' }}>
                Zerar Todos os Dados
              </div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Apaga todos os veículos e históricos para começar do zero absoluto
              </div>
            </div>

            <button
              onClick={handleClearAll}
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.5)',
                borderRadius: '10px',
                padding: '8px 14px',
                fontSize: '0.82rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <Trash2 size={15} /> Limpar Tudo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
