import { useState, useCallback, useEffect } from 'react'
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

import { mockAI } from './workflow/mockAI'
import { buildWorkflow } from './workflow/buildWorkflow'
import type { WorkflowJson } from './workflow/types'

function FlowCanvas() {
  const [prompt, setPrompt] = useState('')
  const [workflowJson, setWorkflowJson] = useState<WorkflowJson | null>(null)

  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  const generateWorkflow = () => {
    const result = mockAI(prompt)
    setWorkflowJson(result)
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
          disabled={!prompt.trim()}
          style={{
            marginTop: 12,
            width: '100%',
            padding: 12,
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: prompt.trim() ? '#007bff' : '#a09f9fff',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: prompt.trim() ? 'pointer' : 'not-allowed'
          }}
        >
          🚀 Generate Workflow
        </button>

        {workflowJson && (
          <div style={{ marginTop: 20, fontSize: 12, color: '#666' }}>
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
