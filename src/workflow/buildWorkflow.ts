import type { Node, Edge } from 'reactflow'
import type { WorkflowJson } from './types'

export function buildWorkflow(workflow: WorkflowJson) {
  const nodes: Node[] = workflow.nodes.map((node, index) => ({
    id: node.id,
    type: node.type === 'input' ? 'input' : 'default',
    data: {
      label: node.label
    },
    position: {
      x: 250,
      y: index * 120
    },
    style: {
      width: 180,
      height: 40
    }
  }))

  const edges: Edge[] = workflow.edges.map(([source, target], index) => ({
    id: `e-${index}`,
    source,
    target,
    animated: true
  }))

  return { nodes, edges }
}
