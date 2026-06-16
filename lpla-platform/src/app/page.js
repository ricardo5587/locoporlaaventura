export default function Home() {
  return (
    <pre style={{ fontFamily: 'monospace', padding: 32 }}>
      {`LPLA Platform API
      
P0 Endpoints:
  GET  /api/events
  POST /api/events
  PATCH  /api/events/[id]
  DELETE /api/events/[id]
  GET  /api/orders
  POST /api/orders
  PATCH  /api/orders/[id]
  POST /api/checkout
  POST /api/auth/login
  POST /api/auth/2fa/send
  POST /api/auth/2fa/verify
`}
    </pre>
  );
}
