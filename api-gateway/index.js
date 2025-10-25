const fastify = require('fastify')({ logger: true });
const axios = require('axios');

// Enable CORS
fastify.register(require('@fastify/cors'), {
  origin: '*'
});

// Service URLs
const SERVICES = {
  kependudukan: process.env.SERVICE_KEPENDUDUKAN_URL || 'http://service-kependudukan',
  pendapatan: process.env.SERVICE_PENDAPATAN_URL || 'http://service-pendapatan:5000',
  pu: process.env.SERVICE_PU_URL || 'http://service-pu:8080',
  kesehatan: process.env.SERVICE_KESEHATAN_URL || 'http://service-kesehatan:3000'
};

// API Key validation
const VALID_API_KEYS = [
  'demo-api-key-12345',
  'test-key-67890',
  'admin-key-abcde'
];

// Middleware: API Key Authentication
fastify.addHook('preHandler', async (request, reply) => {
  // Skip authentication for health check
  if (request.url === '/health') {
    return;
  }

  const apiKey = request.headers['x-api-key'];
  
  if (!apiKey) {
    reply.code(401).send({
      success: false,
      error: 'API Key diperlukan. Gunakan header X-API-Key'
    });
    return;
  }

  if (!VALID_API_KEYS.includes(apiKey)) {
    reply.code(403).send({
      success: false,
      error: 'API Key tidak valid'
    });
    return;
  }
});

// Helper function: Call service with timeout
async function callService(url, timeout = 5000) {
  try {
    const response = await axios.get(url, { timeout });
    return response.data;
  } catch (error) {
    console.error(`Error calling ${url}:`, error.message);
    return null;
  }
}

// Routes

// Health check
fastify.get('/health', async (request, reply) => {
  return {
    status: 'healthy',
    service: 'API Gateway / ESB',
    timestamp: new Date().toISOString()
  };
});

// Service health checks
fastify.get('/services/health', async (request, reply) => {
  const healthChecks = await Promise.all([
    callService(`${SERVICES.kependudukan}/health`),
    callService(`${SERVICES.pendapatan}/health`),
    callService(`${SERVICES.pu}/health`),
    callService(`${SERVICES.kesehatan}/health`)
  ]);

  return {
    success: true,
    services: {
      kependudukan: healthChecks[0] || { status: 'unhealthy' },
      pendapatan: healthChecks[1] || { status: 'unhealthy' },
      pu: healthChecks[2] || { status: 'unhealthy' },
      kesehatan: healthChecks[3] || { status: 'unhealthy' }
    }
  };
});

// Aggregator: Get warga profile (main feature)
fastify.get('/api/warga/:nik/profil', async (request, reply) => {
  const { nik } = request.params;

  console.log(`Fetching profile for NIK: ${nik}`);

  // Parallel calls to all services
  const [pendudukData, kesehatanData, puData, pajakData] = await Promise.all([
    callService(`${SERVICES.kependudukan}/penduduk/${nik}`),
    callService(`${SERVICES.kesehatan}/rekam-medis/${nik}`),
    callService(`${SERVICES.pu}/proyek?nik=${nik}`),
    callService(`${SERVICES.pendapatan}/pajak/nik/${nik}`)
  ]);

  // Check if penduduk data exists (main data)
  if (!pendudukData || !pendudukData.success) {
    reply.code(404).send({
      success: false,
      error: 'Data penduduk tidak ditemukan'
    });
    return;
  }

  // Aggregate response
  const aggregatedProfile = {
    success: true,
    nik: nik,
    timestamp: new Date().toISOString(),
    data: {
      penduduk: pendudukData.data || null,
      kesehatan: kesehatanData && kesehatanData.success ? kesehatanData.data : [],
      infrastruktur: puData && puData.success ? puData.data : [],
      pajak: pajakData && pajakData.success ? pajakData.data : null
    }
  };

  return aggregatedProfile;
});

// Individual service proxies (optional)
fastify.get('/api/penduduk/:nik', async (request, reply) => {
  const { nik } = request.params;
  const data = await callService(`${SERVICES.kependudukan}/penduduk/${nik}`);
  
  if (!data) {
    reply.code(503).send({ success: false, error: 'Service unavailable' });
    return;
  }
  
  return data;
});

fastify.get('/api/pajak/:npwp', async (request, reply) => {
  const { npwp } = request.params;
  const data = await callService(`${SERVICES.pendapatan}/pajak/${npwp}`);
  
  if (!data) {
    reply.code(503).send({ success: false, error: 'Service unavailable' });
    return;
  }
  
  return data;
});

fastify.get('/api/proyek', async (request, reply) => {
  const { nik } = request.query;
  
  if (!nik) {
    reply.code(400).send({ success: false, error: 'Parameter NIK diperlukan' });
    return;
  }
  
  const data = await callService(`${SERVICES.pu}/proyek?nik=${nik}`);
  
  if (!data) {
    reply.code(503).send({ success: false, error: 'Service unavailable' });
    return;
  }
  
  return data;
});

fastify.get('/api/rekam-medis/:nik', async (request, reply) => {
  const { nik } = request.params;
  const data = await callService(`${SERVICES.kesehatan}/rekam-medis/${nik}`);
  
  if (!data) {
    reply.code(503).send({ success: false, error: 'Service unavailable' });
    return;
  }
  
  return data;
});

// API documentation
fastify.get('/', async (request, reply) => {
  return {
    message: 'API Gateway / Enterprise Service Bus (ESB)',
    version: '1.0.0',
    documentation: {
      authentication: 'Gunakan header X-API-Key dengan salah satu key: demo-api-key-12345, test-key-67890, admin-key-abcde',
      endpoints: {
        health: 'GET /health - Health check',
        servicesHealth: 'GET /services/health - Check all services health',
        aggregator: 'GET /api/warga/:nik/profil - Aggregated profile (main feature)',
        penduduk: 'GET /api/penduduk/:nik - Data penduduk',
        pajak: 'GET /api/pajak/:npwp - Data pajak',
        proyek: 'GET /api/proyek?nik=:nik - Data proyek infrastruktur',
        rekamMedis: 'GET /api/rekam-medis/:nik - Data rekam medis'
      },
      example: {
        curl: 'curl -H "X-API-Key: demo-api-key-12345" http://localhost:8080/api/warga/3201012345678901/profil'
      }
    }
  };
});

// Start server
const start = async () => {
  try {
    const PORT = process.env.PORT || 8080;
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`API Gateway running on port ${PORT}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
