import type { Node, Edge } from 'reactflow'

type WorkflowJson = {
  nodes: { id: string; label: string; type?: string }[]
  edges: [string, string][]
}

export function buildWorkflow(workflow: WorkflowJson) {
  const nodes: Node[] = workflow.nodes.map((node, index) => ({
    id: node.id,
    type: node.type || 'default',
    data: { label: node.label },
    position: {
      x: 250,
      y: index * 120
    }
  }))

  const edges: Edge[] = workflow.edges.map(([source, target], index) => ({
    id: `e${source}-${target}-${index}`,
    source,
    target,
    animated: true
  }))

  return { nodes, edges }
}