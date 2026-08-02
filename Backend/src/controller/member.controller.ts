import { Request, Response } from "express";
// import { memberCreateBody } from "../validators/member.validator.js";
import { pool } from "../db/index.js";
import { membertype } from "../types/member.types.js";
import { memberParamsBody, workspaceParamsBody } from "../validators/member.validator.js";


export const inviteMember  = async(req : Request <memberParamsBody , {} , membertype> , res : Response):Promise<void> => {
    try {
        const {receiver_email , role  } = req.body;
        const user_id = req.user?.id;
        const workspace_id = req.params.id;

        // workspace chek 
        const Workspace_exist = await pool.query(`SELECT id FROM workspaces WHERE id=$1;` , [workspace_id])

        if(Workspace_exist.rowCount == 0){
            res.status(404).json({
                success : false,
                message : "Workspace is not found"
            })
            return
        }
        // inveting user check 
        const User_exist = await pool.query<membertype>(`SELECT * FROM users WHERE email = $1`, [
              receiver_email,
            ]);

            if (User_exist.rowCount === 0) {
               res.status(404).json({
                success: false,
                message: "Receiver not found",
              });
              return;
            }

        const receiver_id = User_exist.rows[0]?.id;
        // chek for both are not same 

        if (receiver_id === user_id) {
        res.status(400).json({
            success: false,
            message: "You cannot invite yourself.",
        })
        return;
        }

        // chek who can send req to only admin or owner 
        const Role_check = await pool.query(`select role from workspace_members where workspace_id=$1 AND user_id = $2` , [workspace_id , user_id])
        const member = Role_check.rows[0];

      if (!member || (member.role !== "admin" && member.role !== "owner")) {
            res.status(404).json({
                success : false ,
                message : "you can not send invetation to any one "
            })
            return;
        }


        const memberChek = await pool.query(`SELECT 1 FROM workspace_members WHERE workspace_id = $1 AND user_id = $2;` , [workspace_id , receiver_id]);

        if(memberChek.rowCount == 1){
            res.status(400).json({
                success : false,
                message : "member is alread exist "
            })
            return;
        }

        // check into exist in workspace list 
     const exist_frnd = await pool.query(`SELECT * FROM workspace_invitations WHERE workspace_id = $1 AND receiver_id = $2 AND sender_id  = $3 AND status = 'pending'`, [
      workspace_id , receiver_id , user_id
    ]);

    if(exist_frnd.rowCount !== 0){
        res.status(400).json({
            success : false,
            message : "request is send already"
        })
        return ;
    }



    // req send 
    const result = await pool.query(`insert into workspace_invitations (workspace_id  , sender_id  , receiver_id  , role) values ($1 , $2 , $3 , $4 ) RETURNING *` , [workspace_id , user_id , receiver_id , role])

    res.status(200).json({
        success : true ,
        invitation : result.rows[0]
    })


    } catch (error) {
         if (error instanceof Error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, stack: error.stack });
        } else {
        res.status(500).json({ error: "unknown erro" });
        }
    }
}


export const request_get = async (req : Request , res : Response):Promise<void> => {
    try {
      
        const user_id = req.user?.id;                                                                                                       
        console.log("Workspace router loaded");
        const result = await pool.query<membertype>(`
                select * from workspace_invitations where receiver_id = $1 AND status = $2
            ` , [user_id , "pending"])

    if (!result.rowCount) {
       res.status(404).json({ message: "request not found" });
       return
        }

        res.status(200).json({
            success : true ,
            invetation : result.rows[0]
        })
        return
    } catch (error) {
        if (error instanceof Error) {
        console.log(error.message);
        res.status(500).json({ message: error.message, stack: error.stack });
        } else {
        res.status(500).json({ error: "unknown erro" });
        }
    }
}

export const acceptReq = async (
  req: Request<memberParamsBody>,
  res: Response
): Promise<void> => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const user_id = req.user?.id;
    const { id } = req.params;

    const invitationResult = await client.query(
      `
      SELECT *
      FROM workspace_invitations
      WHERE id=$1
      AND receiver_id=$2
      `,
      [id, user_id]
    );

    if (invitationResult.rowCount === 0) {
      await client.query("ROLLBACK");

      res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
      return;
    }

    const invitation = invitationResult.rows[0];

    if (invitation.status !== "pending") {
      await client.query("ROLLBACK");

      res.status(400).json({
        success: false,
        message: "Invitation already handled",
      });
      return;
    }

    const alreadyMember = await client.query(
      `
      SELECT 1
      FROM workspace_members
      WHERE workspace_id=$1
      AND user_id=$2
      `,
      [invitation.workspace_id, user_id]
    );

    if (alreadyMember.rowCount) {
      await client.query("ROLLBACK");

      res.status(400).json({
        success: false,
        message: "User is already a member",
      });
      return;
    }

    await client.query(
      `
      UPDATE workspace_invitations
      SET status='accepted'
      WHERE id=$1
      `,
      [id]
    );

    await client.query(
      `
      INSERT INTO workspace_members
      (workspace_id,user_id,role)
      VALUES ($1,$2,$3)
      `,
      [
        invitation.workspace_id,
        user_id,
        invitation.role,
      ]
    );

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: "Invitation accepted",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Unknown error",
      });
    }
  } finally {
    client.release();
  }
};

