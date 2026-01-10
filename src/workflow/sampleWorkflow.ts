export const sampleWorkflow = {
  nodes: [
    { id: 'trigger', label: 'User Signup', type: 'input' },
    { id: 'validate', label: 'Validate Email' },
    { id: 'profile', label: 'Create User Profile' },
    { id: 'notify', label: 'Notify Admin Team' }
  ],
  edges: [
    ['trigger', 'validate'] as [string, string],
    ['validate', 'profile'] as [string, string],
    ['profile', 'notify'] as [string, string]
  ]
}
