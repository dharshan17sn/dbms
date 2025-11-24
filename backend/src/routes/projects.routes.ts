// src/routes/projects.routes.ts
import { Router } from "express";
import prisma from "../db/prismaClient";

const router = Router();

// Get all roles
router.get("/roles", async (req, res) => {
  try {
    const roles = await prisma.role.findMany({
      orderBy: { name: "asc" }
    });
    res.json(roles);
  } catch (error) {
    console.error("Get roles error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// List all projects
router.get("/", async (req, res) => {
  // @ts-ignore
  const userId = req.user?.userId;

  try {
    const projects = await prisma.project.findMany({
      include: {
        owner: { select: { id: true, displayName: true, role: true } },
        _count: { select: { comments: true, upvotes: true, members: true } },
        roleRequirements: {
          include: {
            role: { select: { id: true, name: true } }
          }
        },
        members: {
          where: { userId },
          select: { userId: true, isOwner: true }
        },
        ...(userId
          ? {
            joinRequests: {
              where: { requesterId: userId, status: "PENDING" },
              select: { id: true, status: true }
            }
          }
          : {})
      },
      orderBy: { createdAt: "desc" }
    });
    res.json(projects);
  } catch (error) {
    console.error("List projects error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create new project
router.post("/", async (req, res) => {
  // @ts-ignore
  const userId = req.user?.userId;
  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const {
      title,
      description,
      type,
      visibility,
      videoUrl,
      imageUrl,
      gitUrl,
      teamOpenings,
      status,
      isTeam,
      roleRequirements
    } = req.body;

    if (!title || !type) {
      res.status(400).json({ error: "Missing title or type" });
      return;
    }

    const project = await prisma.project.create({
      data: {
        title,
        description,
        type,
        visibility,
        ownerId: userId,
        videoUrl,
        imageUrl,
        gitUrl,
        isTeam: isTeam || false,
        teamOpenings: teamOpenings || 0,
        status: status || "OPEN"
      }
    });

    // If creating as team, add owner as first member and create role requirements
    if (isTeam) {
      await prisma.projectMember.create({
        data: {
          projectId: project.id,
          userId,
          isOwner: true
        }
      });

      // Create role requirements if provided
      if (roleRequirements && Array.isArray(roleRequirements)) {
        for (const roleReq of roleRequirements) {
          await prisma.teamRoleRequirement.create({
            data: {
              projectId: project.id,
              roleId: roleReq.roleId,
              count: roleReq.count || 1
            }
          });
        }
      }
    }

    res.status(201).json(project);
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get project details
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, displayName: true, email: true, role: true }
        },
        members: {
          include: {
            user: { select: { id: true, displayName: true } },
            role: { select: { id: true, name: true } }
          }
        },
        roleRequirements: {
          include: {
            role: { select: { id: true, name: true } }
          }
        },
        tasks: true,
        comments: {
          include: {
            user: { select: { id: true, displayName: true } }
          },
          orderBy: { createdAt: "desc" }
        }
      }
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    res.json(project);
  } catch (error) {
    console.error("Get project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  // @ts-ignore
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Check if user owns the project
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true }
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    if (project.ownerId !== userId) {
      res
        .status(403)
        .json({ error: "You can only delete your own projects" });
      return;
    }

    await prisma.project.delete({
      where: { id }
    });

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add comment to project
router.post("/:id/comments", async (req, res) => {
  // @ts-ignore
  const userId = req.user?.userId;
  const { id } = req.params;
  const { content } = req.body;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const comment = await prisma.projectComment.create({
      data: {
        projectId: id,
        userId,
        content
      },
      include: {
        user: { select: { id: true, displayName: true } }
      }
    });

    res.status(201).json(comment);
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get project comments
router.get("/:id/comments", async (req, res) => {
  const { id } = req.params;

  try {
    const comments = await prisma.projectComment.findMany({
      where: { projectId: id },
      include: {
        user: { select: { id: true, displayName: true } }
      },
      orderBy: { createdAt: "asc" }
    });

    res.json(comments);
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Toggle upvote on project
router.post("/:id/upvote", async (req, res) => {
  // @ts-ignore
  const userId = req.user?.userId;
  const { id } = req.params;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const existing = await prisma.projectUpvote.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId
        }
      }
    });

    if (existing) {
      // Remove upvote
      await prisma.projectUpvote.delete({
        where: {
          projectId_userId: {
            projectId: id,
            userId
          }
        }
      });
      res.json({ upvoted: false });
    } else {
      // Add upvote
      await prisma.projectUpvote.create({
        data: {
          projectId: id,
          userId
        }
      });
      res.json({ upvoted: true });
    }
  } catch (error) {
    console.error("Toggle upvote error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get project upvote count
router.get("/:id/upvotes", async (req, res) => {
  const { id } = req.params;

  try {
    const count = await prisma.projectUpvote.count({
      where: { projectId: id }
    });

    res.json({ count });
  } catch (error) {
    console.error("Get upvotes error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add member directly (owner only)
router.post("/:id/members", async (req, res) => {
  // @ts-ignore
  const userId = req.user?.userId;
  const { id } = req.params;
  const { userId: memberUserId, roleId } = req.body;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true, isTeam: true }
    });

    if (!project) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    if (project.ownerId !== userId) {
      res.status(403).json({ error: "Only project owner can add members" });
      return;
    }

    if (!project.isTeam) {
      res.status(400).json({ error: "This is not a team project" });
      return;
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: memberUserId
        }
      }
    });

    if (existingMember) {
      res.status(400).json({ error: "User is already a member of this team" });
      return;
    }

    // Add member
    await prisma.projectMember.create({
      data: {
        projectId: id,
        userId: memberUserId,
        roleId: roleId || null
      }
    });

    // Decrement role requirement count if roleId provided
    if (roleId) {
      const roleReq = await prisma.teamRoleRequirement.findUnique({
        where: {
          projectId_roleId: {
            projectId: id,
            roleId: roleId
          }
        }
      });

      if (roleReq && roleReq.count > 0) {
        await prisma.teamRoleRequirement.update({
          where: {
            projectId_roleId: {
              projectId: id,
              roleId: roleId
            }
          },
          data: {
            count: roleReq.count - 1
          }
        });
      }
    }

    res.status(201).json({ message: "Member added successfully" });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Request to join team with specific role
router.post("/:id/join", async (req, res) => {
  // @ts-ignore
  const userId = req.user?.userId;
  const { id } = req.params;
  const { roleId, message } = req.body;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId
        }
      }
    });

    if (existingMember) {
      res
        .status(400)
        .json({ error: "You are already a member of this team" });
      return;
    }

    // Check if already requested
    const existingRequest = await prisma.joinRequest.findFirst({
      where: {
        projectId: id,
        requesterId: userId,
        status: "PENDING"
      }
    });

    if (existingRequest) {
      res.status(400).json({ error: "You already have a pending request" });
      return;
    }

    // Create join request
    const joinRequest = await prisma.joinRequest.create({
      data: {
        projectId: id,
        requesterId: userId,
        requestedRoleId: roleId,
        message,
        status: "PENDING"
      }
    });

    // Create notification for project owner
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true, title: true }
    });

    const requester = await prisma.user.findUnique({
      where: { id: userId },
      select: { displayName: true }
    });

    if (project && requester) {
      await prisma.notification.create({
        data: {
          userId: project.ownerId,
          type: "TEAM_JOIN_REQUEST",
          payload: {
            projectId: id,
            projectTitle: project.title,
            requesterId: userId,
            requesterName: requester.displayName,
            joinRequestId: joinRequest.id,
            roleId
          }
        }
      });
    }

    res.status(201).json(joinRequest);
  } catch (error) {
    console.error("Join team error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Accept join request
router.post("/:id/join-requests/:requestId/accept", async (req, res) => {
  // @ts-ignore
  const userId = req.user?.userId;
  const { id, requestId } = req.params;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true, title: true }
    });

    if (!project || project.ownerId !== userId) {
      res
        .status(403)
        .json({ error: "Only project owner can accept requests" });
      return;
    }

    // Get request details
    const request = await prisma.joinRequest.findUnique({
      where: { id: requestId },
      include: { requester: { select: { displayName: true } } }
    });

    if (!request) {
      res.status(400).json({ error: "Invalid request" });
      return;
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: request.requesterId
        }
      }
    });

    // Add member if not already
    if (!existingMember) {
      await prisma.projectMember.create({
        data: {
          projectId: id,
          userId: request.requesterId,
          roleId: request.requestedRoleId
        }
      });
    }

    // Update request status if pending
    if (request.status === "PENDING") {
      await prisma.joinRequest.update({
        where: { id: requestId },
        data: {
          status: "ACCEPTED",
          processedBy: userId,
          processedAt: new Date()
        }
      });
    }

    // Notify requester
    await prisma.notification.create({
      data: {
        userId: request.requesterId,
        type: "TEAM_JOIN_ACCEPTED",
        payload: {
          projectId: id,
          projectTitle: project.title,
          roleId: request.requestedRoleId
        }
      }
    });

    // Decrement role requirement count
    if (request.requestedRoleId) {
      const roleReq = await prisma.teamRoleRequirement.findUnique({
        where: {
          projectId_roleId: {
            projectId: id,
            roleId: request.requestedRoleId
          }
        }
      });

      if (roleReq && roleReq.count > 0) {
        await prisma.teamRoleRequirement.update({
          where: {
            projectId_roleId: {
              projectId: id,
              roleId: request.requestedRoleId
            }
          },
          data: {
            count: roleReq.count - 1
          }
        });
      }
    }

    res.json({ message: "Request accepted" });
  } catch (error) {
    console.error("Accept request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reject join request
router.post("/:id/join-requests/:requestId/reject", async (req, res) => {
  // @ts-ignore
  const userId = req.user?.userId;
  const { id, requestId } = req.params;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Verify project ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true, title: true }
    });

    if (!project || project.ownerId !== userId) {
      res
        .status(403)
        .json({ error: "Only project owner can reject requests" });
      return;
    }

    // Update request status
    await prisma.joinRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        processedBy: userId,
        processedAt: new Date()
      }
    });

    res.json({ message: "Request rejected" });
  } catch (error) {
    console.error("Reject request error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add member to project (owner only)
router.post("/:id/members", async (req, res) => {
  // @ts-ignore
  const userId = req.user?.userId;
  const { id } = req.params;
  const { userId: memberUserId, roleId } = req.body;

  if (!userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    // Verify ownership
    const project = await prisma.project.findUnique({
      where: { id },
      select: { ownerId: true, isTeam: true }
    });

    if (!project || project.ownerId !== userId) {
      res.status(403).json({ error: "Only project owner can add members" });
      return;
    }

    if (!project.isTeam) {
      res
        .status(400)
        .json({ error: "Can only add members to team projects" });
      return;
    }

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId: id,
          userId: memberUserId
        }
      }
    });

    if (existingMember) {
      res.status(400).json({ error: "User is already a member" });
      return;
    }

    // Add member and decrement role requirement in a transaction
    await prisma.$transaction([
      prisma.projectMember.create({
        data: {
          projectId: id,
          userId: memberUserId,
          isOwner: false,
          roleId: roleId
        }
      }),
      prisma.teamRoleRequirement.updateMany({
        where: {
          projectId: id,
          roleId: roleId,
          count: { gt: 0 }
        },
        data: {
          count: { decrement: 1 }
        }
      })
    ]);

    // NO NOTIFICATION - Direct addition as requested
    res.status(201).json({ message: "Member added successfully" });
  } catch (error) {
    console.error("Add member error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
