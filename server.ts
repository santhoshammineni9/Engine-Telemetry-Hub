import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// API route for on-demand Gemini maintenance advisory
app.post('/api/recommendation', async (req, res) => {
  const payload = req.body || {};
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        advisory:
          `Telemetry diagnostics indicate Markov State ${payload.markovState ?? 'C'} (${payload.stateName ?? 'Risk'}). Primary deteriorating factor(s): ${payload.topDeterioratingSensors?.join(', ') || 'sensors out of nominal baseline'}. Recommendation: Inspect fuel metering unit, oil pressure relief valve, and cooling jacket flow rate per SAE J1939 fault response guidelines.`,
        source: 'deterministic_protocol',
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const prompt = `You are dino, a Senior Automotive Reliability Engineer & Mechanical Diagnostician.
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
          'You are dino, a senior automotive reliability engineer providing concise, rigorous diagnostic recommendations based on engine sensor telemetry and stochastic Markov deterioration states.',
      },
    });

    res.json({
      advisory: response.text || 'No recommendation generated.',
      source: 'gemini-3.8-flash',
    });
  } catch (err: any) {
    console.error('Server error handling /api/recommendation:', err);
    res.json({
      advisory:
        `Engineering Advisory: State ${payload.markovState ?? 'C'} (${payload.stateName ?? 'Risk'}) detected with MTTF of ${payload.mttf ?? 0} cycles. Outlier sensors: ${payload.topDeterioratingSensors?.join(', ') || 'telemetry drift'}. Check fuel rail pressure regulation and verify lube oil viscosity and cooling circuit backpressure.`,
      source: 'deterministic_fallback',
      notice: err.message || 'Gemini service unreachable',
    });
  }
});

// API route for multi-turn Gemini diagnostic chat
app.post('/api/chat', async (req, res) => {
  const payload = req.body || {};
  const messages = payload.messages || [];
  const requestedModel = payload.model || 'gemini-3.8-flash';
  const roleType = payload.roleType || 'diagnostician'; // 'diagnostician' | 'statistician' | 'shop_mechanic'
  
  // Valid active models from @google/genai guidelines
  const validModels = ['gemini-3.8-flash', 'gemini-3.1-flash-lite', 'gemini-4-argon', 'gemini-4-carbon'];
  const modelToUse = validModels.includes(requestedModel) ? requestedModel : 'gemini-3.8-flash';

  const roleInstructions: Record<string, string> = {
    diagnostician:
      "You are Dino Chatbot, a Senior Automotive Reliability Engineer and Mechanical Diagnostician. You assist users reviewing the 'Automobile Engine Health Deterioration & Stochastic State Modeling' project. The project models 15,206 clean automotive telemetry records using standardized Newton-Raphson logistic regression (85.21% accuracy, 0.9372 ROC-AUC) and a 4-state absorbing Markov chain with fundamental matrix MTTF calculations and 91.27% ergodic repair availability. Answer authoritatively, mathematically accurately, and concisely. Keep responses under 200 words.",
    statistician:
      "You are Dino Chatbot in Applied Stochastic Statistician mode. Specialize in rigorous mathematical explanations: Newton-Raphson IRLS derivation, Welch's unequal-variance t-tests (t = -79.86 for RPM, p < 1e-300), absorbing Markov transition matrices P_abs, continuous generator Q = P - I, and fundamental matrix N = (I - Q)⁻¹ calculating Mean Time to Failure (MTTF). Keep responses under 200 words.",
    shop_mechanic:
      "You are Dino Chatbot in Master Dyno Shop Technician mode. Focus on mechanical engineering realities: cylinder head thermal wear, reciprocating piston dynamics, oil pressure relief valves, fuel injector rail pressure drops, and cooling circuit cavitation. Provide concrete shop remediation steps. Keep responses under 200 words.",
  };

  const systemInstruction = roleInstructions[roleType] || roleInstructions.diagnostician;

  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        reply:
          "Hello! I am Dino Chatbot. Our model uses Newton-Raphson standardized logistic regression (85.21% test accuracy) and a 4-state absorbing Markov chain with MTTF = 12.08 cycles for healthy engines. What aspect of the mathematical formulation or sensor telemetry would you like to explore?",
        source: 'deterministic_advisor',
        model: modelToUse,
      });
    }

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
      model: modelToUse,
      contents,
      config: {
        systemInstruction,
      },
    });

    res.json({
      reply: response.text || 'No response generated.',
      source: modelToUse,
      model: modelToUse,
    });
  } catch (err: any) {
    console.error('Gemini chat error in server /api/chat:', err);
    res.json({
      reply:
        "Dino Chatbot: Our statistical proofs show that Engine RPM has the strongest negative impact (t = -79.86, beta = -2.71), while Fuel Pressure provides the primary stabilization effect (odds ratio = 4.01). Which aspect of the benchmarks or Markov matrices would you like to review?",
      source: 'fallback_advisor',
      notice: err.message,
      model: modelToUse,
    });
  }
});

// Serve Vite build in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Engine Telemetry Server running on port ${PORT}`);
});
