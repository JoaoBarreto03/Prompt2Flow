export type WorkflowJson = {
  nodes: {
    id: string
    label: string
    type?: 'input' | 'default' | 'condition'
  }[]
  edges: {
    source: string
    target: string
    label?: string
  }[]
}
