import { Request, Response } from "express";
import { checkCardPermission } from "../helpers/cardPremission.js";
import { CardBody, ListIdBody } from "../validators/card_member.validator.js";
import { prisma } from "../lib/prisma.js";


export const AssignMember = async(req : Request<ListIdBody , {} , CardBody> , res : Response):Promise<void> => {
    try {
        const card_id = req.params.card_id;
        const assigned_by = req.user?.id;

        const {user_id}  = req.body;

         await checkCardPermission(
            card_id,
            assigned_by!,
        );
        
        const check = await prisma.card_members.findFirst({
            where : {
                cardId : card_id,
                userId : user_id
            }
        })

        if(check){
         res.status(400).json({
            success:false,
            message:"Member already assigned"
        });
        return;
        }

        const data = await prisma.card_members.create({
            data : {
                cardId : card_id,
                assignedBy : assigned_by as string,
                userId : user_id
            }
        });

        res.status(200).json({
            success : true,
            card_member : data
        })
        return;

    } catch (error) {
         if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    }
}

export const RemoveMember = async(req : Request<ListIdBody> , res : Response):Promise<void> => {
    try {
        const id = req.params.card_id;
        const user_id = req.user?.id;

    
        const card = await prisma.card_members.findFirst({
            where : {
                id : id
            }
        })  

        if(!card){
            res.status(403).json({
                success : false,
                message : "card not found"
        })
        return;
    }

        const card_id = card.cardId;
        
         await checkCardPermission(
            card_id,
            user_id!,
        );

        await prisma.card_members.delete({
            where : {
                id : id
            }
        })

        res.status(200).json({
            success : true,
            message : "remove member"
        })

    } catch (error) {
          if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
    }
}

export const AssignedMember = async (req : Request<ListIdBody> , res : Response):Promise<void> => {
    try {
    const card_id = req.params.card_id;
    const user_id = req.user?.id;
        
     await checkCardPermission(
            card_id,
            user_id!,
        );

    const data = await prisma.card_members.findMany({
        where : {
            cardId : card_id
        }
    })

    res.status(200).json({
        success : true,
        card_members : data
    })
    return;

    } catch (error) {
          if (error instanceof Error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    } 
    }
}