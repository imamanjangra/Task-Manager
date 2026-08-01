import { Request, Response } from "express";
import {
  UpdateWorkSpaceBody,
  WorkspaceParamsBody,
} from "../validators/workspace.validator.js";
import { pool } from "../db/index.js";
import { workspace } from "../types/workspace.types.js";


export const CreateWorkspace = async (
  req: Request<{}, {}, workspace>,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const user_id = req.user?.id;

    const result = await pool.query<workspace>(
      `insert into workspaces (name , description  , owner_id) values ($1 , $2 , $3)  RETURNING *`,
      [name, description, user_id],
    );
    await pool.query(`INSERT INTO workspace_members (workspace_id,user_id,role) VALUES ($1,$2,$3) RETURNING *` , [ result.rows[0]?.id , user_id , "owner"])
    res.status(200).json({
      success: true,
      message: "Workshpace created successfully",
      workspace: result.rows[0],
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

    const data = await pool.query(`select * from workspaces where id = $1 AND owner_id = $2`, [
      id, user_id
    ]);
    
    const workspaceId = data.rows[0].id;

    if (!data.rows[0]) {
      res.status(404).json({
        success: false,
        message: "Workspace is not found",
      });
      return;
    }

    await pool.query(
      `
    UPDATE workspaces
    SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $3
  `,
      [name ?? null, description ?? null, workspaceId],
    );

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
 
     const data = await pool.query(`select * from workspaces where owner_id = $1` , [user_id]);
 
     if(data.rowCount === 0){
         res.status(404).json({
             success : false ,
             message : "Workspace is not found" 
         })
         return;
 
     }
 
     res.status(200).json({
         success : true ,
         message : "All workspaces are found",
         Wrokspaces : data.rows
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

export const getWorkspaceById = async (req :Request<WorkspaceParamsBody> , res : Response):Promise<void> => {
    try {
        const Workspace_id = req.params.id;
         const user_id = req.user?.id;
        const data  = await pool.query<WorkspaceParamsBody>(`select * from workspaces where id = $1 AND owner_id = $2` , [Workspace_id , user_id ]);

        if(data.rowCount === 0){
            res.status(404).json({
                success : false,
                message : "workspace is not found"
            })

            return;
        }

        res.status(200).json({
            success : true ,
            workspace : data.rows[0]
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
        const data  = await pool.query<WorkspaceParamsBody>(`select * from workspaces where id = $1 AND owner_id = $2` , [Workspace_id , user_id]);

        if(data.rowCount === 0){
            res.status(404).json({
                success : false,
                message : "workspace is not found"
            })

            return;
        }

        await pool.query(`delete from workspaces where id = $1` , [Workspace_id])

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

