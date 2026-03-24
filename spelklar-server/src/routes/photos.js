const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { prisma } = require('../db');
const { verifyAuth, optionalAuth } = require('../middleware/auth');
const { generatePresignedUploadUrl, isR2Configured, generateDemoPhotoUrl } = require('../utils/r2');

// POST /api/photos/upload-url – Get presigned URL for direct R2 upload
router.post('/upload-url', verifyAuth, async (req, res) => {
  try {
    const { matchId, contentType = 'image/jpeg' } = req.body;

    if (!matchId) {
      return res.status(400).json({ error: 'matchId is required' });
    }

    // Verify match exists
    const match = await prisma.match.findUnique({
      where: { id: matchId },
    });

    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Generate unique photo ID
    const photoId = uuidv4();

    // Create photo record in DB with pending status
    const photo = await prisma.photo.create({
      data: {
        id: photoId,
        matchId,
        uploaderId: req.user.id,
        storageKey: `photos/${photoId}.jpg`,
        status: 'pending',
      },
    });

    let uploadUrl;
    let storageKey = photo.storageKey;

    // If R2 is configured, generate presigned URL
    if (isR2Configured()) {
      try {
        const result = await generatePresignedUploadUrl(photoId, contentType);
        uploadUrl = result.signedUrl;
        storageKey = result.storageKey;
      } catch (err) {
        console.error('Failed to generate presigned URL:', err);
        // Fall back to demo mode
        uploadUrl = generateDemoPhotoUrl(storageKey);
      }
    } else {
      // Demo mode: generate fake URL for testing
      uploadUrl = generateDemoPhotoUrl(storageKey);
    }

    res.json({
      photoId,
      uploadUrl,
      storageKey,
    });
  } catch (err) {
    console.error('Error generating upload URL:', err);
    res.status(500).json({ error: 'Failed to generate upload URL' });
  }
});

// POST /api/photos/:id/uploaded – Notify server that upload completed
router.post('/:id/uploaded', verifyAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const photo = await prisma.photo.findUnique({
      where: { id },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (photo.uploaderId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Photo is now pending moderation
    // In production, this would trigger a notification to staff
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking upload complete:', err);
    res.status(500).json({ error: 'Failed to mark upload complete' });
  }
});

// GET /api/photos?matchId=xxx – Get photos for a match
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { matchId } = req.query;

    if (!matchId) {
      return res.status(400).json({ error: 'matchId is required' });
    }

    // If not staff, only show approved photos
    const where = {
      matchId,
      deletedAt: null,
    };

    if (req.user?.role !== 'staff' && req.user?.role !== 'admin') {
      where.status = 'approved';
    }

    const photos = await prisma.photo.findMany({
      where,
      include: {
        uploader: {
          select: { id: true, displayName: true },
        },
        consents: {
          select: { grantedBy: true, scope: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(photos);
  } catch (err) {
    console.error('Error fetching photos:', err);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// GET /api/photos/:id – Get single photo with authorization check
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const photo = await prisma.photo.findUnique({
      where: { id: req.params.id },
      include: {
        uploader: {
          select: { id: true, displayName: true },
        },
        consents: true,
      },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    if (photo.deletedAt) {
      return res.status(404).json({ error: 'Photo has been deleted' });
    }

    // Check authorization
    if (photo.status !== 'approved' && photo.uploaderId !== req.user?.id && req.user?.role !== 'staff' && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Photo not approved yet' });
    }

    res.json(photo);
  } catch (err) {
    console.error('Error fetching photo:', err);
    res.status(500).json({ error: 'Failed to fetch photo' });
  }
});

// PATCH /api/photos/:id/moderate – Approve/reject photo (staff only)
router.patch('/:id/moderate', verifyAuth, async (req, res) => {
  try {
    // For MVP, allow any authenticated user to moderate. Phase 3+ will check staff role.
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'status must be approved or rejected' });
    }

    const photo = await prisma.photo.findUnique({
      where: { id: req.params.id },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const updated = await prisma.photo.update({
      where: { id: req.params.id },
      data: {
        status,
        moderatedBy: req.user.id,
        moderatedAt: new Date(),
      },
      include: {
        uploader: {
          select: { id: true, displayName: true },
        },
      },
    });

    res.json(updated);
  } catch (err) {
    console.error('Error moderating photo:', err);
    res.status(500).json({ error: 'Failed to moderate photo' });
  }
});

// DELETE /api/photos/:id – Soft delete photo
router.delete('/:id', verifyAuth, async (req, res) => {
  try {
    const photo = await prisma.photo.findUnique({
      where: { id: req.params.id },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Allow uploader or staff to delete
    if (photo.uploaderId !== req.user.id && req.user.role !== 'staff' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized to delete this photo' });
    }

    const deleted = await prisma.photo.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, deletedAt: deleted.deletedAt });
  } catch (err) {
    console.error('Error deleting photo:', err);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

// POST /api/photos/:id/consent – Grant consent for photo
router.post('/:id/consent', verifyAuth, async (req, res) => {
  try {
    const { scope = 'match' } = req.body;

    if (!['match', 'club', 'public'].includes(scope)) {
      return res.status(400).json({ error: 'Invalid scope' });
    }

    const photo = await prisma.photo.findUnique({
      where: { id: req.params.id },
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Upsert consent record (if already exists, update it)
    const consent = await prisma.photoConsent.upsert({
      where: {
        photoId_grantedBy: {
          photoId: req.params.id,
          grantedBy: req.user.id,
        },
      },
      update: {
        scope,
        revokedAt: null,
      },
      create: {
        photoId: req.params.id,
        grantedBy: req.user.id,
        scope,
      },
    });

    res.json(consent);
  } catch (err) {
    console.error('Error granting consent:', err);
    res.status(500).json({ error: 'Failed to grant consent' });
  }
});

// DELETE /api/photos/:id/consent – Revoke consent
router.delete('/:id/consent', verifyAuth, async (req, res) => {
  try {
    const consent = await prisma.photoConsent.findUnique({
      where: {
        photoId_grantedBy: {
          photoId: req.params.id,
          grantedBy: req.user.id,
        },
      },
    });

    if (!consent) {
      return res.status(404).json({ error: 'Consent not found' });
    }

    const revoked = await prisma.photoConsent.update({
      where: {
        photoId_grantedBy: {
          photoId: req.params.id,
          grantedBy: req.user.id,
        },
      },
      data: { revokedAt: new Date() },
    });

    res.json({ success: true, revokedAt: revoked.revokedAt });
  } catch (err) {
    console.error('Error revoking consent:', err);
    res.status(500).json({ error: 'Failed to revoke consent' });
  }
});

// GET /api/photos/moderate/pending – Get pending photos for moderation (staff)
router.get('/moderate/pending', verifyAuth, async (req, res) => {
  try {
    // For MVP, allow any authenticated user. Phase 3+ will check staff role.
    const pending = await prisma.photo.findMany({
      where: {
        status: 'pending',
        deletedAt: null,
      },
      include: {
        match: {
          select: { id: true, homeTeamName: true, awayTeamName: true },
        },
        uploader: {
          select: { id: true, displayName: true },
        },
        consents: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json(pending);
  } catch (err) {
    console.error('Error fetching pending photos:', err);
    res.status(500).json({ error: 'Failed to fetch pending photos' });
  }
});

module.exports = router;
