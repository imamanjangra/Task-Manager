import { Request, Response } from "express";
import {
  bordBody,
  bordParamsBody,
  bordUserIdBody,
  updateBoardsBody,
} from "../validators/board.validator.js";
import { checkBoardPermission } from "../helpers/boardPermission.js";
import { prisma } from "../lib/prisma.js";

export const createBoard = async (
  req: Request<bordParamsBody, {}, bordBody>,
  res: Response,
): Promise<void> => {
  try {
    const { name, description , image_url } = req.body;
    const workspace_id = req.params.workspace_id;
    const user_id = req.user?.id;

    const workspace_check = await prisma.workspaces.findUnique({
      where : {
        id : workspace_id
      }
    })

    if (workspace_check === null) {
      res.status(404).json({
        success: false,
        message: "Workspace is not found ",
      });
      return;
    }

    const role_check = await prisma.workspace_members.findFirst({
      where : {
        workspaceId : workspace_id,
        userId : user_id
      }
    })
    
    if (role_check === null) {
      res.status(403).json({
        success: false,
        message: "member not found ",
      });
      return;
    }

    const role = role_check.role;

    if (role !== "OWNER" && role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "you can not create a Board ",
      });
      return;
    }

    const data = await prisma.boards.create({
      data : {
        workspaceId : workspace_id,
        name : name,
        description : description,
        createdBy : user_id!,
        image_url : image_url ?? undefined
      }
    })
    

    res.status(200).json({
      success: true,
      Board: data,
    });
    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown erro" });
    }
  }
};

export const GetAllBoards = async (
  req: Request<bordParamsBody>,
  res: Response,
): Promise<void> => {
  try {
    const workspace_id = req.params.workspace_id;
    const user_id = req.user?.id;

    const workspace_check = await prisma.workspaces.findUnique({
      where : {
        id : workspace_id
      }
    });

    if (workspace_check === null) {
      res.status(404).json({
        success: false,
        message: "Workspace is not found ",
      });
      return;
    }

    const role_check = await prisma.workspace_members.findFirst({
      where : {
        workspaceId : workspace_id,
        userId : user_id
      }
    });
    

    if (role_check === null) {
      res.status(403).json({
        success: false,
        message: "member not found ",
      });
      return;
    }

    const role = role_check.role;

    if (role !== "USER" && role !== "ADMIN" && role !== "OWNER") {
      res.status(403).json({
        success: false,
        message: "You have not premistion to see this Board",
      });

      return;
    }

    const data = await prisma.boards.findMany({
      where : {
        workspaceId : workspace_id
      }
    });

    if (data.length === 0) {
      res.status(404).json({
        success: false,
        message: "Board not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      Boards: data,
    });
    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown erro" });
    }
  }
};

export const GetBoardsById = async (
  req: Request<bordUserIdBody>,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    const user_id = req.user?.id;

    await checkBoardPermission(
    id,
    user_id!,
    ["OWNER","ADMIN","USER"]
    );

    const data = await prisma.boards.findUnique({
      where : {
        id : id
      }
    });

    res.status(200).json({
      success: true,
      Board: data,
    });

    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown erro" });
    }
  }
};

export const UpdateBoard = async (
  req: Request<bordUserIdBody, {}, updateBoardsBody>,
  res: Response,
): Promise<void> => {
  try {
    const { name, description } = req.body;
    const id = req.params.id;
    const user_id = req.user?.id;


    await checkBoardPermission(
    id,
    user_id!,
    ["OWNER","ADMIN"]
);


  await prisma.boards.update({
    where : {
      id : id
    },
    data : {
      name : name ?? undefined,
      description : description ?? undefined
    }
  })

    res.status(200).json({
      success: true,
      message: "Board update successfully",
    });

    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown erro" });
    }
  }
};

export const deleteBoard = async (
  req: Request<bordUserIdBody>,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;
    const user_id = req.user?.id;

  await checkBoardPermission(
    id,
    user_id!,
    ["OWNER","ADMIN"]
);

    await prisma.boards.delete({
      where : {
        id : id
      }
    });

    res.status(200).json({
        success : true,
        message : "board deleted "
    })
    return;
  } catch (error) {
    if (error instanceof Error) {
      console.log(error.message);
      res.status(500).json({ message: error.message, stack: error.stack });
    } else {
      res.status(500).json({ error: "unknown error" });
    }
  }
};
