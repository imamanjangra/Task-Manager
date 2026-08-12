import { prisma } from "../lib/prisma.js";

export const checkBoardPermission = async (
  board_id: string,
  user_id: string,
  allowedRoles: string[]
) => {


  const boardResult = await prisma.boards.findFirst({
    where : {
        id : board_id
    }
  });

  if (!boardResult) {
    throw new Error("Board not found");
  }

  const workspace_id = boardResult.workspaceId;


  const memberResult = await prisma.workspace_members.findFirst({
    where : {
        workspaceId : workspace_id,
        userId : user_id
    }
  });

  if (!memberResult) {
    throw new Error("You are not a member of this workspace");
  }

  const role = memberResult.role;

  if (!allowedRoles.includes(role)) {
    throw new Error("Permission denied");
  }

  return {
    workspace_id,
    role
  };
};