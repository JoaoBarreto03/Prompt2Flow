export type WorkflowJson = {
  nodes: {
    id: string
    label: string
    type?: 'input' | 'default'
  }[]
  edges: [string, string][]
}
