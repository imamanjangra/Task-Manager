import { Request, Response } from "express";
import { checkBoardPermission } from "../helpers/boardPermission.js";
import { board_idBody, ListBody, listId_Body } from "../validators/list.validator.js";
import { prisma } from "../lib/prisma.js";


export const createList = async (req : Request<board_idBody , {} , ListBody> , res : Response):Promise<void> => {
    try {
        const {name} = req.body
        const board_id = req.params.board_id;
        const user_id = req.user?.id;
        
         await checkBoardPermission(
            board_id,
            user_id!,
            ["OWNER","ADMIN","USER"]
            );

        
    const data = await prisma.lists.create({
        data  :{
            name : name,
            boardId : board_id,
            createdBy : user_id as string
        }
    })
    res.status(200).json({
        success : true,
        Lists : data
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


export const getAllLists = async (req : Request<board_idBody> , res : Response):Promise<void> => {
    try {
         const board_id = req.params.board_id;
        const user_id = req.user?.id;

        await checkBoardPermission(
            board_id,
            user_id!,
            ["OWNER","ADMIN","USER"]
        )
     
        const data = await prisma.lists.findMany({
            where : {
                boardId : board_id
            },
            orderBy : {
                createdAt : "asc"
            }
        })
     res.status(200).json({
        success : true,
        Lists : data
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

export const getListById = async(req : Request<listId_Body> , res : Response):Promise<void> => {
    try {
        const list_id = req.params.list_id;
        const user_id = req.user?.id;

        const check_list = await prisma.lists.findMany({
            where : {
                id : list_id
            }
        })
        if(check_list.length === 0 ){
            res.status(404).json({
                success : false,
                message : "List not found "
            })
            return;
        }

        const board_id = check_list[0].boardId;

        await checkBoardPermission(
            board_id,
            user_id!,
            ["OWNER","ADMIN","USER"]
        )


    res.status(200).json({
        success : true,
        List : check_list[0]
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

export const updateList = async(req : Request<listId_Body , {} , ListBody> , res : Response):Promise<void> => {
    try {
        const {name} = req.body;
        const list_id = req.params.list_id;
        const user_id = req.user?.id;

        const check_list = await prisma.lists.findMany({
            where : {
                id : list_id
            }
        });

        if(check_list.length === 0 ){
            res.status(404).json({
                success : false,
                message : "List not found "
            })
            return;
        }

        const board_id = check_list[0].boardId;

         await checkBoardPermission(
            board_id,
            user_id!,
            ["OWNER","ADMIN","USER"]
        )
       


    await prisma.lists.update({
        where : {
            id : list_id 
        },
        data : {
            name : name
        }
    })  

    res.status(200).json({
        success : true,
        message : "list updates successfully"
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

export const deleteList = async(req : Request<listId_Body> , res : Response):Promise<void> => {
    try {
        const list_id = req.params.list_id;
        const user_id = req.user?.id;

        const check_list = await prisma.lists.findMany({
            where : {
                id : list_id
            }
        });

        if(check_list.length === 0 ){
            res.status(404).json({
                success : false,
                message : "List not found "
            })
            return;
        }

        const board_id = check_list[0].boardId;

         await checkBoardPermission(
            board_id,
            user_id!,
            ["OWNER","ADMIN","USER"]
        )

    await prisma.lists.delete({
        where : {
            id : list_id
        }
    })

    res.status(200).json({
        success : true,
        message : "list deleted successfully"
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


