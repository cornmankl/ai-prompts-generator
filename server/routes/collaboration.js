const express = require('express')
const { v4: uuidv4 } = require('uuid')
const router = express.Router()

// Mock collaboration data
const collaborations = [
  {
    id: '1',
    promptId: '1',
    participants: [
      { id: '1', name: 'John Doe', email: 'john@example.com', role: 'owner', joinedAt: new Date('2024-01-15') },
      { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'editor', joinedAt: new Date('2024-01-16') }
    ],
    permissions: {
      canEdit: ['1', '2'],
      canComment: ['1', '2'],
      canInvite: ['1']
    },
    comments: [
      {
        id: '1',
        userId: '2',
        userName: 'Jane Smith',
        content: 'Great prompt! I suggest adding more specific examples.',
        timestamp: new Date('2024-01-16T10:30:00Z'),
        replies: [
          {
            id: '2',
            userId: '1',
            userName: 'John Doe',
            content: 'Good point! I\'ll add some examples.',
            timestamp: new Date('2024-01-16T11:00:00Z')
          }
        ]
      }
    ],
    changes: [
      {
        id: '1',
        userId: '2',
        userName: 'Jane Smith',
        type: 'edit',
        description: 'Added examples section',
        timestamp: new Date('2024-01-16T14:30:00Z'),
        diff: '+ Added 3 code examples for better clarity'
      }
    ],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-16T14:30:00Z')
  }
]

// Get collaboration by prompt ID
router.get('/prompt/:promptId', (req, res) => {
  const collaboration = collaborations.find(c => c.promptId === req.params.promptId)
  if (!collaboration) {
    return res.status(404).json({ error: 'Collaboration not found' })
  }
  
  res.json(collaboration)
})

// Create collaboration
router.post('/', (req, res) => {
  try {
    const { promptId, participants, permissions } = req.body
    
    const newCollaboration = {
      id: uuidv4(),
      promptId,
      participants: participants || [],
      permissions: permissions || {
        canEdit: [],
        canComment: [],
        canInvite: []
      },
      comments: [],
      changes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    collaborations.push(newCollaboration)
    res.status(201).json(newCollaboration)
  } catch (error) {
    console.error('Create collaboration error:', error)
    res.status(500).json({ error: 'Failed to create collaboration' })
  }
})

// Add participant to collaboration
router.post('/:id/participants', (req, res) => {
  try {
    const collaboration = collaborations.find(c => c.id === req.params.id)
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' })
    }
    
    const { userId, userName, userEmail, role = 'viewer' } = req.body
    
    const participant = {
      id: userId,
      name: userName,
      email: userEmail,
      role,
      joinedAt: new Date()
    }
    
    collaboration.participants.push(participant)
    collaboration.updatedAt = new Date()
    
    res.json(participant)
  } catch (error) {
    console.error('Add participant error:', error)
    res.status(500).json({ error: 'Failed to add participant' })
  }
})

// Remove participant from collaboration
router.delete('/:id/participants/:userId', (req, res) => {
  try {
    const collaboration = collaborations.find(c => c.id === req.params.id)
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' })
    }
    
    const participantIndex = collaboration.participants.findIndex(p => p.id === req.params.userId)
    if (participantIndex === -1) {
      return res.status(404).json({ error: 'Participant not found' })
    }
    
    collaboration.participants.splice(participantIndex, 1)
    collaboration.updatedAt = new Date()
    
    res.json({ message: 'Participant removed successfully' })
  } catch (error) {
    console.error('Remove participant error:', error)
    res.status(500).json({ error: 'Failed to remove participant' })
  }
})

