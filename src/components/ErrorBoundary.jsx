import { useRouteError } from 'react-router-dom';

export default function ErrorBoundary() {
  const error = useRouteError();

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      flexDirection: 'column',
      justifyContent: 'center', 
      alignItems: 'center',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      <div style={{ maxWidth: '500px' }}>
        <h1 style={{ fontSize: '48px', color: '#F080A0', marginBottom: '10px' }}>⚠️ Ошибка</h1>
        <p style={{ fontSize: '18px', color: '#333', marginBottom: '20px' }}>
          Что-то пошло не так
        </p>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #e0e0e0',
          marginBottom: '20px',
          textAlign: 'left',
          maxHeight: '200px',
          overflowY: 'auto'
        }}>
          <code style={{ color: '#d32f2f', fontSize: '14px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
            {error?.statusText || error?.message || 'Unknown error'}
          </code>
        </div>
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            padding: '12px 30px',
            backgroundColor: '#80C040',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          Вернуться на главную
        </button>
      </div>
    </div>
  );
}
