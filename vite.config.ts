import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';
import { GoogleGenAI } from '@google/genai';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'engine-advisory-api',
        configureServer(server) {
          server.middlewares.use('/api/recommendation', (req: any, res: any, next: any) => {
            if (req.method !== 'POST') return next();

            let body = '';
            req.on('data', (chunk: any) => {
              body += chunk;
            });

            req.on('end', async () => {
              res.setHeader('Content-Type', 'application/json');
              let payload: any = {};
              try {
                payload = JSON.parse(body || '{}');
              } catch (parseErr) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
              }

              try {
                const apiKey = process.env.GEMINI_API_KEY;
                if (!apiKey) {
                  res.statusCode = 200;
                  return res.end(
                    JSON.stringify({
                      advisory:
                        `Telemetry Diagnostics Protocol:\n• Operational State: ${payload.stateName ?? 'Risk State'} (State ${payload.markovState ?? 'C'})\n• Expected Duty Life: MTTF = ${payload.mttf ?? 0} cycles\n• Deteriorating Channel(s): ${payload.topDeterioratingSensors?.join(', ') || 'Within nominal baseline'}\n• Immediate Shop Remediation: Perform dynamic pressure test on fuel rail delivery unit, inspect lubrication circuit relief valve, and calibrate cooling circuit thermostat valve per SAE J1939 fault response guidelines.`,
                      source: 'deterministic_protocol',
                    })
                  );
                }

                const ai = new GoogleGenAI({
                  apiKey,
                  httpOptions: {
                    headers: {
                      'User-Agent': 'aistudio-build',
                    },
                  },
                });

                const prompt = `You are a Senior Automotive Reliability Engineer & Mechanical Diagnostician at Dayananda Sagar University (DSU) ASSP Laboratory.
Analyze this live automotive engine telemetry data:
- Operating Condition: ${payload.condition === 1 ? 'HEALTHY / NORMAL' : 'FAULTY / MAINTENANCE REQUIRED'}
- Probability of Healthy State: ${(payload.pHealthy * 100).toFixed(2)}%
- Assigned Stochastic Markov State: State ${payload.markovState} (${payload.stateName})
- Mean Time To Failure (MTTF): ${payload.mttf} duty cycles
- Active Sensor Telemetry:
  * Engine RPM: ${payload.sensors?.rpm} RPM (Normal mean: 788 RPM, baseline healthy ~701 RPM)
  * Lubricating Oil Pressure: ${payload.sensors?.lubOilPressure} bar (Normal mean: 3.29 bar)
  * Fuel Pressure: ${payload.sensors?.fuelPressure} bar (Normal mean: 6.65 bar)
  * Coolant Pressure: ${payload.sensors?.coolantPressure} bar (Normal mean: 2.37 bar)
  * Lubricating Oil Temp: ${payload.sensors?.lubOilTemp} °C (Normal mean: 77.68 °C)
  * Coolant Temp: ${payload.sensors?.coolantTemp} °C (Normal mean: 78.42 °C)
- Primary Deteriorating Factors: ${payload.topDeterioratingSensors?.join(', ') || 'Nominal readings'}

Provide a concise, professional engineering diagnostic briefing (under 180 words) structured as:
1. Root Subsystem Analysis: Physical explanation of why the detected sensor anomalies increase failure risk.
2. Immediate Shop Remediation: Concrete physical actions (e.g. pressure regulator calibration, heat exchanger flush, valve inspection).
3. Critical Prevention Protocol: Measures to maximize Mean Time To Failure.`;

                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents: prompt,
                  config: {
                    systemInstruction:
                      'You are a senior automotive reliability engineer providing concise, rigorous diagnostic recommendations based on engine sensor telemetry and stochastic Markov deterioration states.',
                  },
                });

                const text = response.text || 'No recommendation generated.';
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    advisory: text,
                    source: 'gemini-3.8-flash',
                  })
                );
              } catch (err: any) {
                console.error('Gemini API error in /api/recommendation:', err);
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    advisory:
                      `Engineering Advisory: State ${payload.markovState ?? 'C'} (${payload.stateName ?? 'Risk'}) detected with MTTF of ${payload.mttf ?? 0} cycles. Outlier sensors: ${payload.topDeterioratingSensors?.join(', ') || 'telemetry drift'}. Check fuel rail pressure regulation and verify lube oil viscosity and cooling circuit backpressure.`,
                    source: 'deterministic_fallback',
                    notice: err.message || 'Gemini service unreachable',
                  })
                );
              }
            });
          });

          // Multi-turn Gemini chatbot endpoint for DSU ASSP Diagnostic Copilot
          server.middlewares.use('/api/chat', (req: any, res: any, next: any) => {
            if (req.method !== 'POST') return next();

            let body = '';
            req.on('data', (chunk: any) => {
              body += chunk;
            });

            req.on('end', async () => {
              res.setHeader('Content-Type', 'application/json');
              let payload: any = {};
              try {
                payload = JSON.parse(body || '{}');
              } catch (parseErr) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
              }

              const messages = payload.messages || [];
              const apiKey = process.env.GEMINI_API_KEY;
              if (!apiKey) {
                res.statusCode = 200;
                return res.end(
                  JSON.stringify({
                    reply:
                      "As the DSU ASSP Advisor, I can explain that our model uses Newton-Raphson standardized logistic regression (85.21% test accuracy) and a 4-state absorbing Markov chain with MTTF = 12.08 cycles for healthy engines. What aspect of the mathematical formulation or sensor telemetry would you like to explore?",
                    source: 'deterministic_advisor',
                  })
                );
              }

              try {
                const ai = new GoogleGenAI({
                  apiKey,
                  httpOptions: {
                    headers: {
                      'User-Agent': 'aistudio-build',
                    },
                  },
                });

                const contents = messages.map((m: any) => ({
                  role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
                  parts: [{ text: m.content }],
                }));

                const response = await ai.models.generateContent({
                  model: 'gemini-3.8-flash',
                  contents,
                  config: {
                    systemInstruction:
                      "You are the Senior Reliability Engineer and ASSP Course Advisor at Dayananda Sagar University (DSU). You assist students and evaluators reviewing the 'Automobile Engine Health Deterioration & Stochastic State Modeling' project. The project models 15,206 clean Kaggle automotive telemetry records using standardized Newton-Raphson logistic regression (85.21% accuracy, 0.9372 ROC-AUC) and a 4-state absorbing Markov chain with fundamental matrix MTTF calculations and 91.27% ergodic repair availability. Answer authoritatively, mathematically accurately, and concisely. Keep responses under 200 words.",
                  },
                });

                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    reply: response.text || 'No response generated.',
                    source: 'gemini-3.8-flash',
                  })
                );
              } catch (err: any) {
                console.error('Gemini chat error in /api/chat:', err);
                res.statusCode = 200;
                res.end(
                  JSON.stringify({
                    reply:
                      "Advisor Note: Our statistical proofs show that Engine RPM has the strongest negative impact (t = -79.86, beta = -2.71), while Fuel Pressure provides the primary stabilization effect (odds ratio = 4.01). Which aspect of the CAT-3 benchmarks or Markov matrices would you like to review?",
                    source: 'fallback_advisor',
                    notice: err.message,
                  })
                );
              }
            });
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
