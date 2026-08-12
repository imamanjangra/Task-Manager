import { Request, Response } from "express";
import { membertype } from "../types/member.types.js";
import { memberParamsBody, workspaceParamsBody } from "../validators/member.validator.js";
import { prisma } from "../lib/prisma.js";


export const inviteMember  = async(req : Request <memberParamsBody , {} , membertype> , res : Response):Promise<void> => {
    try {
        const {receiver_email , role  } = req.body;
        const user_id = req.user?.id as string;
        const workspace_id = req.params.id;

        const workspace_exist = await prisma.workspaces.findUnique({
            where : {
                id : workspace_id
            }
        })
        
        if(workspace_exist === null){
            res.status(404).json({
                success : false,
                message : "Workspace is not found"
            })
            return
        }

        
        const User_exist = await prisma.user.findUnique({
          where : {
            email : receiver_email
          }
        })
        
        if (User_exist === null) {
           res.status(404).json({
            success: false,
            message: "Receiver not found",
          });
          return;
        }

        const receiver_id = User_exist?.id;
      

        if (receiver_id === user_id) {
        res.status(400).json({
            success: false,
            message: "You cannot invite yourself.",
        })
        return;
        }

        const Role_check = await prisma.workspace_members.findFirst({
            where : {
                workspaceId : workspace_id,
                userId : user_id
            }
        })

        const member = Role_check;

      if (!member || (member.role !== "ADMIN" && member.role !== "OWNER")) {
            res.status(404).json({
                success : false ,
                message : "you can not send invetation to any one "
            })
            return;
        }


        const memberChek = await prisma.workspace_members.findFirst({
            where : {
                workspaceId : workspace_id,
                userId : receiver_id
            }
        })
        
        if(memberChek){
            res.status(400).json({
                success : false,
                message : "member is alread exist "
            })
            return;
        }


    const exist_frnd = await prisma.workspace_invitations.findFirst({
        where : {
            workspaceId : workspace_id,
            receiverId : receiver_id,
            senderId : user_id,
            status : "pending"
        }
    })

    if(exist_frnd){
        res.status(400).json({
            success : false,
            message : "request is send already"
        })
        return ;
    }



    // req send 

    const result = await prisma.workspace_invitations.create({
        data : {
            workspaceId : workspace_id,
            senderId : user_id,
            receiverId : receiver_id,
            role : role
        }
    })

    res.status(200).json({
        success : true ,
        invitation : result
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

        const result = await prisma.workspace_invitations.findMany({
            where : {
                receiverId : user_id,
                status : "pending"
            }
        })

    if (!result.length) {
       res.status(404).json({ message: "request not found" });
       return
        }

        res.status(200).json({
            success : true ,
            invetation : result[0]
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
 

 try {
    const user_id = req.user?.id;
    const { id } = req.params;

    if (!user_id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      const invitation = await tx.workspace_invitations.findFirst({
        where: {
          id,
          receiverId: user_id,
        },
      });

      if (!invitation) {
        throw new Error("Invitation not found");
      }

      if (invitation.status !== "pending") {
        throw new Error("Invitation already handled");
      }

      const alreadyMember = await tx.workspace_members.findFirst({
        where: {
          workspaceId: invitation.workspaceId,
          userId: user_id,
        },
      });

      if (alreadyMember) {
        throw new Error("User is already a member");
      }

      await tx.workspace_invitations.update({
        where: {
          id,
        },
        data: {
          status: "accepted",
        },
      });

      await tx.workspace_members.create({
        data: {
          workspaceId: invitation.workspaceId,
          userId: user_id,
          role: invitation.role,
        },
      });
    });

    res.status(200).json({
      success: true,
      message: "Invitation accepted",
    })
  }
    catch (error) {
  

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

export const rejectReq = async (
  req: Request<memberParamsBody>,
  res: Response
): Promise<void> => {
  try {
    const user_id = req.user?.id;
    const { id } = req.params;

    

    const result = await prisma.workspace_invitations.findMany({
      where : {
        id : id,
        receiverId : user_id
      }
    })


    if (result === null) {
      res.status(404).json({
        success: false,
        message: "Invitation not found",
      });
      return;
    }

    const invitation = result[0];

    if (invitation.status !== "pending") {
      res.status(400).json({
        success: false,
        message: "Invitation already handled",
      });
      return;
    }

    await prisma.workspace_invitations.update({
      where: {
        id
      },
      data: {
        status: "rejected"
      }
    });
    

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


    const workspaceExist = await prisma.workspaces.findUnique({
      where : {
        id : workspace_id
      }
    })

    if(workspaceExist === null){

      res.status(404).json({
        success:false,
        message:"Workspace not found"
      });

      return;
    }



    const isMember = await prisma.workspace_members.findFirst({
      where : {
        workspaceId : workspace_id,
        userId : user_id
      }
    })




    if(isMember === null){

      res.status(403).json({
        success:false,
        message:"You are not a member of this workspace"
      });

      return;
    }



    const data = await prisma.workspace_members.findMany({
      where : {
        workspaceId : workspace_id
      },
      orderBy : [
        {
          role : "asc"
        } 
      ],
      include : {
        user : true
      }
      
    })


    res.status(200).json({
      success:true,
      members:data
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
  try {
    const { workspace_id } = req.params;
    const user_id = req.user?.id;

    // Check authentication
    if (!user_id) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // 1. Check membership
      const member = await tx.workspace_members.findFirst({
        where: {
          workspaceId: workspace_id,
          userId: user_id,
        },
      });

      if (!member) {
        throw new Error("You are not a member of this workspace");
      }

      // 2. Owner logic
      if (member.role === "OWNER") {
        // Check whether other members exist
        const otherMembers = await tx.workspace_members.count({
          where: {
            workspaceId: workspace_id,
            NOT: {
              userId: user_id,
            },
          },
        });

        // Owner cannot leave while other members exist
        if (otherMembers > 0) {
          throw new Error(
            "Transfer ownership before leaving workspace"
          );
        }

        // Owner is the only member
        // Delete workspace
        await tx.workspaces.delete({
          where: {
            id: workspace_id ,
          },
        });

        return;
      }

      // 3. Normal member/admin leaves
      await tx.workspace_members.deleteMany({
        where: {
          workspaceId: workspace_id,
          userId: user_id,
        },
      });
    });

    // Response AFTER transaction succeeds
    res.status(200).json({
      success: true,
      message: "Successfully left workspace",
    });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "You are not a member of this workspace") {
        res.status(404).json({
          success: false,
          message: error.message,
        });
        return;
      }

      if (
        error.message ===
        "Transfer ownership before leaving workspace"
      ) {
        res.status(400).json({
          success: false,
          message: error.message,
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: "Unknown error",
    });
  }
}