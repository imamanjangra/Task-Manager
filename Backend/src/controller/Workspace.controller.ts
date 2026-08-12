import { Request, Response } from "express";
import {
  UpdateWorkSpaceBody,
  WorkspaceParamsBody,
} from "../validators/workspace.validator.js";
import { workspace } from "../types/workspace.types.js";
import { prisma } from "../lib/prisma.js";


export const CreateWorkspace = async (
  req: Request<{}, {}, workspace>,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const user_id = req.user?.id as string;

const data = await prisma.$transaction(async (tx) => {

  const result = await tx.workspaces.create({
    data : {
      name : name,
      description : description,
      ownerId : user_id
    }
  })

  await tx.workspace_members.create({
    data : {
      workspaceId : result.id,
      userId : user_id,
      role : "OWNER"
    }
  })

  return result;
})
    res.status(200).json({
      success: true,
      message: "Workshpace created successfully",
      workspace: data,
    });
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown errro" });
    }
  }
};

export const UpdateWorkSpace = async (
 req: Request<WorkspaceParamsBody, {}, UpdateWorkSpaceBody>,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const user_id = req.user?.id;
    const id = req.params.id

    const data = await prisma.workspaces.findFirst({
      where : {
        id : id,
        ownerId : user_id
      }
    })
    
    
    if (!data) {
      res.status(404).json({
        success: false,
        message: "Workspace is not found",
      });
      return;
    }
    
    const workspaceId = data.id;

  await prisma.workspaces.update({
    where : {
      id : workspaceId
    },
    data : {
      name : name ?? data.name,
      description : description ?? data.description
    }
  })

    res.status(200).json({
        success : true,
        message : "Workspace update successfully"
    })
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown errro" });
    }
  }
};

export const GetAllWorkSpace = async (req : Request  , res : Response):Promise<void> => {
   try {
     const user_id = req.user?.id;
     
    const workspaces = await prisma.workspaces.findMany({
      where : {
        workspace_members : {
          some : {
            userId : user_id
          }
        }
      },

      include : {
        _count : {
          select : {
            workspace_members : true,
            boards : true
          }
        }
      }
    })

//     const data = {

//   totalWorkspaces: workspaces.length,

//   workspaces: workspaces.map((workspace) => ({
//     id: workspace.id,
//     name: workspace.name,
//     description: workspace.description,

//     memberCount: workspace._count.workspace_members,
//     boardCount: workspace._count.boards,
//   })),
// };

    
    
     if(workspaces.length === 0){
         res.status(404).json({
             success : false ,
             message : "Workspace is not found" 
         })
         return;
 
     }
 
    res.status(200).json({
  success: true,
  message: "All workspaces found",
  totalWorkspaces: workspaces.length,
  workspaces: workspaces.map((workspace) => ({
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    memberCount: workspace._count.workspace_members,
    boardCount: workspace._count.boards,
  })),
});
   } catch (error) {
     if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown errro" });
    }
   }
}

export const getWorkspaceById = async (req :Request<WorkspaceParamsBody> , res : Response):Promise<void> => {
    try {
        const Workspace_id = req.params.id;
         const user_id = req.user?.id;
      const data = await prisma.workspaces.findFirst({
        where : {
          workspace_members : {
            some : {
              userId : user_id,
              workspaceId : Workspace_id
            }
          }
        },
        include : {
          _count : {
            select : {
              boards : true,
              workspace_members : true
            }
          }
        }
      })  

        if(data === null){
            res.status(404).json({
                success : false,
                message : "workspace is not found"
            })

            return;
        }

        res.status(200).json({
            success : true ,
            workspaces : {
                id : data.id,
                name : data.name,
                description : data.description,
                memberCount : data._count.workspace_members,
                boardCount : data._count.boards
            }
        })


    } catch (error) {
        if (error instanceof Error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, stack: error.stack });
        } else {
        res.status(500).json({ error: "unknown errro" });
        }
    }
}

export const DeleteWorkspace = async (req : Request<WorkspaceParamsBody> , res : Response):Promise<void> =>{
    try {
         const Workspace_id = req.params.id;
         const user_id = req.user?.id;

      const data = await prisma.workspaces.findFirst({
        where : {
          id : Workspace_id,  
          ownerId : user_id
        }
      })  

        if(data === null){
            res.status(404).json({
                success : false,
                message : "workspace is not found"
            })

            return;
        }

        await prisma.workspaces.delete({
            where : {
                id : Workspace_id
            }
        })

        res.status(200).json({
            success : true ,
            message : "delete workspace successfully"
        })
    } catch (error) {
        if (error instanceof Error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, stack: error.stack });
        } else {
        res.status(500).json({ error: "unknown errro" });
        }
    }
}

