import { useState, useCallback } from 'react'
import ReactFlow, { 
  Background, 
  Controls, 
  type Node, 
  type Edge,
  addEdge,
  useNodesState,
  useEdgesState,
  type Connection
} from 'reactflow'
import 'reactflow/dist/style.css'

import { sampleWorkflow } from './workflow/sampleWorkflow'
import { buildWorkflow } from './workflow/buildWorkflow'

export default function App() {
  const { nodes: initialNodes, edges: initialEdges } = buildWorkflow(sampleWorkflow)
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
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
  )
}
