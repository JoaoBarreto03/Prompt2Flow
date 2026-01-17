export async function runLLM(prompt: string): Promise<string> {
  const formattedPrompt = buildPrompt(prompt)
  const res = await fetch('http://127.0.0.1:11434/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'llama3',
      prompt: formattedPrompt,
      stream: false
    })
  })

  const data = await res.json()
  return data.response
}

export function buildPrompt(userText: string): string {
  // Detectar idioma do input
  const isPortuguese = /[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(userText) || 
                       /\b(quando|se|então|usuário|sistema|criar|validar|verificar|enviar|processar)\b/i.test(userText)
  
  const languageInstruction = isPortuguese 
    ? "RESPONDA EXCLUSIVAMENTE EM PORTUGUÊS BRASILEIRO. Todos os labels de nodes e edges DEVEM estar em português."
    : "RESPOND EXCLUSIVELY IN ENGLISH. All node and edge labels MUST be in English."

  return `
    ${languageInstruction}

    You are an expert system that converts human workflow descriptions into JSON representations of business processes.

    Your task is to analyze the user's description and create a realistic workflow with proper business logic, including:
    - Sequential steps (one after another)
    - Conditional branches (decisions that split into different paths)
    - Parallel actions when appropriate
    
    Important Guidelines:
    1. DO NOT simply repeat the user's exact words - interpret the intent and create professional, clear node labels
    2. Identify decision points and create conditional nodes where choices need to be made
    3. Add realistic intermediate steps that would occur in a real business process
    4. Use clear, action-oriented labels
    5. For conditions, label the edges to show different outcomes
    6. ${isPortuguese ? 'TODOS os labels DEVEM estar em PORTUGUÊS' : 'ALL labels MUST be in ENGLISH'}

    JSON Schema:
    {
      "nodes": [
        {
          "id": string (unique identifier),
          "label": string (clear, professional description ${isPortuguese ? 'EM PORTUGUÊS' : 'IN ENGLISH'}),
          "type": "input" | "default" | "condition"
        }
      ],
      "edges": [
        {
          "source": string (source node id),
          "target": string (target node id),
          "label"?: string (for conditional paths ${isPortuguese ? 'EM PORTUGUÊS' : 'IN ENGLISH'})
        }
      ]
    }

    Node Types:
    - "input": Starting point of the workflow (first node only)
    - "default": Regular action or process step
    - "condition": Decision point that branches into multiple paths

    Rules:
    - Return ONLY valid JSON, no explanations or markdown
    - IDs must be unique (e.g., "node-1", "node-2", "cond-1")
    - Every edge must reference existing node IDs
    - Conditional nodes must have at least 2 outgoing edges with different labels
    - Create realistic workflows with proper business logic

    ${isPortuguese ? `
    Exemplo em Português:
    Entrada: "processo de cadastro"
    
    {
      "nodes": [
        { "id": "inicio", "label": "Usuário Envia Formulário", "type": "input" },
        { "id": "valida-email", "label": "Validar Formato do Email", "type": "condition" },
        { "id": "verifica-existe", "label": "Verificar se Email Existe", "type": "condition" },
        { "id": "criar-conta", "label": "Criar Conta do Usuário", "type": "default" },
        { "id": "enviar-email", "label": "Enviar Email de Verificação", "type": "default" },
        { "id": "erro-invalido", "label": "Mostrar Erro de Email Inválido", "type": "default" },
        { "id": "erro-existe", "label": "Mostrar Erro de Email Existente", "type": "default" }
      ],
      "edges": [
        { "source": "inicio", "target": "valida-email" },
        { "source": "valida-email", "target": "verifica-existe", "label": "Válido" },
        { "source": "valida-email", "target": "erro-invalido", "label": "Inválido" },
        { "source": "verifica-existe", "target": "criar-conta", "label": "Novo" },
        { "source": "verifica-existe", "target": "erro-existe", "label": "Existe" },
        { "source": "criar-conta", "target": "enviar-email" }
      ]
    }
    ` : `
    Example in English:
    Input: "user registration"
    
    {
      "nodes": [
        { "id": "start", "label": "User Submits Form", "type": "input" },
        { "id": "validate", "label": "Validate Email Format", "type": "condition" },
        { "id": "check-exists", "label": "Check if Email Exists", "type": "condition" },
        { "id": "create-account", "label": "Create User Account", "type": "default" },
        { "id": "send-email", "label": "Send Verification Email", "type": "default" },
        { "id": "error-invalid", "label": "Show Invalid Email Error", "type": "default" },
        { "id": "error-exists", "label": "Show Email Exists Error", "type": "default" }
      ],
      "edges": [
        { "source": "start", "target": "validate" },
        { "source": "validate", "target": "check-exists", "label": "Valid" },
        { "source": "validate", "target": "error-invalid", "label": "Invalid" },
        { "source": "check-exists", "target": "create-account", "label": "New" },
        { "source": "check-exists", "target": "error-exists", "label": "Exists" },
        { "source": "create-account", "target": "send-email" }
      ]
    }
    `}

    Now analyze this user description and create a professional workflow:
    """
    ${userText}
    """
    `
}