// Add comment
router.post('/:id/comments', (req, res) => {
  try {
    const collaboration = collaborations.find(c => c.id === req.params.id)
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' })
    }
    
    const { userId, userName, content, parentId } = req.body
    
    const comment = {
      id: uuidv4(),
      userId,
      userName,
      content,
      timestamp: new Date(),
      replies: []
    }
    
    if (parentId) {
      // Add as reply
      const parentComment = collaboration.comments.find(c => c.id === parentId)
      if (parentComment) {
        parentComment.replies.push(comment)
      } else {
        return res.status(404).json({ error: 'Parent comment not found' })
      }
    } else {
      // Add as top-level comment
      collaboration.comments.push(comment)
    }
    
    collaboration.updatedAt = new Date()
    
    res.status(201).json(comment)
  } catch (error) {
    console.error('Add comment error:', error)
    res.status(500).json({ error: 'Failed to add comment' })
  }
})

// Update comment
router.put('/:id/comments/:commentId', (req, res) => {
  try {
    const collaboration = collaborations.find(c => c.id === req.params.id)
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' })
    }
    
    const { content } = req.body
    
    // Find comment in top-level comments
    let comment = collaboration.comments.find(c => c.id === req.params.commentId)
    
    if (!comment) {
      // Find comment in replies
      for (const topComment of collaboration.comments) {
        comment = topComment.replies.find(r => r.id === req.params.commentId)
        if (comment) break
      }
    }
    
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' })
    }
    
    comment.content = content
    comment.updatedAt = new Date()
    collaboration.updatedAt = new Date()
    
    res.json(comment)
  } catch (error) {
    console.error('Update comment error:', error)
    res.status(500).json({ error: 'Failed to update comment' })
  }
})

// Delete comment
router.delete('/:id/comments/:commentId', (req, res) => {
  try {
    const collaboration = collaborations.find(c => c.id === req.params.id)
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' })
    }
    
    // Find and remove comment from top-level comments
    let commentIndex = collaboration.comments.findIndex(c => c.id === req.params.commentId)
    
    if (commentIndex !== -1) {
      collaboration.comments.splice(commentIndex, 1)
    } else {
      // Find and remove comment from replies
      for (const topComment of collaboration.comments) {
        const replyIndex = topComment.replies.findIndex(r => r.id === req.params.commentId)
        if (replyIndex !== -1) {
          topComment.replies.splice(replyIndex, 1)
          break
        }
      }
    }
    
    collaboration.updatedAt = new Date()
    
    res.json({ message: 'Comment deleted successfully' })
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ error: 'Failed to delete comment' })
  }
})

// Add change log entry
router.post('/:id/changes', (req, res) => {
  try {
    const collaboration = collaborations.find(c => c.id === req.params.id)
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' })
    }
    
    const { userId, userName, type, description, diff } = req.body
    
    const change = {
      id: uuidv4(),
      userId,
      userName,
      type,
      description,
      diff,
      timestamp: new Date()
    }
    
    collaboration.changes.push(change)
    collaboration.updatedAt = new Date()
    
    res.status(201).json(change)
  } catch (error) {
    console.error('Add change error:', error)
    res.status(500).json({ error: 'Failed to add change' })
  }
})

// Get change history
router.get('/:id/changes', (req, res) => {
  const collaboration = collaborations.find(c => c.id === req.params.id)
  if (!collaboration) {
    return res.status(404).json({ error: 'Collaboration not found' })
  }
  
  res.json(collaboration.changes)
})

// Update permissions
router.put('/:id/permissions', (req, res) => {
  try {
    const collaboration = collaborations.find(c => c.id === req.params.id)
    if (!collaboration) {
      return res.status(404).json({ error: 'Collaboration not found' })
    }
    
    const { canEdit, canComment, canInvite } = req.body
    
    if (canEdit) collaboration.permissions.canEdit = canEdit
    if (canComment) collaboration.permissions.canComment = canComment
    if (canInvite) collaboration.permissions.canInvite = canInvite
    
    collaboration.updatedAt = new Date()
    
    res.json(collaboration.permissions)
  } catch (error) {
    console.error('Update permissions error:', error)
    res.status(500).json({ error: 'Failed to update permissions' })
  }
})

module.exports = router
