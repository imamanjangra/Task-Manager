import { Request, Response } from "express";
import { checkBoardPermission } from "../helpers/boardPermission.js";
import {
  CardBody,
  UpdateCardBody,
  ListIdBody,
  CardIdBody,
} from "../validators/card.validator.js";
import { prisma } from "../lib/prisma.js";

export const createCard = async (
  req: Request<ListIdBody, {}, CardBody>,
  res: Response
): Promise<void> => {
  try {
    const { title, description, due_date } = req.body;

    const list_id = req.params.list_id;
    const user_id = req.user?.id;

    const list = await prisma.lists.findFirst({
      where : {
        id : list_id
      },
      select :{
        boardId : true
      }
    })

    if (list === null) {
      res.status(404).json({
        success: false,
        message: "List not found",
      });
      return;
    }

    const board_id = list.boardId;

    await checkBoardPermission(
      board_id,
      user_id!,
      ["OWNER", "ADMIN", "USER"]
    );

    const data = await prisma.cards.create({
      data : {
        listId : list_id,
        name : title, 
        description : description ?? null,
        createdBy : user_id as string,                                      
        dueDate : due_date ?? null
      }
    })

    res.status(201).json({
      success: true,
      Card: data,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};


export const getAllCards = async (
  req: Request<ListIdBody>,
  res: Response
): Promise<void> => {
  try {
    const list_id = req.params.list_id;
    const user_id = req.user?.id;

    const list = await prisma.lists.findFirst({
      where : {
        id : list_id
      },
      select : {
        boardId : true
      }
    })

    if (list === null) {
      res.status(404).json({
        success: false,
        message: "List not found",
      });
      return;
    }

    const board_id = list.boardId;

    await checkBoardPermission(
      board_id,
      user_id!,
      ["OWNER", "ADMIN", "USER"]
    );

    const card = await prisma.cards.findMany({
      where : {
        listId : list_id
      }
    })
    res.status(200).json({
      success: true,
      Cards: card,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};


export const getCardById = async (
  req: Request<CardIdBody>,
  res: Response
): Promise<void> => {
  try {
    const card_id = req.params.card_id;
    const user_id = req.user?.id;

    const card = await prisma.cards.findFirst({
      where : {
        id : card_id
      },
      include : {
        list : {
          select : {
            boardId : true
          }
        }
      }
    })

    if (card === null) {
      res.status(404).json({
        success: false,
        message: "Card not found",
      });
      return;
    }

    await checkBoardPermission(
      card.list.boardId,
      user_id!,
      ["OWNER", "ADMIN", "USER"]
    );

    res.status(200).json({
      success: true,
      Card: card,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

export const updateCard = async (
  req: Request<CardIdBody, {}, UpdateCardBody>,
  res: Response
): Promise<void> => {
  try {
    const card_id = req.params.card_id;
    const user_id = req.user?.id;

    const { title, description, due_date } = req.body;

      const card = await prisma.cards.findFirst({
        where : {
          id : card_id
        },
        include : {
          list : {
            select : {
              boardId : true
            }
          }
        }
      })
    if (card === null) {
      res.status(404).json({
        success: false,
        message: "Card not found",
      });
      return;
    }

    await checkBoardPermission(
      card.list.boardId,
      user_id!,
      ["OWNER", "ADMIN", "USER"]
    );


    const data = await prisma.cards.update({
      where : {
        id : card_id
      },
      data : {
        name : title ?? undefined,
        description : description ?? undefined,
        dueDate : due_date ?? undefined
      }
    })

    res.status(200).json({
      success: true,
      Card: data,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};


export const deleteCard = async (
  req: Request<CardIdBody>,
  res: Response
): Promise<void> => {
  try {
    const card_id = req.params.card_id;
    const user_id = req.user?.id;

    const card = await prisma.cards.findFirst({
      where: {
        id: card_id
      },
      include: {
        list: {
          select: {
            boardId: true
          }
        }
      }
    });

    if (card === null) {
      res.status(404).json({
        success: false,
        message: "Card not found",
      });
      return;
    }

    await checkBoardPermission(
      card.list.boardId,
      user_id!,
      ["OWNER", "ADMIN", "USER"]
    );

    await prisma.cards.delete({
      where: {
        id: card_id
      }
    });

    res.status(200).json({
      success: true,
      message: "Card deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
};

export const toggleCardComplete = async (
    req: Request<CardIdBody>,
    res: Response
): Promise<void> => {
    try {

        const { card_id } = req.params;
        const user_id = req.user?.id;

        await checkBoardPermission(
      card_id,
      user_id!,
      ["OWNER", "ADMIN", "USER"]
      );


        const data = await prisma.cards.update({
          where: {
            id: card_id
          },
          data: {
            isCompleted: {
              not: undefined
            }
          }
        });

        res.status(200).json({
            success: true,
            card: data
        });

    } catch (error) {

        if (error instanceof Error) {
            res.status(500).json({
                success: false,
                message: error.message
            });
        }

    }
};