const axios = require("axios");

const a2Agent = {
  api: {
    base: "http://161.97.152.192:8002",
    endpoint: {
      completions: "/v1/chat/completions",
    },
  },

  headers: {
   "user-agent": "NB Android/1.0.0",
    "content-type": "application/json",
    "origin": "http://161.97.152.192:8002",
    "referer": "http://161.97.152.192:8002/"
  },

  valid: {
    models: [
      "deepseek-coder-v2",
      "llama3.1:8b",
      "qwen2.5:1.5b",
      "MiniMax-M2",
      "MiniMax-M2-Stable",
    ],
    stream: [true, false],
    roles: ["system", "user", "assistant", "tool"],
  },

  chat: async function ({
    messages = [],
    model = "MiniMax-M2",
    stream = false,
    temperature = 0.7,
    max_tokens = null,
    retries = 2,
  } = {}) {
    if (!Array.isArray(messages) || messages.length === 0) {
      return {
        success: false,
        code: 400,
        result: {
          error: "Array messages nya kudu diisi bree, kagak boleh kosong yak.. 🤌🏻",
        },
      };
    }

    if (!this.valid.models.includes(model)) {
      return {
        success: false,
        code: 400,
        result: {
          error: `Modelnya kagak valid bree.. lu pilih aja salah satunya.. ${this.valid.models.join(", ")}`,
        },
      };
    }

    if (!this.valid.stream.includes(stream)) {
      return {
        success: false,
        code: 400,
        result: {
          error: "Streamnya cuman bisa true atau false doang njirr 🗿",
        },
      };
    }

    for (const msg of messages) {
      if (!msg.role || !this.valid.roles.includes(msg.role)) {
        return {
          success: false,
          code: 400,
          result: {
            error: `Role "${msg.role || '🤌🏻'}" mah kagak valid bree.. lu pilih aja salah satunya.... ${this.valid.roles.join(", ")}`,
          },
        };
      }

      if (
        !msg.content ||
        (typeof msg.content !== "string" && !Array.isArray(msg.content))
      ) {
        return {
          success: false,
          code: 400,
          result: {
            error: "Messagenya kudu punya content (string atau array) bree.. 🤌🏻",
          },
        };
      }
    }

    const payload = { model, messages, stream, temperature };
    if (max_tokens > 0) {
      payload.max_tokens = max_tokens;
    }

    const url = `${this.api.base}${this.api.endpoint.completions}`;
    
    const startTime = Date.now();
    let attempt = 0;
    while (attempt <= retries) {
      try {
        const response = await axios.post(url, payload, {
          headers: this.headers,
          timeout: 120_000,
        });

        const data = response.data;
        const choice = data.choices?.[0];

        if (!choice?.message?.content) {
          return {
            success: false,
            code: 500,
            result: {
              error: "Kagak ada response apa2 bree... 😂",
            },
          };
        }

        return {
          success: true,
          code: 200,
          result: {
            id: data.id,
            content: choice.message.content.trim(),
            role: choice.message.role || "assistant",
            finish_reason: choice.finish_reason,
            usage: data.usage || null,
            created: data.created,
            model: data.model,
            duration_ms: Date.now() - startTime,
            pricing: data.pricing || null,
          },
        };
      } catch (error) {
        attempt++;

        const status = error.response?.status;
        const data = error.response?.data;
        const isTimeout = error.code === "ECONNABORTED" || error.message?.includes("timeout");
        const isNetworkError = !error.response;

        if (status === 500 && data) {
          let pe = data;
          if (typeof data === "string") {
            try {
              pe = JSON.parse(data);
            } catch {
            }
          }

          if (typeof pe === "object" && pe !== null) {
            const err = pe.error?.message || "";
            const iyup =
              err.includes("insufficient balance") ||
              err.includes("1008") ||
              (pe.error?.type === "api_error" && pe.error?.code === 1008);

            if (iyup) {
              return {
                success: false,
                code: 1008,
                result: {
                  error: "Saldonya kagak cukup bree 😂",
                  request_id: pe.request_id || null
                },
              };
            }
          }
        }

        if (attempt <= retries && (isTimeout || isNetworkError || status >= 500)) {
          const delay = 1000 * attempt;
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }
        
        return {
          success: false,
          code: error.code || status || 500,
          result: {
            error: isTimeout
              ? "Timeout bree..."
              : error.message,
            detail: data ? String(data).substring(0, 200) : null,
          },
        };
      }
    }
  },
};

module.exports = { a2Agent };