export const rejectReq = async (
  req: Request<memberParamsBody>,
  res: Response
): Promise<void> => {
  try {
    const user_id = req.user?.id;
    const { id } = req.params;

    const result = await pool.query(
      `
      SELECT *
      FROM workspace_invitations
      WHERE id=$1
      AND receiver_id=$2
      `,
      [id, user_id]
    );

    if (result.rowCount === 0) {
      res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
      return;
    }

    const invitation = result.rows[0];

    if (invitation.status !== "pending") {
      res.status(400).json({
        success: false,
        message: "Invitation already handled",
      });
      return;
    }

    await pool.query(
      `
      UPDATE workspace_invitations
      SET status='rejected'
      WHERE id=$1
      `,
      [id]
    );

    res.status(200).json({
      success: true,
      message: "Invitation rejected",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Unknown error",
      });
    }
  }
};


export const getMembers = async (
  req: Request<workspaceParamsBody>,
  res: Response
): Promise<void> => {

  try {

    const { workspace_id } = req.params;
    const user_id = req.user?.id;


    const workspaceExist = await pool.query(
      `
      SELECT id 
      FROM workspaces
      WHERE id=$1
      `,
      [workspace_id]
    );


    if(workspaceExist.rowCount === 0){

      res.status(404).json({
        success:false,
        message:"Workspace not found"
      });

      return;
    }



    const isMember = await pool.query(
      `
      SELECT 1
      FROM workspace_members
      WHERE workspace_id=$1
      AND user_id=$2
      `,
      [
        workspace_id,
        user_id
      ]
    );


    if(isMember.rowCount === 0){

      res.status(403).json({
        success:false,
        message:"You are not a member of this workspace"
      });

      return;
    }



    const data = await pool.query(
      `
      SELECT * 
      FROM workspace_members wm

      JOIN users u
      ON wm.user_id=u.id

      WHERE wm.workspace_id=$1

      ORDER BY
      CASE
        WHEN wm.role='owner' THEN 1
        WHEN wm.role='admin' THEN 2
        ELSE 3
      END
      `,
      [workspace_id]
    );


    res.status(200).json({
      success:true,
      members:data.rows
    });

    return;


  } catch(error){

    if(error instanceof Error){

      res.status(500).json({
        success:false,
        message:error.message
      });

    }else{

      res.status(500).json({
        success:false,
        message:"Unknown error"
      });
    }
  }
};



export const leaveWorkspace = async (
    req: Request<workspaceParamsBody>,
    res: Response
): Promise<void> => {

    const client = await pool.connect();

    try {

        const { workspace_id } = req.params;
        const user_id = req.user?.id;


        await client.query("BEGIN");


        // check user membership
        const memberResult = await client.query(
            `
            SELECT role
            FROM workspace_members
            WHERE workspace_id=$1
            AND user_id=$2
            `,
            [
                workspace_id,
                user_id
            ]
        );


        if(memberResult.rowCount === 0){

            await client.query("ROLLBACK");

            res.status(404).json({
                success:false,
                message:"You are not a member of this workspace"
            });

            return;
        }


        const member = memberResult.rows[0];



        // owner cannot leave if others exist
        if(member.role === "owner") {


            const otherMembers = await client.query(
                `
                SELECT COUNT(*)
                FROM workspace_members
                WHERE workspace_id=$1
                AND user_id != $2
                `,
                [
                    workspace_id,
                    user_id
                ]
            );


            const count = Number(
                otherMembers.rows[0].count
            );


            if(count > 0){

                await client.query("ROLLBACK");

                res.status(400).json({
                    success:false,
                    message:"Transfer ownership before leaving workspace"
                });

                return;
            }


            // optional:
            // delete workspace if owner is the only user

            await client.query(
                `
                DELETE FROM workspaces
                WHERE id=$1
                `,
                [
                    workspace_id
                ]
            );


        } 
        else {


            // remove normal member/admin

            await client.query(
                `
                DELETE FROM workspace_members
                WHERE workspace_id=$1
                AND user_id=$2
                `,
                [
                    workspace_id,
                    user_id
                ]
            );

        }



        await client.query("COMMIT");


        res.status(200).json({
            success:true,
            message:"Successfully left workspace"
        });


    } catch(error){

        await client.query("ROLLBACK");


        if(error instanceof Error){

            res.status(500).json({
                success:false,
                message:error.message
            });

        }else{

            res.status(500).json({
                success:false,
                message:"Unknown error"
            });

        }

    } finally {

        client.release();

    }

};