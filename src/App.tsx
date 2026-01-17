import { useState, useCallback, useEffect } from 'react'
import { runLLM } from './ai/ollama'
import ReactFlow, {
  Background,
  Controls,
  type Connection,
  addEdge,
  useNodesState,
  useEdgesState,
  ReactFlowProvider
} from 'reactflow'
import 'reactflow/dist/style.css'

import { buildWorkflow } from './workflow/buildWorkflow'
import type { WorkflowJson } from './workflow/types'

function FlowCanvas() {
  const [prompt, setPrompt] = useState('')
  const [workflowJson, setWorkflowJson] = useState<WorkflowJson | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const generateWorkflow = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const result = await handleGenerate(prompt)
      console.log('Generated Workflow JSON:', result)
      setWorkflowJson(result)
    } catch (err) {
      setError('Failed to generate workflow. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  async function handleGenerate(prompt: string): Promise<WorkflowJson> {
    const text = await runLLM(prompt)
    
    try {
      // Tentar parsear o JSON retornado pela LLM
      const workflow = JSON.parse(text) as WorkflowJson
      return workflow
    } catch (parseError) {
      console.error('Failed to parse LLM response:', text)
      throw new Error('Invalid workflow format from AI')
    }
  }
  const resetCanvas = () => {
    setPrompt('')
    setWorkflowJson(null)
    setNodes([])
    setEdges([])
    setError(null)
  }

  useEffect(() => {
    if (workflowJson) {
      const { nodes: newNodes, edges: newEdges } = buildWorkflow(workflowJson)
      setNodes(newNodes)
      setEdges(newEdges)
    }
  }, [workflowJson, setNodes, setEdges])

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw' }}>
      {/* LEFT */}
      <div
        style={{
          width: 320,
          padding: 20,
          borderRight: '1px solid #ddd',
          backgroundColor: '#393939ff',
          overflow: 'auto'
        }}
      >
        <h2 style={{ marginTop: 0 }}>💬 Prompt to Workflow</h2>

        <textarea
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          placeholder="Describe your workflow...&#10;&#10;Example: when user signs up, validate email, create profile, notify admin"
          style={{
            width: '91%',
            height: 200,
            padding: 12,
            fontSize: 14,
            borderRadius: 4,
            border: '1px solid #ccc',
            resize: 'vertical'
          }}
        />

        <button
          onClick={generateWorkflow}
          disabled={!prompt.trim() || loading}
          style={{
            marginTop: 12,
            width: '100%',
            padding: 12,
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: loading ? '#6c757d' : (prompt.trim() ? '#007bff' : '#a09f9fff'),
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: (prompt.trim() && !loading) ? 'pointer' : 'not-allowed',
            transition: 'background-color 0.2s'
          }}
        >
          {loading ? '⏳ Generating...' : '🚀 Generate Workflow'}
        </button>

        {workflowJson && (
          <button
            onClick={resetCanvas}
            style={{
              marginTop: 8,
              width: '100%',
              padding: 10,
              fontSize: 14,
              fontWeight: 'normal',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer'
            }}
          >
            🔄 Reset Canvas
          </button>
        )}

        {error && (
          <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f8d7da', color: '#721c24', borderRadius: 4, fontSize: 14 }}>
            ⚠️ {error}
          </div>
        )}

        {workflowJson && !error && (
          <div style={{ marginTop: 16, fontSize: 12, color: '#28a745' }}>
            ✅ Generated {workflowJson.nodes.length} nodes and {workflowJson.edges.length} edges
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div style={{ position: 'relative', flexGrow: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  )
}
