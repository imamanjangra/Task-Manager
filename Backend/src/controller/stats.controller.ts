import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const workspaceStats = async(req : Request , res : Response):Promise<void> => {
try{
   const userId = req.user?.id as string;

   const [
  workspaceCount,
  boardCount,
  taskCount
] = await prisma.$transaction([
  prisma.workspaces.count({
    where : {
      workspace_members : {
        some : {
          userId : userId
        }
      }
    }
  }),

  prisma.boards.count({
    where : {
      workspace : {
        workspace_members : {
          some : {
            userId : userId
          }
        }
      }
    }
  }),

  prisma.card_members.count({
    where : {
      user : {
        id : userId
      }
    }
  })
])

 const stats = {
  workspaces: workspaceCount,
  boards: boardCount,
  tasks: taskCount,
};

res.status(200).json({
  success: true,
  stats: stats
})

}
catch(error){
  res.status(500).json({ error: "Failed to fetch workspace stats" });
}
}